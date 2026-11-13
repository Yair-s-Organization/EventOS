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
  EstadoBoleto,
  EstadoEvento,
  EstadoSubEvento,
  TipoCuentaUsuario,
  type EventoOrganizadorDetalle,
  type EventoOrganizadorDetalleSubevento,
  type InvitadoEventoItem,
  type MisEventosItem,
  type Ponente,
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
import { StorageService } from '../../../common/storage/storage.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../../reservas/services/mail.service';
import {
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

  private obtenerPosterUrl(poster?: string | null): string | null {
    if (!poster) return null;
    return poster.startsWith('http://') || poster.startsWith('https://')
      ? poster
      : this.storageService.publicUrl(poster);
  }

  private async contarBoletosValidosPorSubevento(
    subEventoIds: number[],
  ): Promise<Map<number, number>> {
    const boletosPorSubevento = new Map<number, number>();
    if (subEventoIds.length === 0) {
      return boletosPorSubevento;
    }

    const conteos: { idSubEvento: number; total: string }[] =
      await this.dataSource.query(
        `SELECT ae."idSubEvento", COUNT(b."idBoleto") as total
         FROM "asistenteEvento" ae
         INNER JOIN "boleto" b ON ae."idBoleto" = b."idBoleto"
         WHERE ae."idSubEvento" = ANY($1) AND b."idEstadoBoleto" = $2
         GROUP BY ae."idSubEvento"`,
        [subEventoIds, EstadoBoleto.VALIDO],
      );

    for (const row of conteos) {
      boletosPorSubevento.set(Number(row.idSubEvento), Number(row.total));
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

    const boletosPorSubevento =
      await this.contarBoletosValidosPorSubevento(subEventoIds);

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
      const cupoMaximo = primerSub?.recinto?.aforo ?? 0;
      const boletosEmitidos = subeventos.reduce(
        (acc, sub) => acc + (boletosPorSubevento.get(sub.idSubEvento) || 0),
        0,
      );

      return {
        claveOrden: calcularClaveOrdenProximo(subeventosMapeados, ahoraCdmx),
        item: {
          idEvento: evento.idEvento,
          nombre: evento.nombre,
          descripcion: evento.descripcion,
          justificacion: evento.justificacion,
          poster: evento.poster,
          posterUrl: this.obtenerPosterUrl(evento.poster),
          idAlcance: evento.idAlcance,
          idEstadoEvento: evento.idEstadoEvento,
          cupoMaximo,
          boletosEmitidos,
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
    const boletosPorSubevento =
      await this.contarBoletosValidosPorSubevento(subEventoIds);

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
    const subEventosDetallados: EventoOrganizadorDetalleSubevento[] =
      subeventos.map((sub) => {
        const emitidos = boletosPorSubevento.get(sub.idSubEvento) || 0;
        boletosActivosCount += emitidos;

        return {
          idSubEvento: sub.idSubEvento,
          nombre: sub.nombre,
          descripcion: sub.descripcion,
          accesoQR: sub.accesoQR,
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
                aforo: sub.recinto.aforo,
                idEstadoRecinto: sub.recinto.idEstadoRecinto,
              }
            : null,
          ponentes: ponentesPorSubevento.get(sub.idSubEvento) || [],
          boletosEmitidos: emitidos,
        };
      });

    const primerSub = subeventos[0];
    const cupoMaximo = primerSub?.recinto?.aforo ?? 0;

    const solicitudPendiente =
      await this.solicitudModificacionRepository.findOne({
        where: { idEvento, estado: 'Pendiente' },
      });

    let invitadosDetallados: InvitadoEventoItem[] | undefined = undefined;
    if (evento.idAlcance === AlcanceEvento.PRIVADO) {
      const invitaciones = await this.invitacionRepository.find({
        where: { idEvento },
        relations: { usuario: true },
        order: { idInvitacionEvento: 'ASC' },
      });

      const ahora = Date.now();
      const OCHO_HORAS_MS = 8 * 60 * 60 * 1000;

      invitadosDetallados = invitaciones.map((inv) => {
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
          idUsuario: inv.idUsuario,
          nombreCompleto,
          correo: usr?.correo ?? '',
          fechaUltimoEnvio: inv.fechaUltimoEnvio
            ? new Date(inv.fechaUltimoEnvio).toISOString()
            : '',
          puedeReenviar,
          horasRestantesCooldown,
        };
      });
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
      posterUrl: this.obtenerPosterUrl(evento.poster),
      idAlcance: evento.idAlcance,
      idEstadoEvento: evento.idEstadoEvento,
      motivoRechazo: evento.motivoRechazo ?? null,
      esUrgente: evento.esUrgente,
      motivoUrgencia: evento.motivoUrgencia ?? null,
      idOrganizador: evento.idOrganizador,
      cupoMaximo,
      boletosActivosCount,
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

    // Validar que los subeventos existentes que cambian de recinto no superen el aforo con boletos activos
    for (const subPropuesto of dto.subeventos) {
      if (subPropuesto.idSubEvento) {
        const existente = (evento.subEventos || []).find(
          (s) => s.idSubEvento === subPropuesto.idSubEvento,
        );
        if (existente && existente.idRecinto !== subPropuesto.idRecinto) {
          const nuevoRecintoRaw = await this.dataSource.query(
            `SELECT "idRecinto", nombre, aforo FROM recinto WHERE "idRecinto" = $1 LIMIT 1`,
            [subPropuesto.idRecinto],
          );
          if (nuevoRecintoRaw.length > 0) {
            const aforoNuevo = Number(nuevoRecintoRaw[0].aforo);
            const boletosMap = await this.contarBoletosValidosPorSubevento([
              existente.idSubEvento,
            ]);
            const boletosActivos = boletosMap.get(existente.idSubEvento) ?? 0;
            if (boletosActivos > aforoNuevo) {
              throw new ConflictException(
                `La cantidad solicitada excede el aforo máximo de seguridad del recinto. Solo quedan ${aforoNuevo} lugares disponibles.`,
              );
            }
          }
        }
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

    if (posterFile) {
      const posterKey = await this.storageService.upload(
        posterFile,
        'posters',
        'public',
      );
      evento.poster = posterKey;
    } else if (
      dto.poster &&
      typeof dto.poster === 'string' &&
      dto.poster.trim() !== ''
    ) {
      evento.poster = dto.poster.trim();
    }

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

      const correosPorSubEvento = new Map<number, Set<string>>();

      for (const ponenteDto of dto.ponentes) {
        const idSub = ponenteDto.idSubEvento ?? subEventoIdDefault;
        if (!subEventosIdsValidos.has(idSub)) {
          throw new BadRequestException(
            'El subevento asignado al ponente no pertenece a este evento.',
          );
        }

        const correoNormalizado = ponenteDto.correo.trim().toLowerCase();
        let correosSet = correosPorSubEvento.get(idSub);
        if (!correosSet) {
          correosSet = new Set<string>();
          correosPorSubEvento.set(idSub, correosSet);
        }

        if (correosSet.has(correoNormalizado)) {
          throw new ConflictException(
            'El ponente ya se encuentra registrado en el evento seleccionado.',
          );
        }
        correosSet.add(correoNormalizado);
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
            apellidoPa: p.apellidoPa.trim(),
            apellidoMa: p.apellidoMa ? p.apellidoMa.trim() : null,
            correo: p.correo.trim().toLowerCase(),
            idSubEvento: p.idSubEvento ?? subEventoIdDefault,
          }),
        );
        await this.ponenteRepository.save(nuevosPonentes);
      }
    }

    const eventoGuardado = await this.eventoRepository.save(evento);

    return {
      mensaje: 'Operación realizada con éxito.',
      idEvento: eventoGuardado.idEvento,
      nombre: eventoGuardado.nombre,
      descripcion: eventoGuardado.descripcion,
      justificacion: eventoGuardado.justificacion,
      idAlcance: eventoGuardado.idAlcance,
      poster: eventoGuardado.poster,
      posterUrl: this.obtenerPosterUrl(eventoGuardado.poster),
    };
  }

  async agregarInvitadoPrivado(
    idEvento: number,
    idUsuario: number,
    dto: AgregarInvitadoDto,
  ) {
    const evento = await this.eventoRepository.findOne({
      where: { idEvento },
      relations: { subEventos: { recinto: true } },
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

    const correoBuscado = dto.correo.trim().toLowerCase();
    const usuarioDestinatario = await this.usuarioRepository.findOne({
      where: { correo: correoBuscado },
    });

    if (usuarioDestinatario && !usuarioDestinatario.estatus) {
      throw new NotFoundException(
        'No se encontró una cuenta activa para el destinatario del boleto directo.',
      );
    }

    const cupoMaximo = evento.subEventos?.[0]?.recinto?.aforo ?? 0;
    if (cupoMaximo > 0) {
      const totalInvitadosActivos = await this.invitacionRepository.count({
        where: { idEvento },
      });
      if (totalInvitadosActivos >= cupoMaximo) {
        throw new ConflictException(
          'La cantidad solicitada excede el límite disponible.',
        );
      }
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
    const enlaceEvento = `${frontendBaseUrl}/eventos/${idEvento}`;

    if (!usuarioDestinatario) {
      await verificarDominioCorreoValido(correoBuscado);

      const token = this.jwtService.sign(
        {
          correo: correoBuscado,
          idEvento,
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
      );

      const enlaceRegistro = `${frontendBaseUrl}/registro?token=${encodeURIComponent(token)}`;
      try {
        await this.mailService.enviarInvitacionEventoPrivado({
          destinatario: correoBuscado,
          nombreUsuario: '',
          nombreEvento: evento.nombre,
          descripcionEvento: evento.descripcion,
          organizador: nombreOrganizador,
          enlaceEvento,
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
        idEvento,
        idUsuario: usuarioDestinatario.idUsuario,
      },
    });

    if (invitacionPrevia) {
      throw new ConflictException(
        'El destinatario ya cuenta con un boleto activo para este evento.',
      );
    }

    const nuevaInvitacion = this.invitacionRepository.create({
      idEvento,
      idUsuario: usuarioDestinatario.idUsuario,
      fechaUltimoEnvio: new Date(),
    });

    const guardada = await this.invitacionRepository.save(nuevaInvitacion);

    void this.mailService
      .enviarInvitacionEventoPrivado({
        destinatario: usuarioDestinatario.correo,
        nombreUsuario: `${usuarioDestinatario.nombre} ${usuarioDestinatario.apellidoPa}`.trim(),
        nombreEvento: evento.nombre,
        descripcionEvento: evento.descripcion,
        organizador: nombreOrganizador,
        enlaceEvento,
      })
      .catch(() => {});

    const nombreCompleto = `${usuarioDestinatario.nombre} ${usuarioDestinatario.apellidoPa}${usuarioDestinatario.apellidoMa ? ' ' + usuarioDestinatario.apellidoMa : ''}`;

    return {
      mensaje: 'Operación realizada con éxito.',
      invitado: {
        idInvitacionEvento: guardada.idInvitacionEvento,
        idUsuario: guardada.idUsuario,
        nombreCompleto,
        correo: usuarioDestinatario.correo,
        fechaUltimoEnvio: guardada.fechaUltimoEnvio.toISOString(),
        puedeReenviar: false,
        horasRestantesCooldown: 8,
      },
    };
  }

  async reenviarInvitacionPrivada(
    idEvento: number,
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

    if (
      evento.idEstadoEvento === EstadoEvento.CANCELADO ||
      evento.idEstadoEvento === EstadoEvento.FINALIZADO ||
      evento.idEstadoEvento === EstadoEvento.RECHAZADO
    ) {
      throw new ConflictException('Evento finalizado o inactivo.');
    }

    const invitacion = await this.invitacionRepository.findOne({
      where: {
        idInvitacionEvento: idInvitacion,
        idEvento,
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
      const organizador = await this.usuarioRepository.findOneBy({
        idUsuario,
      });
      const nombreOrganizador = organizador
        ? `${organizador.nombre} ${organizador.apellidoPa}`.trim()
        : 'Organizador';

      const frontendBaseUrl = (
        process.env.FRONTEND_URL ?? 'http://localhost:5173'
      ).replace(/\/+$/, '');
      const enlaceEvento = `${frontendBaseUrl}/eventos/${idEvento}`;

      void this.mailService
        .enviarInvitacionEventoPrivado({
          destinatario: invitacion.usuario.correo,
          nombreUsuario: `${invitacion.usuario.nombre} ${invitacion.usuario.apellidoPa}`.trim(),
          nombreEvento: evento.nombre,
          descripcionEvento: evento.descripcion,
          organizador: nombreOrganizador,
          enlaceEvento,
        })
        .catch(() => {});
    }

    return {
      mensaje: 'Operación realizada con éxito.',
      idInvitacionEvento: invitacion.idInvitacionEvento,
      fechaUltimoEnvio: invitacion.fechaUltimoEnvio.toISOString(),
      horasRestantesCooldown: 8,
      puedeReenviar: false,
    };
  }

  async revocarInvitacionPrivada(
    idEvento: number,
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

    await this.invitacionRepository.delete({
      idInvitacionEvento: idInvitacion,
      idEvento,
    });

    return {
      mensaje: 'Operación realizada con éxito.',
      idInvitacionEvento: idInvitacion,
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

    if (dto.soloVerificar) {
      return {
        asignadoDirecto: false,
        invitacionEnviada: false,
        mensaje: 'El usuario aún no está registrado.',
      };
    }

    await verificarDominioCorreoValido(correo);

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

