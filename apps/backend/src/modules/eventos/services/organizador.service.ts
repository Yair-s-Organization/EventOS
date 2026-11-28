import { randomUUID } from 'crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import {
  AlcanceEvento,
  calcularCapacidadEfectiva,
  calcularImpactoCambioSubevento,
  esLaboratorioRecinto,
  esModalidadConQr,
  EstadoBoleto,
  EstadoEvento,
  EstadoSubEvento,
  ModalidadAcceso,
  TipoCuentaUsuario,
  type EventoOrganizadorDetalle,
  type EventoOrganizadorDetalleSubevento,
  type FalloEnvioInvitacionItem,
  type ImpactoCambioSubevento,
  type InvitadoEventoItem,
  type MisEventosItem,
  type OmitidoInvitacionItem,
  type Ponente,
  type ResultadoCargaMasivaInvitados,
  type SubEventoResumen,
} from '@eventos/shared';
import { EventoEntity } from '../entities/evento.entity';
import { PonenteEntity } from '../entities/ponente.entity';
import { SubEventoEntity } from '../entities/subevento.entity';
import { SolicitudModificacionEntity } from '../entities/solicitudModificacion.entity';
import { InvitacionEventoEntity } from '../entities/invitacionEvento.entity';
import { UsuarioEntity } from '../../auth/entities/usuario.entity';
import { SolicitudesService } from './solicitudes.service';
import { ModificarLogisticaDto } from '../dto/modificarLogistica.dto';
import { ActualizarInfoGeneralDto } from '../dto/actualizarInfoGeneral.dto';
import { AgregarInvitadoDto } from '../dto/invitadoPrivado.dto';
import { AgregarInvitadosMasivoDto } from '../dto/agregarInvitadosMasivo.dto';
import { StorageService } from '../../../common/storage/storage.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../../reservas/services/mail.service';
import {
  EMAIL_REGEX,
  registrarInvitacionPendiente,
  verificarDominioCorreoValido,
} from '../../../common/utils/correo.util';
import { AgregarPersonalLogisticaDto } from '../dto/agregarPersonalLogistica.dto';
import {
  calcularClaveOrdenProximo,
  compararClavesOrdenProximo,
  obtenerAhoraCdmx,
} from '../../../common/utils/fecha-cdmx.util';

@Injectable()
export class OrganizadorService {
  constructor(
    @InjectRepository(EventoEntity)
    private readonly eventoRepository: Repository<EventoEntity>,
    @InjectRepository(PonenteEntity)
    private readonly ponenteRepository: Repository<PonenteEntity>,
    @InjectRepository(SubEventoEntity)
    private readonly subEventoRepository: Repository<SubEventoEntity>,
    @InjectRepository(SolicitudModificacionEntity)
    private readonly solicitudModificacionRepository: Repository<SolicitudModificacionEntity>,
    @InjectRepository(InvitacionEventoEntity)
    private readonly invitacionRepository: Repository<InvitacionEventoEntity>,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
    private readonly solicitudesService: SolicitudesService,
    private readonly storageService: StorageService,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private async obtenerMetricasPorSubevento(
    subEventoIds: number[],
  ): Promise<
    Map<number, { inscritos: number; ingresados: number; activos: number }>
  > {
    const metricas = new Map<
      number,
      { inscritos: number; ingresados: number; activos: number }
    >();
    if (subEventoIds.length === 0) {
      return metricas;
    }

    const conteos: Array<{
      idSubEvento: number;
      inscritos: number;
      ingresados: number;
      activos: number;
    }> = await this.dataSource.query(
      `SELECT ae."idSubEvento",
              COUNT(b."idBoleto") FILTER (WHERE b."idEstadoBoleto" IN ($2, $3))::int AS inscritos,
              COUNT(b."idBoleto") FILTER (WHERE b."idEstadoBoleto" = $3)::int AS ingresados,
              COUNT(b."idBoleto") FILTER (WHERE b."idEstadoBoleto" = $2)::int AS activos
       FROM "asistenteEvento" ae
       INNER JOIN "boleto" b ON ae."idBoleto" = b."idBoleto"
       WHERE ae."idSubEvento" = ANY($1)
       GROUP BY ae."idSubEvento"`,
      [subEventoIds, EstadoBoleto.VALIDO, EstadoBoleto.UTILIZADO],
    );

    for (const row of conteos) {
      metricas.set(Number(row.idSubEvento), {
        inscritos: Number(row.inscritos),
        ingresados: Number(row.ingresados),
        activos: Number(row.activos),
      });
    }

    return metricas;
  }

  private async contarBoletosValidosPorSubevento(
    subEventoIds: number[],
  ): Promise<Map<number, number>> {
    const metricas = await this.obtenerMetricasPorSubevento(subEventoIds);
    const boletosPorSubevento = new Map<number, number>();
    for (const [idSub, m] of metricas) {
      boletosPorSubevento.set(idSub, m.activos);
    }
    return boletosPorSubevento;
  }

  async obtenerMisEventos(idOrganizador: number): Promise<MisEventosItem[]> {
    const eventos = await this.eventoRepository.find({
      where: { idOrganizador },
      relations: {
        subEventos: {
          fecha: true,
          recinto: true,
        },
      },
      order: { idEvento: 'DESC' },
    });

    if (eventos.length === 0) {
      return [];
    }

    const subEventoIds = eventos
      .flatMap((e) => e.subEventos || [])
      .filter((s) => s.estado !== EstadoSubEvento.CANCELADO)
      .map((s) => s.idSubEvento);

    const idsRecinto = eventos
      .flatMap((e) => e.subEventos || [])
      .filter((s) => s.estado !== EstadoSubEvento.CANCELADO)
      .map((s) => s.idRecinto);

    const [metricasPorSubevento, labsAforoMap] = await Promise.all([
      this.obtenerMetricasPorSubevento(subEventoIds),
      this.obtenerAforosRealesLaboratorios(idsRecinto),
    ]);

    const ahoraCdmx = obtenerAhoraCdmx();

    const elementos = eventos.map((evento) => {
      const subeventos = (evento.subEventos || [])
        .filter((s) => s.estado !== EstadoSubEvento.CANCELADO)
        .sort((a, b) => {
          const fechaA = a.fecha?.fecha
            ? `${a.fecha.fecha}T${a.fecha.horaInicio || '00:00'}`
            : '';
          const fechaB = b.fecha?.fecha
            ? `${b.fecha.fecha}T${b.fecha.horaInicio || '00:00'}`
            : '';
          return fechaA.localeCompare(fechaB);
        });

      const subeventosMapeados: SubEventoResumen[] = subeventos.map((sub) => ({
        idSubEvento: sub.idSubEvento,
        nombre: sub.nombre,
        fecha: sub.fecha ? sub.fecha.fecha : null,
        horaInicio: sub.fecha ? sub.fecha.horaInicio : null,
        horaFin: sub.fecha ? sub.fecha.horaFin : null,
        nombreRecinto: sub.recinto ? sub.recinto.nombre : null,
      }));

      const primerSub = subeventos[0] || null;
      const aforoPrimerSub = this.resolverAforoRealRecinto(
        primerSub?.recinto,
        labsAforoMap,
      );
      const cupoMaximo = primerSub
        ? calcularCapacidadEfectiva(
            primerSub.cupoMaximo,
            aforoPrimerSub,
            primerSub.idModalidadAcceso,
          )
        : 0;
      const boletosEmitidos = subeventos.reduce(
        (acc, sub) =>
          acc + (metricasPorSubevento.get(sub.idSubEvento)?.activos ?? 0),
        0,
      );
      const inscritosCount = subeventos.reduce(
        (acc, sub) =>
          acc + (metricasPorSubevento.get(sub.idSubEvento)?.inscritos ?? 0),
        0,
      );
      const usaQr = subeventos.some((sub) =>
        esModalidadConQr(sub.idModalidadAcceso),
      );
      const ingresadosCount = usaQr
        ? subeventos.reduce(
            (acc, sub) =>
              esModalidadConQr(sub.idModalidadAcceso)
                ? acc +
                  (metricasPorSubevento.get(sub.idSubEvento)?.ingresados ?? 0)
                : acc,
            0,
          )
        : null;

      return {
        claveOrden: calcularClaveOrdenProximo(subeventosMapeados, ahoraCdmx),
        item: {
          idEvento: evento.idEvento,
          nombre: evento.nombre,
          descripcion: evento.descripcion,
          justificacion: evento.justificacion,
          poster: evento.poster,
          posterUrl: this.storageService.resolvePublicUrl(evento.poster),
          idAlcance: evento.idAlcance,
          idEstadoEvento: evento.idEstadoEvento,
          cupoMaximo,
          boletosEmitidos,
          inscritosCount,
          ingresadosCount,
          subeventos: subeventosMapeados,
        },
      };
    });

    elementos.sort((a, b) => {
      const cmp = compararClavesOrdenProximo(a.claveOrden, b.claveOrden);
      if (cmp !== 0) {
        return cmp;
      }
      return b.item.idEvento - a.item.idEvento;
    });

    return elementos.map(({ item }) => item);
  }

  async obtenerDetalleOrganizador(
    idEvento: number,
    idOrganizador: number,
    rolActor?: string,
  ): Promise<EventoOrganizadorDetalle> {
    const evento = await this.eventoRepository.findOne({
      where: { idEvento },
      relations: {
        subEventos: {
          fecha: true,
          recinto: true,
        },
      },
    });

    if (!evento) {
      throw new NotFoundException('No se encontró el evento solicitado.');
    }

    if (
      evento.idOrganizador !== idOrganizador &&
      rolActor !== TipoCuentaUsuario.SUBDIRECCION
    ) {
      throw new ForbiddenException(
        'No tienes permisos para administrar este evento.',
      );
    }

    const subeventos = (evento.subEventos || [])
      .filter((s) => s.estado !== EstadoSubEvento.CANCELADO)
      .sort((a, b) => {
      const fechaA = a.fecha?.fecha
        ? `${a.fecha.fecha}T${a.fecha.horaInicio || '00:00'}`
        : '';
      const fechaB = b.fecha?.fecha
        ? `${b.fecha.fecha}T${b.fecha.horaInicio || '00:00'}`
        : '';
      return fechaA.localeCompare(fechaB);
    });

    const subEventoIds = subeventos.map((s) => s.idSubEvento);
    const [metricasPorSubevento, labsAforoMap] = await Promise.all([
      this.obtenerMetricasPorSubevento(subEventoIds),
      this.obtenerAforosRealesLaboratorios(subeventos.map((s) => s.idRecinto)),
    ]);

    const ponentesPorSubevento = new Map<number, Ponente[]>();
    if (subEventoIds.length > 0) {
      const ponentes = await this.ponenteRepository.find({
        where: subEventoIds.map((id) => ({ idSubEvento: id })),
      });
      for (const ponente of ponentes) {
        const lista = ponentesPorSubevento.get(ponente.idSubEvento) || [];
        lista.push({
          idPonente: ponente.idPonente,
          nombre: ponente.nombre,
          apellidoPa: ponente.apellidoPa,
          apellidoMa: ponente.apellidoMa,
          correo: ponente.correo,
          idSubEvento: ponente.idSubEvento,
        });
        ponentesPorSubevento.set(ponente.idSubEvento, lista);
      }
    }

    let boletosActivosCount = 0;
    let totalInscritos = 0;
    let totalIngresados = 0;
    let tieneQr = false;

    const subEventosDetallados: EventoOrganizadorDetalleSubevento[] =
      subeventos.map((sub) => {
        const m = metricasPorSubevento.get(sub.idSubEvento) ?? {
          inscritos: 0,
          ingresados: 0,
          activos: 0,
        };
        const usaQr = esModalidadConQr(sub.idModalidadAcceso);
        const aforoRealRecinto = this.resolverAforoRealRecinto(
          sub.recinto,
          labsAforoMap,
        );
        const cupoEfectivo = calcularCapacidadEfectiva(
          sub.cupoMaximo,
          aforoRealRecinto,
          sub.idModalidadAcceso,
        );
        boletosActivosCount += m.activos;
        totalInscritos += m.inscritos;
        if (usaQr) {
          tieneQr = true;
          totalIngresados += m.ingresados;
        }

        return {
          idSubEvento: sub.idSubEvento,
          nombre: sub.nombre,
          descripcion: sub.descripcion,
          idModalidadAcceso: sub.idModalidadAcceso,
          cupoMaximo: sub.cupoMaximo ?? null,
          cupoEfectivo,
          estado: sub.estado,
          fecha: sub.fecha
            ? {
                idFecha: sub.fecha.idFecha,
                fecha: sub.fecha.fecha,
                horaInicio: sub.fecha.horaInicio,
                horaFin: sub.fecha.horaFin,
              }
            : null,
          recinto: sub.recinto
            ? {
                idRecinto: sub.recinto.idRecinto,
                nombre: sub.recinto.nombre,
                aforo: aforoRealRecinto,
                idEstadoRecinto: sub.recinto.idEstadoRecinto,
              }
            : null,
          ponentes: ponentesPorSubevento.get(sub.idSubEvento) || [],
          boletosEmitidos: m.activos,
          inscritosCount: m.inscritos,
          ingresadosCount: usaQr ? m.ingresados : null,
        };
      });

    const primerSubDet = subEventosDetallados[0];
    const cupoMaximo = primerSubDet?.cupoEfectivo ?? 0;

    const solicitudPendiente =
      await this.solicitudModificacionRepository.findOne({
        where: { idEvento, estado: 'Pendiente' },
      });

    let invitadosPorSubevento = new Map<number, InvitadoEventoItem[]>();
    let invitadosDetallados: InvitadoEventoItem[] | undefined = undefined;
    if (evento.idAlcance === AlcanceEvento.PRIVADO) {
      const invitaciones =
        subEventoIds.length > 0
          ? await this.invitacionRepository.find({
              where: { idSubEvento: In(subEventoIds) },
              relations: { usuario: true },
              order: { idInvitacionEvento: 'ASC' },
            })
          : [];

      invitadosDetallados = invitaciones.map((inv) => {
        const item = this.mapearInvitadoItem(inv);
        const lista = invitadosPorSubevento.get(inv.idSubEvento) ?? [];
        lista.push(item);
        invitadosPorSubevento.set(inv.idSubEvento, lista);
        return item;
      });
    }

    for (const subDet of subEventosDetallados) {
      const subOriginal = subeventos.find(
        (s) => s.idSubEvento === subDet.idSubEvento,
      );
      subDet.tokenInvitacion = subOriginal?.tokenInvitacion;
      subDet.enlaceInvitacionActivo = Boolean(
        subOriginal?.enlaceInvitacionActivo,
      );
      if (evento.idAlcance === AlcanceEvento.PRIVADO) {
        subDet.invitados = invitadosPorSubevento.get(subDet.idSubEvento) ?? [];
      }
    }

    const personalLogisticaRaw = await this.dataSource.query(
      `SELECT u."idUsuario", u.nombre, u."apellidoPa", u."apellidoMa", u.correo, u."tipoCuenta"
       FROM "eventoPersonalLogistica" epl
       INNER JOIN usuario u ON epl."idUsuario" = u."idUsuario"
       WHERE epl."idEvento" = $1
       ORDER BY u.nombre ASC`,
      [idEvento],
    );

    const personalLogistica = personalLogisticaRaw.map((u: any) => ({
      idUsuario: Number(u.idUsuario),
      nombreCompleto: `${u.nombre} ${u.apellidoPa}${u.apellidoMa ? ' ' + u.apellidoMa : ''}`.trim(),
      correo: u.correo,
      tipoCuenta: u.tipoCuenta,
    }));

    return {
      idEvento: evento.idEvento,
      nombre: evento.nombre,
      descripcion: evento.descripcion,
      justificacion: evento.justificacion,
      poster: evento.poster,
      posterUrl: this.storageService.resolvePublicUrl(evento.poster),
      idAlcance: evento.idAlcance,
      idEstadoEvento: evento.idEstadoEvento,
      motivoRechazo: evento.motivoRechazo ?? null,
      esUrgente: evento.esUrgente,
      motivoUrgencia: evento.motivoUrgencia ?? null,
      idOrganizador: evento.idOrganizador,
      cupoMaximo,
      boletosActivosCount,
      inscritosCount: totalInscritos,
      ingresadosCount: tieneQr ? totalIngresados : null,
      subEventos: subEventosDetallados,
      solicitudModificacionPendiente: solicitudPendiente
        ? {
            idSolicitudModificacion: solicitudPendiente.idSolicitudModificacion,
            motivoModificacion: solicitudPendiente.motivoModificacion,
            subeventosPropuestos: solicitudPendiente.subeventosPropuestos,
            estado: solicitudPendiente.estado,
          }
        : null,
      invitados: invitadosDetallados,
      personalLogistica,
      logisticaCount: personalLogistica.length,
    };
  }

  async solicitarModificacionLogistica(
    idEvento: number,
    idUsuario: number,
    dto: ModificarLogisticaDto,
    rolActor?: string,
  ) {
    const evento = await this.eventoRepository.findOne({
      where: { idEvento },
      relations: {
        subEventos: {
          fecha: true,
          recinto: true,
        },
      },
    });

    if (!evento) {
      throw new NotFoundException('No se encontró el evento solicitado.');
    }

    const esSubdireccion = rolActor === TipoCuentaUsuario.SUBDIRECCION;

    if (!esSubdireccion && evento.idOrganizador !== idUsuario) {
      throw new ForbiddenException(
        'No tienes permisos para administrar este evento.',
      );
    }

    if (
      evento.idEstadoEvento === EstadoEvento.CANCELADO ||
      evento.idEstadoEvento === EstadoEvento.FINALIZADO ||
      evento.idEstadoEvento === EstadoEvento.RECHAZADO
    ) {
      throw new ConflictException('Evento finalizado o inactivo.');
    }

    if (evento.idEstadoEvento === EstadoEvento.ACEPTADO) {
      const { fechaHoy } = this.solicitudesService.obtenerAhoraCDMX();
      let esUrgente = false;
      for (const sub of evento.subEventos || []) {
        if (sub.fecha?.fecha) {
          const dias = this.solicitudesService.calcularDiasDiferencia(
            sub.fecha.fecha,
            fechaHoy,
          );
          if (dias >= 0 && dias <= 7) {
            esUrgente = true;
            break;
          }
        }
      }

      if (!esUrgente) {
        for (const sub of dto.subeventos) {
          const dias = this.solicitudesService.calcularDiasDiferencia(
            sub.fecha,
            fechaHoy,
          );
          if (dias >= 0 && dias <= 7) {
            esUrgente = true;
            break;
          }
        }
      }

      if (esUrgente && !evento.esUrgente) {
        evento.esUrgente = true;
        await this.eventoRepository.update(idEvento, { esUrgente: true });
      }
    }

    const idsExistentes = (evento.subEventos || []).map((s) => s.idSubEvento);
    const boletosMap =
      await this.contarBoletosValidosPorSubevento(idsExistentes);

    const idsRecintosDestino = [
      ...new Set([
        ...dto.subeventos.map((s) => s.idRecinto),
        ...(evento.subEventos || []).map((s) => s.idRecinto),
      ]),
    ];
    const recintosDestinoRaw =
      idsRecintosDestino.length > 0
        ? await this.dataSource.query(
            `SELECT r."idRecinto",
                    r.aforo,
                    COALESCE((SELECT COUNT(*)::int FROM "estadoEquipo" eq WHERE eq."idRecinto" = r."idRecinto" AND eq.estado = true), 0) AS equipos
             FROM recinto r
             WHERE r."idRecinto" = ANY($1::int[])`,
            [idsRecintosDestino],
          )
        : [];
    const aforoPorRecinto = new Map<number, number>(
      recintosDestinoRaw.map((row: any) => {
        const idRec = Number(row.idRecinto);
        const aforoReal = esLaboratorioRecinto(idRec)
          ? Number(row.equipos)
          : Number(row.aforo);
        return [idRec, aforoReal];
      }),
    );

    const advertenciasImpacto: ImpactoCambioSubevento[] = [];
    for (const subPropuesto of dto.subeventos) {
      if (!subPropuesto.idSubEvento) continue;
      const existente = (evento.subEventos || []).find(
        (s) => s.idSubEvento === subPropuesto.idSubEvento,
      );
      if (!existente) continue;

      const inscritosActivos = boletosMap.get(existente.idSubEvento) ?? 0;
      const aforoRecintoOrigen =
        aforoPorRecinto.get(existente.idRecinto) ??
        existente.recinto?.aforo ??
        0;
      const aforoRecintoDestino = aforoPorRecinto.get(subPropuesto.idRecinto) ?? 0;
      const modalidadDestino =
        subPropuesto.idModalidadAcceso ?? existente.idModalidadAcceso;

      const aforoOrigen = calcularCapacidadEfectiva(
        existente.cupoMaximo,
        aforoRecintoOrigen,
        existente.idModalidadAcceso,
      );
      const aforoDestino = calcularCapacidadEfectiva(
        subPropuesto.cupoMaximo,
        aforoRecintoDestino,
        modalidadDestino,
      );

      const impacto = calcularImpactoCambioSubevento({
        idSubEvento: existente.idSubEvento,
        nombreSubEvento: subPropuesto.nombre || existente.nombre,
        inscritosActivos,
        aforoOrigen,
        aforoDestino,
        idRecintoOrigen: existente.idRecinto,
        idRecintoDestino: subPropuesto.idRecinto,
        modalidadOrigen: existente.idModalidadAcceso as ModalidadAcceso,
        modalidadDestino: modalidadDestino as ModalidadAcceso,
      });

      if (impacto && impacto.inscritosActivos > 0) {
        advertenciasImpacto.push(impacto);
      }
    }

    await this.solicitudesService.validarSubeventos(dto.subeventos, idEvento);

    if (esSubdireccion) {
      await this.solicitudesService.aplicarModificacionLogisticaDirecta(
        idEvento,
        dto.subeventos,
        idUsuario,
      );
      return {
        mensaje: 'Modificación aplicada directamente con éxito.',
        idEvento,
        directo: true,
        advertenciasImpacto,
      };
    }

    const motivoLimpio = dto.motivoModificacion?.trim() ?? '';
    if (!motivoLimpio) {
      throw new BadRequestException(
        'Dato requerido faltante. La justificación no puede estar vacía.',
      );
    }
    if (motivoLimpio.length > 500) {
      throw new BadRequestException(
        'La descripción excede el límite máximo de caracteres permitidos.',
      );
    }

    const solicitudExistente =
      await this.solicitudModificacionRepository.findOne({
        where: { idEvento, estado: 'Pendiente' },
      });

    if (solicitudExistente) {
      solicitudExistente.subeventosPropuestos = dto.subeventos;
      solicitudExistente.motivoModificacion = motivoLimpio;
      const guardada =
        await this.solicitudModificacionRepository.save(solicitudExistente);
      return {
        mensaje:
          'Operación realizada con éxito. Evento en espera de revisión debido a cambio de duración.',
        idSolicitudModificacion: guardada.idSolicitudModificacion,
        idEvento,
        estado: guardada.estado,
        inFlightActualizada: true,
        advertenciasImpacto,
      };
    }

    const nuevaSolicitud = this.solicitudModificacionRepository.create({
      idEvento,
      motivoModificacion: motivoLimpio,
      subeventosPropuestos: dto.subeventos,
      estado: 'Pendiente',
    });

    const guardada =
      await this.solicitudModificacionRepository.save(nuevaSolicitud);

    return {
      mensaje:
        'Operación realizada con éxito. Evento en espera de revisión debido a cambio de duración.',
      idSolicitudModificacion: guardada.idSolicitudModificacion,
      idEvento,
      estado: guardada.estado,
      inFlightActualizada: false,
      advertenciasImpacto,
    };
  }

  async actualizarInfoGeneral(
    idEvento: number,
    idUsuario: number,
    dto: ActualizarInfoGeneralDto,
    posterFile?: Express.Multer.File,
    rolActor?: string,
  ) {
    const evento = await this.eventoRepository.findOne({
      where: { idEvento },
    });

    if (!evento) {
      throw new NotFoundException('No se encontró el evento solicitado.');
    }

    if (
      evento.idOrganizador !== idUsuario &&
      rolActor !== TipoCuentaUsuario.SUBDIRECCION
    ) {
      throw new ForbiddenException(
        'No tienes permisos para administrar este evento.',
      );
    }

    if (
      evento.idEstadoEvento === EstadoEvento.CANCELADO ||
      evento.idEstadoEvento === EstadoEvento.FINALIZADO ||
      evento.idEstadoEvento === EstadoEvento.RECHAZADO
    ) {
      throw new ConflictException('Evento finalizado o inactivo.');
    }

    const posterAnterior = evento.poster;
    let posterNuevo: string | undefined;

    if (posterFile) {
      const posterKey = await this.storageService.upload(
        posterFile,
        'posters',
        'public',
      );
      posterNuevo = posterKey;
      evento.poster = posterKey;
    } else if (
      dto.poster &&
      typeof dto.poster === 'string' &&
      dto.poster.trim() !== ''
    ) {
      evento.poster = dto.poster.trim();
    }

    let eventoGuardado: EventoEntity;
    try {
      const alcanceAnterior = evento.idAlcance;

      if (dto.idSubEvento !== undefined) {
        const subevento = await this.subEventoRepository.findOne({
          where: { idSubEvento: dto.idSubEvento, idEvento },
        });
        if (!subevento) {
          throw new BadRequestException(
            'El subevento especificado no pertenece a este evento.',
          );
        }
        if (dto.nombre !== undefined) {
          subevento.nombre = dto.nombre.trim();
        }
        if (dto.descripcion !== undefined) {
          subevento.descripcion = dto.descripcion.trim();
        }
        await this.subEventoRepository.save(subevento);

        const solicitudPendiente =
          await this.solicitudModificacionRepository.findOne({
            where: { idEvento, estado: 'Pendiente' },
          });
        if (
          solicitudPendiente &&
          Array.isArray(solicitudPendiente.subeventosPropuestos)
        ) {
          solicitudPendiente.subeventosPropuestos =
            solicitudPendiente.subeventosPropuestos.map((prop) =>
              prop.idSubEvento === dto.idSubEvento
                ? {
                    ...prop,
                    ...(dto.nombre !== undefined
                      ? { nombre: dto.nombre.trim() }
                      : {}),
                    ...(dto.descripcion !== undefined
                      ? { descripcion: dto.descripcion.trim() }
                      : {}),
                  }
                : prop,
            );
          await this.solicitudModificacionRepository.save(solicitudPendiente);
        }
      } else {
        if (dto.nombre !== undefined) {
          evento.nombre = dto.nombre.trim();
        }
        if (dto.descripcion !== undefined) {
          evento.descripcion = dto.descripcion.trim();
        }
        if (dto.justificacion !== undefined) {
          evento.justificacion = dto.justificacion.trim();
        }
        if (dto.idAlcance !== undefined) {
          evento.idAlcance = dto.idAlcance;
        }

        if (dto.nombre !== undefined || dto.descripcion !== undefined) {
          const subeventosActivos = await this.subEventoRepository.find({
            where: { idEvento },
          });
          const noCancelados = subeventosActivos.filter(
            (s) => s.estado !== EstadoSubEvento.CANCELADO,
          );
          if (noCancelados.length === 1) {
            const unicoSub = noCancelados[0];
            if (dto.nombre !== undefined) {
              unicoSub.nombre = dto.nombre.trim();
            }
            if (dto.descripcion !== undefined) {
              unicoSub.descripcion = dto.descripcion.trim();
            }
            await this.subEventoRepository.save(unicoSub);
          }
        }
      }

      if (dto.ponentes !== undefined) {
        const subeventos = await this.subEventoRepository.find({
          where: { idEvento },
          order: { idSubEvento: 'ASC' },
        });

        if (subeventos.length === 0 && dto.ponentes.length > 0) {
          throw new BadRequestException(
            'El evento no cuenta con subeventos registrados para asociar ponentes.',
          );
        }

        const subEventosIdsValidos = new Set(
          subeventos.map((s) => s.idSubEvento),
        );
        const subEventoIdDefault = dto.idSubEvento ?? subeventos[0]?.idSubEvento;

        const identificadoresPorSubEvento = new Map<number, Set<string>>();

        for (const ponenteDto of dto.ponentes) {
          const idSub = ponenteDto.idSubEvento ?? subEventoIdDefault;
          if (!subEventosIdsValidos.has(idSub)) {
            throw new BadRequestException(
              'El subevento asignado al ponente no pertenece a este evento.',
            );
          }

          const correoNormalizado = (ponenteDto.correo ?? '').trim().toLowerCase();
          const nombreNormalizado = [
            ponenteDto.nombre,
            ponenteDto.apellidoPa,
            ponenteDto.apellidoMa,
          ]
            .filter(Boolean)
            .join(' ')
            .trim()
            .toLowerCase();
          const claveUnica = correoNormalizado
            ? `correo:${correoNormalizado}`
            : `nombre:${nombreNormalizado}`;

          let clavesSet = identificadoresPorSubEvento.get(idSub);
          if (!clavesSet) {
            clavesSet = new Set<string>();
            identificadoresPorSubEvento.set(idSub, clavesSet);
          }

          if (clavesSet.has(claveUnica)) {
            throw new ConflictException(
              'El ponente ya se encuentra registrado en el evento seleccionado.',
            );
          }
          clavesSet.add(claveUnica);
        }

        const subEventoIdsArray =
          dto.idSubEvento !== undefined
            ? [dto.idSubEvento]
            : [...subEventosIdsValidos];
        if (subEventoIdsArray.length > 0) {
          await this.ponenteRepository.delete({
            idSubEvento: In(subEventoIdsArray),
          });
        }

        if (dto.ponentes.length > 0) {
          const nuevosPonentes = dto.ponentes.map((p) =>
            this.ponenteRepository.create({
              nombre: p.nombre.trim(),
              apellidoPa: (p.apellidoPa ?? '').trim(),
              apellidoMa: p.apellidoMa ? p.apellidoMa.trim() : null,
              correo: (p.correo ?? '').trim().toLowerCase(),
              idSubEvento: p.idSubEvento ?? subEventoIdDefault,
            }),
          );
          await this.ponenteRepository.save(nuevosPonentes);
        }
      }

      const alcanceCambio =
        dto.idSubEvento === undefined &&
        dto.idAlcance !== undefined &&
        dto.idAlcance !== alcanceAnterior;

      if (alcanceCambio) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          eventoGuardado = await queryRunner.manager.save(EventoEntity, evento);

          if (dto.idAlcance === AlcanceEvento.PRIVADO) {
            await queryRunner.manager.query(
              `INSERT INTO "invitacionEvento" ("idSubEvento", "idUsuario")
               SELECT DISTINCT se."idSubEvento", ae."idUsuario"
               FROM "asistenteEvento" ae
               INNER JOIN "subEvento" se ON ae."idSubEvento" = se."idSubEvento"
               INNER JOIN "boleto" b ON ae."idBoleto" = b."idBoleto"
               WHERE se."idEvento" = $1
                 AND se.estado <> $2
                 AND b."idEstadoBoleto" IN ($3, $4)
                 AND ae."idUsuario" <> $5
               ON CONFLICT ("idSubEvento", "idUsuario") DO NOTHING`,
              [
                idEvento,
                EstadoSubEvento.CANCELADO,
                EstadoBoleto.VALIDO,
                EstadoBoleto.UTILIZADO,
                evento.idOrganizador,
              ],
            );
          } else if (alcanceAnterior === AlcanceEvento.PRIVADO) {
            await queryRunner.manager.query(
              `DELETE FROM "invitacionEvento"
               WHERE "idSubEvento" IN (
                 SELECT "idSubEvento" FROM "subEvento" WHERE "idEvento" = $1
               )`,
              [idEvento],
            );
          }

          await queryRunner.commitTransaction();
        } catch (error) {
          await queryRunner.rollbackTransaction();
          throw error;
        } finally {
          await queryRunner.release();
        }
      } else {
        eventoGuardado = await this.eventoRepository.save(evento);
      }
    } catch (error) {
      if (posterNuevo) {
        await this.storageService.deleteSafe(posterNuevo, 'public');
      }
      throw error;
    }

    if (posterAnterior !== eventoGuardado.poster) {
      await this.storageService.deleteSafe(posterAnterior, 'public');
    }

    return {
      mensaje: 'Operación realizada con éxito.',
      idEvento: eventoGuardado.idEvento,
      nombre: eventoGuardado.nombre,
      descripcion: eventoGuardado.descripcion,
      justificacion: eventoGuardado.justificacion,
      idAlcance: eventoGuardado.idAlcance,
      poster: eventoGuardado.poster,
      posterUrl: this.storageService.resolvePublicUrl(eventoGuardado.poster),
    };
  }

  private mapearInvitadoItem(inv: InvitacionEventoEntity): InvitadoEventoItem {
    const ahora = Date.now();
    const OCHO_HORAS_MS = 8 * 60 * 60 * 1000;
    const fechaEnvioMs = inv.fechaUltimoEnvio
      ? new Date(inv.fechaUltimoEnvio).getTime()
      : 0;
    const tiempoTranscurrido = ahora - fechaEnvioMs;
    const puedeReenviar = tiempoTranscurrido >= OCHO_HORAS_MS;
    const msRestantes = Math.max(0, OCHO_HORAS_MS - tiempoTranscurrido);
    const horasRestantesCooldown = puedeReenviar
      ? 0
      : Math.ceil(msRestantes / (60 * 60 * 1000));

    const usr = inv.usuario;
    const nombreCompleto = usr
      ? `${usr.nombre} ${usr.apellidoPa}${usr.apellidoMa ? ' ' + usr.apellidoMa : ''}`
      : 'Invitado';

    return {
      idInvitacionEvento: inv.idInvitacionEvento,
      idSubEvento: inv.idSubEvento,
      idUsuario: inv.idUsuario,
      nombreCompleto,
      correo: usr?.correo ?? '',
      fechaUltimoEnvio: inv.fechaUltimoEnvio
        ? new Date(inv.fechaUltimoEnvio).toISOString()
        : '',
      puedeReenviar,
      horasRestantesCooldown,
    };
  }

  private async obtenerContextoSubeventoPrivado(
    idEvento: number,
    idSubEvento: number,
    idUsuario: number,
  ) {
    const evento = await this.eventoRepository.findOne({
      where: { idEvento },
    });

    if (!evento) {
      throw new NotFoundException('No se encontró el evento solicitado.');
    }

    if (evento.idOrganizador !== idUsuario) {
      throw new ForbiddenException(
        'No tienes permisos para administrar este evento.',
      );
    }

    if (
      evento.idEstadoEvento === EstadoEvento.CANCELADO ||
      evento.idEstadoEvento === EstadoEvento.FINALIZADO ||
      evento.idEstadoEvento === EstadoEvento.RECHAZADO
    ) {
      throw new ConflictException('Evento finalizado o inactivo.');
    }

    if (evento.idAlcance !== AlcanceEvento.PRIVADO) {
      throw new BadRequestException('El evento no cuenta con alcance privado.');
    }

    const subEvento = await this.subEventoRepository.findOne({
      where: { idSubEvento, idEvento },
      relations: { recinto: true, fecha: true },
    });

    if (!subEvento || subEvento.estado === EstadoSubEvento.CANCELADO) {
      throw new NotFoundException('No se encontró la actividad solicitada.');
    }

    const organizador = await this.usuarioRepository.findOneBy({
      idUsuario,
    });
    const nombreOrganizador = organizador
      ? `${organizador.nombre} ${organizador.apellidoPa}`.trim()
      : 'Organizador';

    const frontendBaseUrl = (
      process.env.FRONTEND_URL ?? 'http://localhost:5173'
    ).replace(/\/+$/, '');

    return { evento, subEvento, nombreOrganizador, frontendBaseUrl };
  }

  private construirDatosCorreoSubEvento(
    evento: EventoEntity,
    subEvento: SubEventoEntity,
    nombreOrganizador: string,
    frontendBaseUrl: string,
  ) {
    const enlaceEvento = subEvento.tokenInvitacion
      ? `${frontendBaseUrl}/eventos/privado/${subEvento.tokenInvitacion}`
      : `${frontendBaseUrl}/eventos/${evento.idEvento}/actividades/${subEvento.idSubEvento}`;

    return {
      nombreEvento: evento.nombre,
      descripcionEvento: evento.descripcion,
      organizador: nombreOrganizador,
      enlaceEvento,
      nombreSubEvento: subEvento.nombre,
      fecha: subEvento.fecha?.fecha,
      horaInicio: subEvento.fecha?.horaInicio,
      horaFin: subEvento.fecha?.horaFin,
      nombreRecinto: subEvento.recinto?.nombre,
      esAccesoLibre:
        subEvento.idModalidadAcceso === ModalidadAcceso.ACCESO_LIBRE,
    };
  }

  async agregarInvitadoPrivado(
    idEvento: number,
    idSubEvento: number,
    idUsuario: number,
    dto: AgregarInvitadoDto,
  ) {
    const { evento, subEvento, nombreOrganizador, frontendBaseUrl } =
      await this.obtenerContextoSubeventoPrivado(
        idEvento,
        idSubEvento,
        idUsuario,
      );

    const correoBuscado = dto.correo.trim().toLowerCase();
    const usuarioDestinatario = await this.usuarioRepository.findOne({
      where: { correo: correoBuscado },
    });

    if (usuarioDestinatario && !usuarioDestinatario.estatus) {
      throw new NotFoundException(
        'No se encontró una cuenta activa para el destinatario del boleto directo.',
      );
    }

    const labsAforoMap = await this.obtenerAforosRealesLaboratorios([
      subEvento.idRecinto,
    ]);
    const aforoReal = this.resolverAforoRealRecinto(
      subEvento.recinto,
      labsAforoMap,
    );
    const cupoMaximo = calcularCapacidadEfectiva(
      subEvento.cupoMaximo,
      aforoReal,
      subEvento.idModalidadAcceso,
    );
    const esAccesoLibre =
      subEvento.idModalidadAcceso === ModalidadAcceso.ACCESO_LIBRE;

    if (cupoMaximo > 0 && (!esAccesoLibre || usuarioDestinatario)) {
      const totalInvitadosActivos = await this.invitacionRepository.count({
        where: { idSubEvento },
      });
      if (totalInvitadosActivos >= cupoMaximo) {
        throw new ConflictException(
          'La cantidad solicitada excede el límite disponible.',
        );
      }
    }

    const baseCorreo = this.construirDatosCorreoSubEvento(
      evento,
      subEvento,
      nombreOrganizador,
      frontendBaseUrl,
    );

    if (!usuarioDestinatario) {
      await verificarDominioCorreoValido(correoBuscado);

      if (esAccesoLibre) {
        try {
          await this.mailService.enviarInvitacionEventoPrivado({
            ...baseCorreo,
            destinatario: correoBuscado,
            nombreUsuario: '',
            requiereRegistro: false,
          });
        } catch {
          throw new InternalServerErrorException(
            'No se pudo enviar el correo de invitación. Verifica la dirección o inténtalo de nuevo más tarde.',
          );
        }

        return {
          mensaje: 'Operación realizada con éxito.',
          invitacionEnviada: true,
          esAccesoLibre: true,
          correo: correoBuscado,
        };
      }

      const token = this.jwtService.sign(
        {
          correo: correoBuscado,
          idEvento,
          idSubEvento,
          tipo: 'INVITACION_EVENTO_PRIVADO',
        },
        {
          expiresIn: '48h',
          secret: process.env.JWT_PASS || 'clave_secreta',
        },
      );

      registrarInvitacionPendiente(
        correoBuscado,
        idEvento,
        'INVITACION_EVENTO_PRIVADO',
        idSubEvento,
      );

      const enlaceRegistro = `${frontendBaseUrl}/registro?token=${encodeURIComponent(token)}`;
      try {
        await this.mailService.enviarInvitacionEventoPrivado({
          ...baseCorreo,
          destinatario: correoBuscado,
          nombreUsuario: '',
          requiereRegistro: true,
          enlaceRegistro,
        });
      } catch {
        throw new InternalServerErrorException(
          'No se pudo enviar el correo de invitación. Verifica la dirección o inténtalo de nuevo más tarde.',
        );
      }

      return {
        mensaje: 'Operación realizada con éxito.',
        invitacionEnviada: true,
        correo: correoBuscado,
      };
    }

    const invitacionPrevia = await this.invitacionRepository.findOne({
      where: {
        idSubEvento,
        idUsuario: usuarioDestinatario.idUsuario,
      },
    });

    if (invitacionPrevia) {
      throw new ConflictException(
        'El destinatario ya cuenta con un boleto activo para este evento.',
      );
    }

    const nuevaInvitacion = this.invitacionRepository.create({
      idSubEvento,
      idUsuario: usuarioDestinatario.idUsuario,
      fechaUltimoEnvio: new Date(),
    });

    const guardada = await this.invitacionRepository.save(nuevaInvitacion);

    void this.mailService
      .enviarInvitacionEventoPrivado({
        ...baseCorreo,
        destinatario: usuarioDestinatario.correo,
        nombreUsuario: `${usuarioDestinatario.nombre} ${usuarioDestinatario.apellidoPa}`.trim(),
      })
      .catch(() => {});

    return {
      mensaje: 'Operación realizada con éxito.',
      invitado: {
        ...this.mapearInvitadoItem({
          ...guardada,
          usuario: usuarioDestinatario,
        }),
        puedeReenviar: false,
        horasRestantesCooldown: 8,
      },
    };
  }

  private async obtenerAforosRealesLaboratorios(
    idsRecinto: number[],
  ): Promise<Map<number, number>> {
    const idsLabs = [...new Set(idsRecinto)].filter((id) =>
      esLaboratorioRecinto(id),
    );
    const mapa = new Map<number, number>();
    if (idsLabs.length === 0) {
      return mapa;
    }

    const filas: Array<{ idRecinto: number; total: number }> =
      await this.dataSource.query(
        `SELECT "idRecinto", COUNT(*)::int AS total
         FROM "estadoEquipo"
         WHERE "idRecinto" = ANY($1::int[]) AND estado = true
         GROUP BY "idRecinto"`,
        [idsLabs],
      );

    for (const idLab of idsLabs) {
      mapa.set(idLab, 0);
    }
    for (const fila of filas) {
      mapa.set(Number(fila.idRecinto), Number(fila.total ?? 0));
    }
    return mapa;
  }

  private resolverAforoRealRecinto(
    recinto: { idRecinto: number; aforo: number } | null | undefined,
    labsAforoMap: Map<number, number>,
  ): number {
    if (!recinto) return 0;
    return esLaboratorioRecinto(recinto.idRecinto)
      ? (labsAforoMap.get(recinto.idRecinto) ?? recinto.aforo ?? 0)
      : (recinto.aforo ?? 0);
  }

  private async esperarPausaEnvio(ms: number): Promise<void> {
    if (ms <= 0) return;
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  async agregarInvitadosMasivo(
    idEvento: number,
    idSubEvento: number,
    idUsuario: number,
    dto: AgregarInvitadosMasivoDto,
    pausaEnvioMs = Number(process.env.INVITACION_MASIVA_DELAY_MS ?? 350),
  ): Promise<ResultadoCargaMasivaInvitados> {
    const { evento, subEvento, nombreOrganizador, frontendBaseUrl } =
      await this.obtenerContextoSubeventoPrivado(
        idEvento,
        idSubEvento,
        idUsuario,
      );

    const correosUnicos: string[] = [];
    const vistos = new Set<string>();
    for (const raw of dto.correos ?? []) {
      const normalizado = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
      if (!normalizado || vistos.has(normalizado)) continue;
      vistos.add(normalizado);
      correosUnicos.push(normalizado);
    }

    const labsAforoMap = await this.obtenerAforosRealesLaboratorios([
      subEvento.idRecinto,
    ]);
    const aforoReal = this.resolverAforoRealRecinto(
      subEvento.recinto,
      labsAforoMap,
    );
    const cupoMaximo = calcularCapacidadEfectiva(
      subEvento.cupoMaximo,
      aforoReal,
      subEvento.idModalidadAcceso,
    );
    const totalInvitadosActual = await this.invitacionRepository.count({
      where: { idSubEvento },
    });
    let cupoRestante =
      cupoMaximo > 0 ? Math.max(0, cupoMaximo - totalInvitadosActual) : -1;

    const esAccesoLibre =
      subEvento.idModalidadAcceso === ModalidadAcceso.ACCESO_LIBRE;
    const baseCorreo = this.construirDatosCorreoSubEvento(
      evento,
      subEvento,
      nombreOrganizador,
      frontendBaseUrl,
    );

    const exitosos: InvitadoEventoItem[] = [];
    const pendientesRegistro: string[] = [];
    const omitidos: OmitidoInvitacionItem[] = [];
    const fallidos: FalloEnvioInvitacionItem[] = [];

    for (let idx = 0; idx < correosUnicos.length; idx++) {
      const correo = correosUnicos[idx];

      if (!EMAIL_REGEX.test(correo) || correo.length > 254) {
        fallidos.push({
          correo,
          motivo: 'Formato de correo electrónico inválido.',
        });
        continue;
      }

      const usuarioDestinatario = await this.usuarioRepository.findOne({
        where: { correo },
      });

      if (usuarioDestinatario && !usuarioDestinatario.estatus) {
        omitidos.push({
          correo,
          motivo: 'La cuenta del usuario se encuentra inactiva.',
        });
        continue;
      }

      if (usuarioDestinatario) {
        const invitacionPrevia = await this.invitacionRepository.findOne({
          where: {
            idSubEvento,
            idUsuario: usuarioDestinatario.idUsuario,
          },
        });
        if (invitacionPrevia) {
          omitidos.push({
            correo,
            motivo: 'El usuario ya se encuentra en la lista de invitados.',
          });
          continue;
        }
      }

      if (
        cupoMaximo > 0 &&
        (!esAccesoLibre || Boolean(usuarioDestinatario)) &&
        cupoRestante <= 0
      ) {
        omitidos.push({
          correo,
          motivo: 'Se alcanzó el aforo máximo del recinto.',
        });
        continue;
      }

      let intentoEnvio = false;

      if (!usuarioDestinatario) {
        try {
          await verificarDominioCorreoValido(correo);
        } catch (err: any) {
          fallidos.push({
            correo,
            motivo:
              err?.message ??
              'El dominio del correo no es válido o no tiene servidor de correo.',
          });
          continue;
        }

        intentoEnvio = true;

        if (esAccesoLibre) {
          try {
            await this.mailService.enviarInvitacionEventoPrivado({
              ...baseCorreo,
              destinatario: correo,
              nombreUsuario: '',
              requiereRegistro: false,
            });
            pendientesRegistro.push(correo);
          } catch {
            fallidos.push({
              correo,
              motivo:
                'No se pudo enviar el correo informativo mediante el servidor SMTP.',
            });
          }
        } else {
          const token = this.jwtService.sign(
            {
              correo,
              idEvento,
              idSubEvento,
              tipo: 'INVITACION_EVENTO_PRIVADO',
            },
            {
              expiresIn: '48h',
              secret: process.env.JWT_PASS || 'clave_secreta',
            },
          );
          const enlaceRegistro = `${frontendBaseUrl}/registro?token=${encodeURIComponent(token)}`;

          try {
            await this.mailService.enviarInvitacionEventoPrivado({
              ...baseCorreo,
              destinatario: correo,
              nombreUsuario: '',
              requiereRegistro: true,
              enlaceRegistro,
            });
            registrarInvitacionPendiente(
              correo,
              idEvento,
              'INVITACION_EVENTO_PRIVADO',
              idSubEvento,
            );
            pendientesRegistro.push(correo);
            if (cupoMaximo > 0) {
              cupoRestante = Math.max(0, cupoRestante - 1);
            }
          } catch {
            fallidos.push({
              correo,
              motivo:
                'No se pudo enviar el correo de invitación mediante el servidor SMTP.',
            });
          }
        }
      } else {
        intentoEnvio = true;
        try {
          await this.mailService.enviarInvitacionEventoPrivado({
            ...baseCorreo,
            destinatario: usuarioDestinatario.correo,
            nombreUsuario:
              `${usuarioDestinatario.nombre} ${usuarioDestinatario.apellidoPa}`.trim(),
          });

          const nuevaInvitacion = this.invitacionRepository.create({
            idSubEvento,
            idUsuario: usuarioDestinatario.idUsuario,
            fechaUltimoEnvio: new Date(),
          });
          const guardada =
            await this.invitacionRepository.save(nuevaInvitacion);

          if (cupoMaximo > 0) {
            cupoRestante = Math.max(0, cupoRestante - 1);
          }

          exitosos.push({
            ...this.mapearInvitadoItem({
              ...guardada,
              usuario: usuarioDestinatario,
            }),
            puedeReenviar: false,
            horasRestantesCooldown: 8,
          });
        } catch {
          fallidos.push({
            correo,
            motivo:
              'No se pudo enviar el correo de invitación mediante el servidor SMTP.',
          });
        }
      }

      if (intentoEnvio && idx < correosUnicos.length - 1) {
        await this.esperarPausaEnvio(pausaEnvioMs);
      }
    }

    return {
      mensaje: 'Carga masiva procesada.',
      totalProcesados: correosUnicos.length,
      cupoRestante: cupoMaximo > 0 ? Math.max(0, cupoRestante) : 0,
      exitosos,
      pendientesRegistro,
      omitidos,
      fallidos,
    };
  }

  async reenviarInvitacionPrivada(
    idEvento: number,
    idSubEvento: number,
    idInvitacion: number,
    idUsuario: number,
  ) {
    const { evento, subEvento, nombreOrganizador, frontendBaseUrl } =
      await this.obtenerContextoSubeventoPrivado(
        idEvento,
        idSubEvento,
        idUsuario,
      );

    const invitacion = await this.invitacionRepository.findOne({
      where: {
        idInvitacionEvento: idInvitacion,
        idSubEvento,
      },
      relations: { usuario: true },
    });

    if (!invitacion) {
      throw new NotFoundException('No se encontró la invitación solicitada.');
    }

    const ahora = Date.now();
    const fechaEnvioMs = new Date(invitacion.fechaUltimoEnvio).getTime();
    const transcurrido = ahora - fechaEnvioMs;
    const OCHO_HORAS_MS = 8 * 60 * 60 * 1000;

    if (transcurrido < OCHO_HORAS_MS) {
      const horasRestantes = Math.ceil(
        (OCHO_HORAS_MS - transcurrido) / (60 * 60 * 1000),
      );
      throw new ConflictException(
        `La invitación ya fue enviada recientemente. Disponible en ${horasRestantes} ${horasRestantes === 1 ? 'hora' : 'horas'}.`,
      );
    }

    invitacion.fechaUltimoEnvio = new Date();
    await this.invitacionRepository.save(invitacion);

    if (invitacion.usuario) {
      const baseCorreo = this.construirDatosCorreoSubEvento(
        evento,
        subEvento,
        nombreOrganizador,
        frontendBaseUrl,
      );

      void this.mailService
        .enviarInvitacionEventoPrivado({
          ...baseCorreo,
          destinatario: invitacion.usuario.correo,
          nombreUsuario: `${invitacion.usuario.nombre} ${invitacion.usuario.apellidoPa}`.trim(),
        })
        .catch(() => {});
    }

    return {
      mensaje: 'Operación realizada con éxito.',
      idInvitacionEvento: invitacion.idInvitacionEvento,
      idSubEvento,
      fechaUltimoEnvio: invitacion.fechaUltimoEnvio.toISOString(),
      horasRestantesCooldown: 8,
      puedeReenviar: false,
    };
  }

  async revocarInvitacionPrivada(
    idEvento: number,
    idSubEvento: number,
    idInvitacion: number,
    idUsuario: number,
  ) {
    const evento = await this.eventoRepository.findOne({
      where: { idEvento },
    });

    if (!evento) {
      throw new NotFoundException('No se encontró el evento solicitado.');
    }

    if (evento.idOrganizador !== idUsuario) {
      throw new ForbiddenException(
        'No tienes permisos para administrar este evento.',
      );
    }

    const subEvento = await this.subEventoRepository.findOne({
      where: { idSubEvento, idEvento },
    });

    if (!subEvento) {
      throw new NotFoundException('No se encontró la actividad solicitada.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let boletosCanceladosCount = 0;
    let destinatarioCorreo: string | null = null;
    let nombreAsistente = '';

    try {
      const invitacion = await queryRunner.manager.findOne(
        InvitacionEventoEntity,
        {
          where: { idInvitacionEvento: idInvitacion, idSubEvento },
          relations: { usuario: true },
        },
      );

      if (invitacion) {
        const cancelados: Array<{ idBoleto: number }> =
          await queryRunner.manager.query(
            `UPDATE "boleto"
             SET "idEstadoBoleto" = $1, "idAsiento" = NULL
             WHERE "idEstadoBoleto" = $2
               AND "idBoleto" IN (
                 SELECT ae."idBoleto"
                 FROM "asistenteEvento" ae
                 WHERE ae."idSubEvento" = $3
                   AND ae."idUsuario" = $4
                   AND ae."idBoleto" IS NOT NULL
               )
             RETURNING "idBoleto"`,
            [
              EstadoBoleto.CANCELADO,
              EstadoBoleto.VALIDO,
              idSubEvento,
              invitacion.idUsuario,
            ],
          );

        boletosCanceladosCount = cancelados.length;
        if (invitacion.usuario?.correo) {
          destinatarioCorreo = invitacion.usuario.correo;
          nombreAsistente =
            `${invitacion.usuario.nombre} ${invitacion.usuario.apellidoPa}`.trim();
        }

        await queryRunner.manager.query(
          `DELETE FROM "retencionAsiento"
           WHERE "idUsuario" = $1
             AND "idSubEvento" = $2`,
          [invitacion.idUsuario, idSubEvento],
        );

        await queryRunner.manager.delete(InvitacionEventoEntity, {
          idInvitacionEvento: idInvitacion,
          idSubEvento,
        });
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    if (boletosCanceladosCount > 0 && destinatarioCorreo) {
      void this.mailService.enviarNotificacionBoletoCanceladoPorRevocacion({
        destinatario: destinatarioCorreo,
        nombreAsistente,
        nombreEvento: evento.nombre,
      });
    }

    return {
      mensaje: 'Operación realizada con éxito.',
      idInvitacionEvento: idInvitacion,
      idSubEvento,
      boletosCancelados: boletosCanceladosCount,
    };
  }

  async actualizarEnlaceInvitacion(
    idEvento: number,
    idSubEvento: number,
    idUsuario: number,
    activo: boolean,
  ) {
    const { subEvento } = await this.obtenerContextoSubeventoPrivado(
      idEvento,
      idSubEvento,
      idUsuario,
    );

    subEvento.enlaceInvitacionActivo = activo;
    if (!subEvento.tokenInvitacion) {
      subEvento.tokenInvitacion = randomUUID();
    }
    const guardado = await this.subEventoRepository.save(subEvento);

    return {
      mensaje: 'Operación realizada con éxito.',
      idSubEvento: guardado.idSubEvento,
      tokenInvitacion: guardado.tokenInvitacion,
      enlaceInvitacionActivo: guardado.enlaceInvitacionActivo,
    };
  }

  async regenerarEnlaceInvitacion(
    idEvento: number,
    idSubEvento: number,
    idUsuario: number,
  ) {
    const { subEvento } = await this.obtenerContextoSubeventoPrivado(
      idEvento,
      idSubEvento,
      idUsuario,
    );

    subEvento.tokenInvitacion = randomUUID();
    const guardado = await this.subEventoRepository.save(subEvento);

    return {
      mensaje: 'Enlace de invitación regenerado con éxito.',
      idSubEvento: guardado.idSubEvento,
      tokenInvitacion: guardado.tokenInvitacion,
      enlaceInvitacionActivo: guardado.enlaceInvitacionActivo,
    };
  }

  async cancelarEventoPropio(
    idEvento: number,
    idUsuario: number,
    motivo: string,
  ) {
    return await this.solicitudesService.cancelarSolicitud(
      idEvento,
      motivo,
      idUsuario,
    );
  }

  async agregarPersonalLogistica(
    idEvento: number,
    idUsuarioOrganizador: number,
    dto: AgregarPersonalLogisticaDto,
    rolActor?: string,
  ) {
    const evento = await this.eventoRepository.findOneBy({ idEvento });
    if (!evento) {
      throw new NotFoundException('Evento no encontrado o cancelado.');
    }

    const esSubdireccion = rolActor === TipoCuentaUsuario.SUBDIRECCION;
    if (evento.idOrganizador !== idUsuarioOrganizador && !esSubdireccion) {
      throw new ForbiddenException(
        'No cuenta con los permisos necesarios para registrar personal de logística.',
      );
    }

    if (evento.idEstadoEvento !== EstadoEvento.ACEPTADO) {
      throw new BadRequestException(
        'No es posible asignar personal de logística a un evento que no se encuentra aprobado.',
      );
    }

    const conteoActual = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total FROM "eventoPersonalLogistica" WHERE "idEvento" = $1`,
      [idEvento],
    );
    if ((conteoActual[0]?.total ?? 0) >= 10) {
      throw new BadRequestException(
        'No es posible registrar más personal de logística. El evento ha alcanzado el límite máximo de 10 integrantes.',
      );
    }

    const correo = dto.correo.toLowerCase().trim();
    const usuarioExistente = await this.usuarioRepository.findOneBy({ correo });

    if (usuarioExistente) {
      const yaAsignado = await this.dataSource.query(
        `SELECT 1 FROM "eventoPersonalLogistica" WHERE "idEvento" = $1 AND "idUsuario" = $2 LIMIT 1`,
        [idEvento, usuarioExistente.idUsuario],
      );
      if (yaAsignado.length > 0) {
        throw new ConflictException(
          'El personal de logística ya se encuentra asignado al evento seleccionado.',
        );
      }

      const tieneBoletoActivo = await this.dataSource.query(
        `SELECT 1
         FROM "asistenteEvento" ae
         INNER JOIN "subEvento" se ON ae."idSubEvento" = se."idSubEvento"
         INNER JOIN boleto b ON ae."idBoleto" = b."idBoleto"
         WHERE se."idEvento" = $1
           AND ae."idUsuario" = $2
           AND b."idEstadoBoleto" = $3
         LIMIT 1`,
        [idEvento, usuarioExistente.idUsuario, EstadoBoleto.VALIDO],
      );
      if (tieneBoletoActivo.length > 0) {
        throw new ConflictException(
          'Ya cuentas con un boleto de asistente para este evento. Si deseas postularte como staff, primero debes cancelar tu reserva actual.',
        );
      }

      if (dto.soloVerificar) {
        return {
          asignadoDirecto: true,
          invitacionEnviada: false,
          mensaje: 'Usuario verificado.',
        };
      }

      await this.dataSource.query(
        `INSERT INTO "eventoPersonalLogistica" ("idEvento", "idUsuario") VALUES ($1, $2)`,
        [idEvento, usuarioExistente.idUsuario],
      );

      void this.mailService.enviarConfirmacionAsignacionLogistica({
        destinatario: usuarioExistente.correo,
        nombreUsuario: `${usuarioExistente.nombre} ${usuarioExistente.apellidoPa}`,
        nombreEvento: evento.nombre,
      });

      return {
        asignadoDirecto: true,
        mensaje: 'Operación realizada con éxito.',
      };
    }

    await verificarDominioCorreoValido(correo);

    if (dto.soloVerificar) {
      return {
        asignadoDirecto: false,
        invitacionEnviada: false,
        mensaje: 'El usuario aún no está registrado.',
      };
    }

    const payload = {
      correo,
      idEvento,
      tipo: 'INVITACION_LOGISTICA',
    };
    const token = this.jwtService.sign(payload, {
      expiresIn: '48h',
      secret: process.env.JWT_PASS || 'clave_secreta',
    });

    registrarInvitacionPendiente(correo, idEvento, 'INVITACION_LOGISTICA');

    const frontendBaseUrl = (
      process.env.FRONTEND_URL ?? 'http://localhost:5173'
    ).replace(/\/+$/, '');
    const enlaceActivacion = `${frontendBaseUrl}/registro?token=${encodeURIComponent(token)}`;

    const organizador = await this.usuarioRepository.findOneBy({
      idUsuario: idUsuarioOrganizador,
    });
    const nombreOrganizador = organizador
      ? `${organizador.nombre} ${organizador.apellidoPa}`.trim()
      : 'Organizador';

    try {
      await this.mailService.enviarInvitacionLogistica({
        destinatario: correo,
        nombreEvento: evento.nombre,
        organizador: nombreOrganizador,
        enlaceActivacion,
      });
    } catch {
      throw new InternalServerErrorException(
        'No se pudo enviar el correo de invitación. Verifica la dirección o inténtalo de nuevo más tarde.',
      );
    }

    return {
      asignadoDirecto: false,
      invitacionEnviada: true,
      mensaje: 'Operación realizada con éxito.',
    };
  }

  async revocarPersonalLogistica(
    idEvento: number,
    idUsuarioOrganizador: number,
    idUsuarioLogistica: number,
  ) {
    const evento = await this.eventoRepository.findOneBy({ idEvento });
    if (!evento) {
      throw new NotFoundException('Evento no encontrado o cancelado.');
    }

    if (evento.idOrganizador !== idUsuarioOrganizador) {
      throw new ForbiddenException(
        'No cuenta con los permisos necesarios para administrar este evento.',
      );
    }

    await this.dataSource.query(
      `DELETE FROM "eventoPersonalLogistica" WHERE "idEvento" = $1 AND "idUsuario" = $2`,
      [idEvento, idUsuarioLogistica],
    );

    return {
      mensaje: 'Operación realizada con éxito.',
    };
  }
}

