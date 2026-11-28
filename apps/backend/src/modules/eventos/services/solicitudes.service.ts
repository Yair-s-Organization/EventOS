import { randomUUID } from 'crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import {
  AlcanceEvento,
  calcularCapacidadEfectiva,
  calcularImpactoCambioSubevento,
  clasificarTransicionModalidad,
  esLaboratorioRecinto,
  EstadoBoleto,
  EstadoEvento,
  EstadoRecinto,
  EstadoSubEvento,
  EstadoVerificacion,
  ModalidadAcceso,
  normalizarCupoMaximo,
  TipoCuentaUsuario,
  validarCupoMaximo,
  validarModalidadEnRecinto,
  type ImpactoCambioSubevento,
  type SolicitanteResumen,
  type SubeventoPayload,
  type SubEventoLogisticaPayload,
} from '@eventos/shared';
import { EventoEntity } from '../entities/evento.entity';
import { UsuarioEntity } from '../../auth/entities/usuario.entity';
import { SubEventoEntity } from '../entities/subevento.entity';
import { FechaEntity } from '../entities/fecha.entity';
import { BitacoraEventoEntity } from '../entities/bitacoraEvento.entity';
import { SolicitudModificacionEntity } from '../entities/solicitudModificacion.entity';
import { RecintoEntity } from '../../recintos/entities/recinto.entity';
import { RecintoService } from '../../recintos/services/recinto.service';
import { StorageService } from '../../../common/storage/storage.service';
import { MailService } from '../../reservas/services/mail.service';
import type { CrearSolicitudDto } from '../dto/crearSolicitud.dto';

@Injectable()
export class SolicitudesService {
  private readonly logger = new Logger(SolicitudesService.name);

  constructor(
    @InjectRepository(EventoEntity)
    private readonly eventoRepository: Repository<EventoEntity>,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
    @InjectRepository(SubEventoEntity)
    private readonly subEventoRepository: Repository<SubEventoEntity>,
    @InjectRepository(BitacoraEventoEntity)
    private readonly bitacoraEventoRepository: Repository<BitacoraEventoEntity>,
    @InjectRepository(SolicitudModificacionEntity)
    private readonly solicitudModificacionRepository: Repository<SolicitudModificacionEntity>,
    private readonly recintoService: RecintoService,
    private readonly storageService: StorageService,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) { }

  async verificarUsuario(idUsuario: number): Promise<boolean> {
    const usuario = await this.usuarioRepository.findOneBy({ idUsuario });
    if (
      !usuario ||
      !usuario.estatus ||
      usuario.esVerificado !== EstadoVerificacion.VERIFICADO
    ) {
      return false;
    }
    return true;
  }

  obtenerAhoraCDMX(): { fechaHoy: string; horaActual: string } {
    const ahora = new Date();
    const fechaHoy = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(ahora);
    const horaActual = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Mexico_City',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(ahora);
    return { fechaHoy, horaActual };
  }

  calcularDiasDiferencia(fechaObjetivo: string, fechaBase: string): number {
    const [yBase, mBase, dBase] = fechaBase.split('-').map(Number);
    const [yObj, mObj, dObj] = fechaObjetivo.split('-').map(Number);
    const utcBase = Date.UTC(yBase, mBase - 1, dBase);
    const utcObj = Date.UTC(yObj, mObj - 1, dObj);
    return Math.round((utcObj - utcBase) / (1000 * 60 * 60 * 24));
  }

  private normalizarHora(hora?: string): string {
    if (!hora) return '';
    return hora.length === 5 ? `${hora}:00` : hora;
  }

  calcularEsUrgente(subeventos: Array<{ fecha: string }>): boolean {
    const { fechaHoy } = this.obtenerAhoraCDMX();
    return subeventos.some((sub) => {
      const dias = this.calcularDiasDiferencia(sub.fecha, fechaHoy);
      return dias >= 0 && dias <= 7;
    });
  }

  validarTraslapeInterno(subeventos: SubeventoPayload[]): boolean {
    const { fechaHoy, horaActual } = this.obtenerAhoraCDMX();

    for (let i = 0; i < subeventos.length; i++) {
      const a = subeventos[i];
      const horaInicioA = this.normalizarHora(a.horaInicio);
      const horaFinA = this.normalizarHora(a.horaFin);
      const diasDiferencia = this.calcularDiasDiferencia(a.fecha, fechaHoy);

      if (
        diasDiferencia < 0 ||
        (diasDiferencia === 0 && horaInicioA <= horaActual) ||
        horaInicioA >= horaFinA
      ) {
        throw new BadRequestException(
          'La fecha u horario del evento no es válido. Verifique que la fecha sea futura y que la hora de finalización sea posterior a la hora de inicio.',
        );
      }

      for (let j = i + 1; j < subeventos.length; j++) {
        const b = subeventos[j];
        const horaInicioB = this.normalizarHora(b.horaInicio);
        const horaFinB = this.normalizarHora(b.horaFin);

        if (a.idRecinto === b.idRecinto && a.fecha === b.fecha) {
          if (horaInicioA < horaFinB && horaInicioB < horaFinA) {
            throw new ConflictException(
              'El espacio ya se encuentra solicitado en ese horario dentro de la misma solicitud.',
            );
          }
        }
      }
    }
    return true;
  }

  async consultarColisionBD(
    subevento: SubeventoPayload,
    excluirIdEvento?: number,
    manager: EntityManager = this.dataSource.manager,
  ): Promise<boolean> {
    const qb = manager
      .getRepository(SubEventoEntity)
      .createQueryBuilder('subevento')
      .innerJoin('subevento.fecha', 'fecha')
      .innerJoin('subevento.evento', 'evento')
      .where('subevento.idRecinto = :idRecinto', {
        idRecinto: subevento.idRecinto,
      })
      .andWhere('fecha.fecha = :fecha', { fecha: subevento.fecha })
      .andWhere('subevento.estado != :estadoCancelado', {
        estadoCancelado: EstadoSubEvento.CANCELADO,
      })
      .andWhere('evento.idEstadoEvento IN (:...estadosActivos)', {
        estadosActivos: [EstadoEvento.ACEPTADO, EstadoEvento.ENPROCESO],
      })
      .andWhere('fecha.horaInicio < :horaFin AND fecha.horaFin > :horaInicio', {
        horaInicio: subevento.horaInicio,
        horaFin: subevento.horaFin,
      });

    if (excluirIdEvento !== undefined) {
      qb.andWhere('evento.idEvento != :excluirIdEvento', { excluirIdEvento });
    }

    const colision = await qb.getOne();

    if (colision) {
      throw new ConflictException(
        'El espacio ya se encuentra solicitado o reservado para el horario seleccionado.',
      );
    }

    return true;
  }

  validarSubeventosEnMemoria(subeventos: SubeventoPayload[]): boolean {
    if (!subeventos || subeventos.length === 0) {
      throw new BadRequestException(
        'La solicitud debe contener al menos un subevento.',
      );
    }

    this.validarTraslapeInterno(subeventos);

    const anioActual = new Date().getFullYear();
    const fechaFinSemestre = `${anioActual}-12-19`;

    for (const sub of subeventos) {
      if (sub.fecha > fechaFinSemestre) {
        throw new BadRequestException(
          'La fecha del evento no puede exceder el fin de semestre (19 de diciembre).',
        );
      }
    }

    if (subeventos.length > 1) {
      const fechas = subeventos.map((s) => s.fecha).sort();
      const fechaMin = fechas[0];
      const fechaMax = fechas[fechas.length - 1];
      const duracionDias = this.calcularDiasDiferencia(fechaMax, fechaMin);

      if (duracionDias > 14) {
        throw new BadRequestException(
          'Un evento con varios subeventos no puede exceder los 15 días naturales de duración.',
        );
      }
    }

    return true;
  }

  private resolverModalidadPayload(sub: SubeventoPayload): ModalidadAcceso {
    return (
      sub.idModalidadAcceso ??
      (esLaboratorioRecinto(sub.idRecinto)
        ? ModalidadAcceso.QR_GENERAL
        : ModalidadAcceso.ACCESO_LIBRE)
    );
  }

  private async validarReglasRecintoConManager(
    recinto: RecintoEntity,
    idModalidadAcceso: ModalidadAcceso,
    manager: EntityManager,
    cupoMaximo?: number | null,
  ): Promise<void> {
    if (recinto.idEstadoRecinto !== EstadoRecinto.HABILITADO) {
      throw new ConflictException(
        `El recinto "${recinto.nombre}" no está disponible por encontrarse inhabilitado o en mantenimiento.`,
      );
    }

    const errorModalidad = validarModalidadEnRecinto(
      recinto.idRecinto,
      idModalidadAcceso,
    );
    if (errorModalidad) {
      throw new BadRequestException(errorModalidad);
    }

    if (esLaboratorioRecinto(recinto.idRecinto)) {
      const [{ total }] = await manager.query(
        `SELECT COUNT(*)::int AS total FROM "estadoEquipo" WHERE "idRecinto" = $1 AND estado = true`,
        [recinto.idRecinto],
      );

      if (recinto.aforo !== total) {
        recinto.aforo = total;
        await manager
          .getRepository(RecintoEntity)
          .update(recinto.idRecinto, { aforo: total });
      }

      if (total <= 0) {
        throw new ConflictException(
          `El laboratorio "${recinto.nombre}" no cuenta con equipos de cómputo habilitados disponibles.`,
        );
      }
    }

    const errorCupo = validarCupoMaximo(
      cupoMaximo,
      recinto.aforo,
      idModalidadAcceso,
    );
    if (errorCupo) {
      throw new BadRequestException(errorCupo);
    }
  }

  async validarSubeventos(
    subeventos: SubeventoPayload[],
    excluirIdEvento?: number,
    manager?: EntityManager,
  ): Promise<boolean> {
    this.validarSubeventosEnMemoria(subeventos);

    if (manager) {
      const idsRecintoOrdenados = [
        ...new Set(subeventos.map((s) => s.idRecinto)),
      ].sort((a, b) => a - b);

      const recintoRepo = manager.getRepository(RecintoEntity);
      const recintosBloqueados = new Map<number, RecintoEntity>();

      for (const idRecinto of idsRecintoOrdenados) {
        const recinto = await recintoRepo.findOne({
          where: { idRecinto },
          lock: { mode: 'pessimistic_write' },
        });
        if (!recinto) {
          throw new NotFoundException(
            `El recinto con ID ${idRecinto} no fue encontrado.`,
          );
        }
        recintosBloqueados.set(idRecinto, recinto);
      }

      for (const subeventoActual of subeventos) {
        const recinto = recintosBloqueados.get(subeventoActual.idRecinto)!;
        await this.validarReglasRecintoConManager(
          recinto,
          this.resolverModalidadPayload(subeventoActual),
          manager,
          subeventoActual.cupoMaximo,
        );
        await this.consultarColisionBD(
          subeventoActual,
          excluirIdEvento,
          manager,
        );
      }

      return true;
    }

    for (const subeventoActual of subeventos) {
      await this.recintoService.validarRecinto(
        subeventoActual.idRecinto,
        this.resolverModalidadPayload(subeventoActual),
        subeventoActual.cupoMaximo,
      );

      await this.consultarColisionBD(subeventoActual, excluirIdEvento);
    }

    return true;
  }

  async crearEvento(evento: EventoEntity, subeventos: SubeventoPayload[] = []) {
    const estaVerificado = await this.verificarUsuario(evento.idOrganizador);
    if (!estaVerificado) {
      throw new ForbiddenException(
        'El usuario no cuenta con una verificación previa',
      );
    }

    if (subeventos.length > 0) {
      this.validarSubeventosEnMemoria(subeventos);
      evento.esUrgente = this.calcularEsUrgente(subeventos);
    } else {
      evento.esUrgente = false;
    }

    if (evento.esUrgente) {
      const solicitante = await this.usuarioRepository.findOneBy({
        idUsuario: evento.idOrganizador,
      });
      const esSubdireccion =
        solicitante?.tipoCuenta === TipoCuentaUsuario.SUBDIRECCION ||
        solicitante?.esJefeAcademia;

      const motivo = evento.motivoUrgencia?.trim();
      if (!esSubdireccion && !motivo) {
        throw new BadRequestException(
          'Por favor, completa todos los campos obligatorios resaltados para continuar.',
        );
      }
      if (motivo && motivo.length > 500) {
        throw new BadRequestException(
          'La justificación excede el límite máximo de caracteres permitidos.',
        );
      }
      evento.motivoUrgencia = motivo || null;
    } else {
      evento.motivoUrgencia = null;
    }

    return await this.dataSource.transaction(async (manager) => {
      if (subeventos.length > 0) {
        const idsRecintoOrdenados = [
          ...new Set(subeventos.map((s) => s.idRecinto)),
        ].sort((a, b) => a - b);

        const recintoRepo = manager.getRepository(RecintoEntity);
        const recintosBloqueados = new Map<number, RecintoEntity>();

        for (const idRecinto of idsRecintoOrdenados) {
          const recinto = await recintoRepo.findOne({
            where: { idRecinto },
            lock: { mode: 'pessimistic_write' },
          });
          if (!recinto) {
            throw new NotFoundException(
              `El recinto con ID ${idRecinto} no fue encontrado.`,
            );
          }
          recintosBloqueados.set(idRecinto, recinto);
        }

        for (const subeventoActual of subeventos) {
          const recinto = recintosBloqueados.get(subeventoActual.idRecinto)!;
          await this.validarReglasRecintoConManager(
            recinto,
            this.resolverModalidadPayload(subeventoActual),
            manager,
            subeventoActual.cupoMaximo,
          );
          await this.consultarColisionBD(subeventoActual, undefined, manager);
        }

        const eventoGuardado = await manager.save(EventoEntity, evento);
        const subeventosGuardados: SubEventoEntity[] = [];

        const estadoSubEventoInicial =
          eventoGuardado.idEstadoEvento === EstadoEvento.ACEPTADO
            ? EstadoSubEvento.ACEPTADO
            : EstadoSubEvento.EN_PROCESO;

        for (const sub of subeventos) {
          const fechaGuardada = await manager.save(FechaEntity, {
            fecha: sub.fecha,
            horaInicio: sub.horaInicio,
            horaFin: sub.horaFin,
          });

          const modalidadSub = this.resolverModalidadPayload(sub);
          const recintoSub = recintosBloqueados.get(sub.idRecinto)!;
          const cupoNormalizado = normalizarCupoMaximo(
            sub.cupoMaximo,
            recintoSub.aforo,
            modalidadSub,
          );

          const nuevoSubEvento = await manager.save(SubEventoEntity, {
            nombre: sub.nombre,
            descripcion: sub.descripcion,
            cupoMaximo: cupoNormalizado,
            tokenInvitacion: randomUUID(),
            enlaceInvitacionActivo: false,
            idEvento: eventoGuardado.idEvento,
            idRecinto: sub.idRecinto,
            idFecha: fechaGuardada.idFecha,
            idModalidadAcceso: modalidadSub,
            estado: estadoSubEventoInicial,
          });

          subeventosGuardados.push(nuevoSubEvento);

          await manager.save(BitacoraEventoEntity, {
            idEvento: eventoGuardado.idEvento,
            idSubEvento: nuevoSubEvento.idSubEvento,
            idUsuarioActor: eventoGuardado.idOrganizador,
            idEstadoEvento:
              eventoGuardado.idEstadoEvento ?? EstadoEvento.ENPROCESO,
          });
        }

        return {
          mensaje: 'Operación realizada con éxito.',
          evento: {
            ...eventoGuardado,
            subEventos: subeventosGuardados,
          },
        };
      }

      const eventoGuardado = await manager.save(EventoEntity, evento);
      return {
        mensaje: 'Operación realizada con éxito.',
        evento: {
          ...eventoGuardado,
          subEventos: [],
        },
      };
    });
  }

  private formatearSolicitante(usuario: UsuarioEntity): SolicitanteResumen {
    return {
      idUsuario: usuario.idUsuario,
      nombre: usuario.nombre,
      apellidoPa: usuario.apellidoPa,
      apellidoMa: usuario.apellidoMa,
      nombreCompleto: `${usuario.nombre} ${usuario.apellidoPa}${usuario.apellidoMa ? ' ' + usuario.apellidoMa : ''
        }`,
      correo: usuario.correo,
      esVerificado: usuario.esVerificado,
      tipoCuenta: usuario.tipoCuenta,
      esJefeAcademia: usuario.esJefeAcademia,
    };
  }

  async listarSolicitudesPorEstado(estado?: string) {
    const mapa: Record<string, EstadoEvento> = {
      pendiente: EstadoEvento.ENPROCESO,
      enproceso: EstadoEvento.ENPROCESO,
      aprobado: EstadoEvento.ACEPTADO,
      aceptado: EstadoEvento.ACEPTADO,
      rechazado: EstadoEvento.RECHAZADO,
      cancelado: EstadoEvento.CANCELADO,
      finalizado: EstadoEvento.FINALIZADO,
    };

    const where: { idEstadoEvento?: EstadoEvento } = {};
    if (estado !== undefined && estado !== '') {
      const idEstado = mapa[estado.trim().toLowerCase()];
      if (idEstado === undefined) {
        throw new BadRequestException(`Estado inválido: "${estado}".`);
      }
      where.idEstadoEvento = idEstado;
    }

    const eventos = await this.eventoRepository.find({
      where,
      relations: {
        subEventos: {
          fecha: true,
          recinto: true,
        },
      },
      order: { esUrgente: 'DESC', idEvento: 'DESC' },
    });

    const modificacionesPendientes =
      await this.solicitudModificacionRepository.find({
        where: { estado: 'Pendiente' },
      });
    const mapaModPorEvento = new Map(
      modificacionesPendientes.map((m) => [m.idEvento, m]),
    );

    if (
      (where.idEstadoEvento === EstadoEvento.ENPROCESO ||
        where.idEstadoEvento === undefined) &&
      mapaModPorEvento.size > 0
    ) {
      const idsExistentes = new Set(eventos.map((e) => e.idEvento));
      const idsFaltantes = [...mapaModPorEvento.keys()].filter(
        (id) => !idsExistentes.has(id),
      );
      if (idsFaltantes.length > 0) {
        const eventosConModificacion = await this.eventoRepository.find({
          where: {
            idEvento: In(idsFaltantes),
            idEstadoEvento: EstadoEvento.ACEPTADO,
          },
          relations: {
            subEventos: {
              fecha: true,
              recinto: true,
            },
          },
          order: { esUrgente: 'DESC', idEvento: 'DESC' },
        });
        eventos.push(...eventosConModificacion);
      }
    }

    const idsOrganizadores = [
      ...new Set(eventos.map((evento) => evento.idOrganizador)),
    ];

    const usuarios =
      idsOrganizadores.length > 0
        ? await this.usuarioRepository.find({
          where: { idUsuario: In(idsOrganizadores) },
          select: {
            idUsuario: true,
            nombre: true,
            apellidoPa: true,
            apellidoMa: true,
            correo: true,
            esVerificado: true,
            tipoCuenta: true,
            esJefeAcademia: true,
          },
        })
        : [];

    const mapaSolicitantes = new Map(
      usuarios.map((usuario) => [
        usuario.idUsuario,
        this.formatearSolicitante(usuario),
      ]),
    );

    return eventos.map((evento) => {
      const modPendiente = mapaModPorEvento.get(evento.idEvento) ?? null;
      return {
        ...evento,
        posterUrl: this.storageService.resolvePublicUrl(evento.poster),
        solicitante: mapaSolicitantes.get(evento.idOrganizador) ?? null,
        esModificacion: Boolean(modPendiente),
        solicitudModificacion: modPendiente
          ? {
            idSolicitudModificacion: modPendiente.idSolicitudModificacion,
            motivoModificacion: modPendiente.motivoModificacion,
            subeventosPropuestos: modPendiente.subeventosPropuestos,
            estado: modPendiente.estado,
          }
          : null,
      };
    });
  }

  async obtenerDetalleSolicitud(idEvento: number) {
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
      throw new NotFoundException(
        `No se encontró la solicitud con ID ${idEvento}.`,
      );
    }

    const solicitante = await this.usuarioRepository.findOne({
      where: { idUsuario: evento.idOrganizador },
      select: {
        idUsuario: true,
        nombre: true,
        apellidoPa: true,
        apellidoMa: true,
        correo: true,
        esVerificado: true,
        tipoCuenta: true,
        esJefeAcademia: true,
      },
    });

    const idsSubeventos = (evento.subEventos || []).map((s) => s.idSubEvento);
    const conteoBoletosPorSub = new Map<number, number>();
    if (idsSubeventos.length > 0) {
      const conteos: { idSubEvento: number; total: string }[] =
        await this.dataSource.query(
          `SELECT ae."idSubEvento", COUNT(b."idBoleto")::int AS total
           FROM "asistenteEvento" ae
           INNER JOIN boleto b ON ae."idBoleto" = b."idBoleto"
           WHERE ae."idSubEvento" = ANY($1::int[])
             AND b."idEstadoBoleto" = $2
           GROUP BY ae."idSubEvento"`,
          [idsSubeventos, EstadoBoleto.VALIDO],
        );
      for (const c of conteos) {
        conteoBoletosPorSub.set(Number(c.idSubEvento), Number(c.total));
      }
    }

    const solicitudPendiente =
      await this.solicitudModificacionRepository.findOne({
        where: { idEvento, estado: 'Pendiente' },
      });

    let subeventosPropuestosDetallados = null;
    let actividadesEliminadas: Array<{
      idSubEvento: number;
      nombre: string;
      boletosActivos: number;
    }> = [];

    if (solicitudPendiente) {
      const recintosConEquipos: Array<{
        idRecinto: number;
        nombre: string;
        aforo: number;
        idEstadoRecinto: number;
        equipos: number;
      }> = await this.dataSource.query(
        `SELECT r."idRecinto",
                r.nombre,
                r.aforo,
                r."idEstadoRecinto",
                COALESCE((SELECT COUNT(*)::int FROM "estadoEquipo" eq WHERE eq."idRecinto" = r."idRecinto" AND eq.estado = true), 0) AS equipos
         FROM recinto r`,
      );
      const mapaRecintos = new Map(
        recintosConEquipos.map((r) => {
          const idRec = Number(r.idRecinto);
          const aforoReal = esLaboratorioRecinto(idRec)
            ? Number(r.equipos)
            : Number(r.aforo);
          return [
            idRec,
            {
              idRecinto: idRec,
              nombre: r.nombre,
              aforo: aforoReal,
              idEstadoRecinto: Number(r.idEstadoRecinto),
            },
          ];
        }),
      );
      const mapaSubeventosOriginales = new Map(
        (evento.subEventos || []).map((s) => [s.idSubEvento, s]),
      );
      const idsPropuestos = new Set<number>();

      subeventosPropuestosDetallados = (
        solicitudPendiente.subeventosPropuestos || []
      ).map((prop) => {
        if (prop.idSubEvento) {
          idsPropuestos.add(prop.idSubEvento);
        }
        const rec = mapaRecintos.get(prop.idRecinto);
        const anterior = prop.idSubEvento
          ? mapaSubeventosOriginales.get(prop.idSubEvento)
          : undefined;
        const modalidadDestino = this.resolverModalidadPayload(prop);
        const inscritosActivos = anterior
          ? (conteoBoletosPorSub.get(anterior.idSubEvento) ?? 0)
          : 0;
        const recintoAnteriorInfo = anterior
          ? mapaRecintos.get(anterior.idRecinto)
          : undefined;
        const aforoRecintoDestino = rec?.aforo ?? 0;
        const aforoRecintoAnterior =
          recintoAnteriorInfo?.aforo ?? anterior?.recinto?.aforo ?? 0;
        const capacidadPropuesta = calcularCapacidadEfectiva(
          prop.cupoMaximo,
          aforoRecintoDestino,
          modalidadDestino,
        );
        const capacidadAnterior = anterior
          ? calcularCapacidadEfectiva(
              anterior.cupoMaximo,
              aforoRecintoAnterior,
              anterior.idModalidadAcceso,
            )
          : null;
        const impacto: ImpactoCambioSubevento | null =
          anterior && rec
            ? calcularImpactoCambioSubevento({
                idSubEvento: anterior.idSubEvento,
                nombreSubEvento: prop.nombre || anterior.nombre,
                inscritosActivos,
                aforoOrigen: capacidadAnterior ?? undefined,
                aforoDestino: capacidadPropuesta,
                idRecintoOrigen: anterior.idRecinto,
                idRecintoDestino: prop.idRecinto,
                modalidadOrigen: anterior.idModalidadAcceso,
                modalidadDestino,
              })
            : null;

        return {
          ...prop,
          idModalidadAcceso: modalidadDestino,
          cupoMaximo: normalizarCupoMaximo(
            prop.cupoMaximo,
            aforoRecintoDestino,
            modalidadDestino,
          ),
          cupoEfectivo: capacidadPropuesta,
          cupoMaximoAnterior: anterior?.cupoMaximo ?? null,
          cupoEfectivoAnterior: capacidadAnterior,
          esNuevo: !anterior,
          boletosActivos: inscritosActivos,
          recintoAnterior: recintoAnteriorInfo ?? null,
          modalidadAnterior: anterior ? anterior.idModalidadAcceso : null,
          fechaAnterior: anterior?.fecha?.fecha ?? null,
          horaInicioAnterior: anterior?.fecha?.horaInicio ?? null,
          horaFinAnterior: anterior?.fecha?.horaFin ?? null,
          impacto,
          espacio: rec ?? null,
        };
      });

      actividadesEliminadas = (evento.subEventos || [])
        .filter(
          (s) =>
            s.estado !== EstadoSubEvento.CANCELADO &&
            !idsPropuestos.has(s.idSubEvento),
        )
        .map((s) => ({
          idSubEvento: s.idSubEvento,
          nombre: s.nombre,
          boletosActivos: conteoBoletosPorSub.get(s.idSubEvento) ?? 0,
        }));
    }

    const posterUrl = this.storageService.resolvePublicUrl(evento.poster);

    return {
      idEvento: evento.idEvento,
      nombre: evento.nombre,
      descripcion: evento.descripcion,
      justificacion: evento.justificacion,
      idAlcance: evento.idAlcance,
      idEstadoEvento: evento.idEstadoEvento,
      motivoRechazo: evento.motivoRechazo ?? null,
      esUrgente: evento.esUrgente,
      motivoUrgencia: evento.motivoUrgencia ?? null,
      poster: evento.poster,
      poster_url: posterUrl,
      posterUrl: posterUrl,
      solicitante: solicitante ? this.formatearSolicitante(solicitante) : null,
      esModificacion: Boolean(solicitudPendiente),
      solicitudModificacion: solicitudPendiente
        ? {
          idSolicitudModificacion: solicitudPendiente.idSolicitudModificacion,
          motivoModificacion: solicitudPendiente.motivoModificacion,
          estado: solicitudPendiente.estado,
          subeventosPropuestos: subeventosPropuestosDetallados,
          actividadesEliminadas,
        }
        : null,
      subeventos: (evento.subEventos || []).map((sub) => ({
        idSubEvento: sub.idSubEvento,
        nombre: sub.nombre,
        descripcion: sub.descripcion,
        idModalidadAcceso: sub.idModalidadAcceso,
        cupoMaximo: sub.cupoMaximo ?? null,
        cupoEfectivo: sub.recinto
          ? calcularCapacidadEfectiva(
              sub.cupoMaximo,
              sub.recinto.aforo,
              sub.idModalidadAcceso,
            )
          : null,
        boletosActivos: conteoBoletosPorSub.get(sub.idSubEvento) ?? 0,
        estado: sub.estado,
        idFecha: sub.idFecha,
        fecha: sub.fecha
          ? {
            idFecha: sub.fecha.idFecha,
            fecha: sub.fecha.fecha,
            horaInicio: sub.fecha.horaInicio,
            horaFin: sub.fecha.horaFin,
          }
          : null,
        idRecinto: sub.idRecinto,
        espacio: sub.recinto
          ? {
            idRecinto: sub.recinto.idRecinto,
            nombre: sub.recinto.nombre,
            aforo: sub.recinto.aforo,
            idEstadoRecinto: sub.recinto.idEstadoRecinto,
          }
          : null,
      })),
    };
  }

  async aprobarSolicitud(idEvento: number, idUsuarioActor?: number) {
    const evento = await this.eventoRepository.findOneBy({ idEvento });
    if (!evento) {
      throw new NotFoundException(
        `No se encontró la solicitud con ID ${idEvento}.`,
      );
    }

    const solicitudPendiente =
      await this.solicitudModificacionRepository.findOne({
        where: { idEvento, estado: 'Pendiente' },
      });

    if (solicitudPendiente) {
      await this.aplicarModificacionLogisticaDirecta(
        idEvento,
        solicitudPendiente.subeventosPropuestos,
        idUsuarioActor,
        solicitudPendiente.motivoModificacion,
      );

      return {
        mensaje: 'La solicitud fue aprobada exitosamente.',
        idEvento,
        idEstadoEvento: EstadoEvento.ACEPTADO,
        idSolicitudModificacion: solicitudPendiente.idSolicitudModificacion,
      };
    }

    if (evento.idEstadoEvento !== EstadoEvento.ENPROCESO) {
      throw new ConflictException(
        'La solicitud seleccionada ya no se encuentra pendiente de aprobación. Actualice el listado para continuar.',
      );
    }

    await this.eventoRepository.update(idEvento, {
      idEstadoEvento: EstadoEvento.ACEPTADO,
    });
    await this.subEventoRepository.update(
      { idEvento },
      { estado: EstadoSubEvento.ACEPTADO },
    );

    const subeventos = await this.subEventoRepository.findBy({ idEvento });
    for (const sub of subeventos) {
      await this.bitacoraEventoRepository.save({
        idEvento,
        idSubEvento: sub.idSubEvento,
        idUsuarioActor: idUsuarioActor ?? evento.idOrganizador,
        idEstadoEvento: EstadoEvento.ACEPTADO,
      });
    }

    return {
      mensaje: 'La solicitud fue aprobada exitosamente.',
      idEvento,
      idEstadoEvento: EstadoEvento.ACEPTADO,
    };
  }

  async aplicarModificacionLogisticaDirecta(
    idEvento: number,
    subeventosPropuestos: SubEventoLogisticaPayload[],
    idUsuarioActor?: number,
    motivoModificacion?: string,
  ) {
    this.validarSubeventosEnMemoria(subeventosPropuestos);
    const nuevoEsUrgente = this.calcularEsUrgente(subeventosPropuestos);

    const evento = await this.eventoRepository.findOneBy({ idEvento });
    if (!evento) {
      throw new NotFoundException('Evento no encontrado.');
    }

    const colaCorreoA: Parameters<
      MailService['enviarCorreoACambioRecintoConservado']
    >[0][] = [];
    const colaCorreoB: Parameters<
      MailService['enviarCorreoBCambioModalidadNuevoRegistro']
    >[0][] = [];
    const colaCorreoC: Parameters<
      MailService['enviarCorreoCCambioAccesoLibre']
    >[0][] = [];
    const colaCorreoD: Parameters<
      MailService['enviarCorreoDCancelacionSobrecupoFifo']
    >[0][] = [];

    const subeventosCancelados: {
      idSubEvento: number;
      nombreSubEvento: string;
      asistentes: {
        idUsuario: number;
        correo: string;
        nombre: string;
        apellidoPa: string;
      }[];
    }[] = [];

    await this.dataSource.transaction(async (manager) => {
      const idsRecintoOrdenados = [
        ...new Set(subeventosPropuestos.map((s) => s.idRecinto)),
      ].sort((a, b) => a - b);

      const recintoRepo = manager.getRepository(RecintoEntity);
      const recintosBloqueados = new Map<number, RecintoEntity>();

      for (const idRecinto of idsRecintoOrdenados) {
        const recinto = await recintoRepo.findOne({
          where: { idRecinto },
          lock: { mode: 'pessimistic_write' },
        });
        if (!recinto) {
          throw new NotFoundException(
            `El recinto con ID ${idRecinto} no fue encontrado.`,
          );
        }
        recintosBloqueados.set(idRecinto, recinto);
      }

      for (const subeventoActual of subeventosPropuestos) {
        const recinto = recintosBloqueados.get(subeventoActual.idRecinto)!;
        await this.validarReglasRecintoConManager(
          recinto,
          this.resolverModalidadPayload(subeventoActual),
          manager,
          subeventoActual.cupoMaximo,
        );
        await this.consultarColisionBD(subeventoActual, idEvento, manager);
      }

      const subeventosExistentes = await this.bloquearSubeventosEInvalidarRetenciones(
        manager,
        idEvento,
      );
      const idsConservados = new Set<number>();
      const excedentesFifoPorSubevento = new Map<number, Set<number>>();
      const aforoPorSubevento = new Map<number, number>();

      for (const propuesto of subeventosPropuestos) {
        const existente = propuesto.idSubEvento
          ? subeventosExistentes.find(
              (s) => s.idSubEvento === propuesto.idSubEvento,
            )
          : undefined;

        let idSubEventoAfectado: number;

        if (existente) {
          idsConservados.add(existente.idSubEvento);
          const destinoModalidad =
            propuesto.idModalidadAcceso ?? existente.idModalidadAcceso;
          const cambioRecinto = existente.idRecinto !== propuesto.idRecinto;
          const cambioModalidad =
            existente.idModalidadAcceso !== destinoModalidad;
          const recintoDestino = recintosBloqueados.get(propuesto.idRecinto)!;
          let aforoRecintoAnterior = recintoDestino.aforo ?? 0;
          if (cambioRecinto) {
            const recintoAnterior =
              recintosBloqueados.get(existente.idRecinto) ??
              (await manager.getRepository(RecintoEntity).findOne({
                where: { idRecinto: existente.idRecinto },
              }));
            aforoRecintoAnterior = recintoAnterior?.aforo ?? 0;
          }
          const capacidadAnterior = calcularCapacidadEfectiva(
            existente.cupoMaximo,
            aforoRecintoAnterior,
            existente.idModalidadAcceso,
          );
          const capacidadDestino = calcularCapacidadEfectiva(
            propuesto.cupoMaximo,
            recintoDestino.aforo ?? 0,
            destinoModalidad,
          );
          const cambioCupo = capacidadAnterior !== capacidadDestino;
          const cupoNormalizado = normalizarCupoMaximo(
            propuesto.cupoMaximo,
            recintoDestino.aforo ?? 0,
            destinoModalidad,
          );
          aforoPorSubevento.set(existente.idSubEvento, capacidadDestino);

          if (cambioRecinto || cambioModalidad || cambioCupo) {
            const activos: Array<{
              idBoleto: number;
              idUsuario: number;
              correo: string;
              nombre: string;
              apellidoPa: string;
            }> = await manager.query(
              `SELECT b."idBoleto", u."idUsuario", u.correo, u.nombre, u."apellidoPa"
               FROM "asistenteEvento" ae
               INNER JOIN boleto b ON ae."idBoleto" = b."idBoleto"
               INNER JOIN usuario u ON ae."idUsuario" = u."idUsuario"
               WHERE ae."idSubEvento" = $1
                 AND b."idEstadoBoleto" = $2
               ORDER BY b."fechaGeneracion" ASC, b."idBoleto" ASC
               FOR UPDATE OF b`,
              [existente.idSubEvento, EstadoBoleto.VALIDO],
            );

            if (activos.length > 0) {
              let dentroAforo = activos;

              if (
                destinoModalidad !== ModalidadAcceso.ACCESO_LIBRE &&
                capacidadDestino < activos.length
              ) {
                const limite = Math.max(0, capacidadDestino);
                dentroAforo = activos.slice(0, limite);
                const excedentesFifo = activos.slice(limite);

                if (excedentesFifo.length > 0) {
                  const idsExcedentes = excedentesFifo.map((r) =>
                    Number(r.idBoleto),
                  );
                  await manager.query(
                    `UPDATE boleto
                     SET "idEstadoBoleto" = $1, "idAsiento" = NULL
                     WHERE "idBoleto" = ANY($2::int[])`,
                    [EstadoBoleto.CANCELADO, idsExcedentes],
                  );
                  const setSub =
                    excedentesFifoPorSubevento.get(existente.idSubEvento) ??
                    new Set<number>();
                  for (const exc of excedentesFifo) {
                    setSub.add(Number(exc.idUsuario));
                    if (!exc.correo) continue;
                    colaCorreoD.push({
                      destinatario: exc.correo,
                      nombreAsistente: `${exc.nombre} ${exc.apellidoPa}`.trim(),
                      nombreEvento: evento.nombre,
                    });
                  }
                  excedentesFifoPorSubevento.set(existente.idSubEvento, setSub);
                }
              }

              if (dentroAforo.length > 0 && (cambioRecinto || cambioModalidad)) {
                const transicion = clasificarTransicionModalidad(
                  existente.idModalidadAcceso,
                  destinoModalidad,
                );
                const idsEnAforo = dentroAforo.map((r) => Number(r.idBoleto));

                if (transicion === 'CONSERVADO') {
                  const removioAsiento =
                    existente.idModalidadAcceso === ModalidadAcceso.QR_MAPA &&
                    destinoModalidad !== ModalidadAcceso.QR_MAPA;

                  if (destinoModalidad === ModalidadAcceso.REGISTRO_SIMPLE) {
                    await manager.query(
                      `UPDATE boleto
                       SET "idAsiento" = NULL, "tokenQR" = ''
                       WHERE "idBoleto" = ANY($1::int[])`,
                      [idsEnAforo],
                    );
                  } else if (removioAsiento) {
                    await manager.query(
                      `UPDATE boleto
                       SET "idAsiento" = NULL
                       WHERE "idBoleto" = ANY($1::int[])`,
                      [idsEnAforo],
                    );
                  }

                  for (const asist of dentroAforo) {
                    if (!asist.correo) continue;
                    colaCorreoA.push({
                      destinatario: asist.correo,
                      nombreAsistente:
                        `${asist.nombre} ${asist.apellidoPa}`.trim(),
                      nombreEvento: evento.nombre,
                      nombreSubEvento: propuesto.nombre,
                      nuevoRecinto: recintoDestino.nombre,
                      fecha: propuesto.fecha,
                      horaInicio: propuesto.horaInicio.slice(0, 5),
                      idModalidadDestino: destinoModalidad,
                      removioAsiento,
                    });
                  }
                } else {
                  await manager.query(
                    `UPDATE boleto
                     SET "idEstadoBoleto" = $1, "idAsiento" = NULL
                     WHERE "idBoleto" = ANY($2::int[])`,
                    [EstadoBoleto.CANCELADO, idsEnAforo],
                  );

                  if (transicion === 'CANCELADO_REAUTH') {
                    for (const asist of dentroAforo) {
                      if (!asist.correo) continue;
                      colaCorreoB.push({
                        destinatario: asist.correo,
                        nombreAsistente:
                          `${asist.nombre} ${asist.apellidoPa}`.trim(),
                        nombreEvento: evento.nombre,
                        idEvento,
                        nuevoRecinto: recintoDestino.nombre,
                      });
                    }
                  } else {
                    for (const asist of dentroAforo) {
                      if (!asist.correo) continue;
                      colaCorreoC.push({
                        destinatario: asist.correo,
                        nombreAsistente:
                          `${asist.nombre} ${asist.apellidoPa}`.trim(),
                        nombreEvento: evento.nombre,
                        fecha: propuesto.fecha,
                        nuevoRecinto: recintoDestino.nombre,
                      });
                    }
                  }
                }
              }
            }
          }

          if (existente.idFecha) {
            await manager.update(FechaEntity, existente.idFecha, {
              fecha: propuesto.fecha,
              horaInicio: propuesto.horaInicio,
              horaFin: propuesto.horaFin,
            });
          }
          await manager.update(SubEventoEntity, existente.idSubEvento, {
            nombre: propuesto.nombre,
            descripcion: propuesto.descripcion,
            cupoMaximo: cupoNormalizado,
            idRecinto: propuesto.idRecinto,
            idModalidadAcceso: destinoModalidad,
            estado: EstadoSubEvento.ACEPTADO,
          });
          idSubEventoAfectado = existente.idSubEvento;
        } else {
          const nuevaFecha = await manager.save(FechaEntity, {
            fecha: propuesto.fecha,
            horaInicio: propuesto.horaInicio,
            horaFin: propuesto.horaFin,
          });
          const modalidadNueva = this.resolverModalidadPayload(propuesto);
          const recintoNuevo = recintosBloqueados.get(propuesto.idRecinto)!;
          const cupoNuevoNormalizado = normalizarCupoMaximo(
            propuesto.cupoMaximo,
            recintoNuevo.aforo ?? 0,
            modalidadNueva,
          );
          const nuevoSub = await manager.save(SubEventoEntity, {
            nombre: propuesto.nombre,
            descripcion: propuesto.descripcion,
            cupoMaximo: cupoNuevoNormalizado,
            tokenInvitacion: randomUUID(),
            enlaceInvitacionActivo: false,
            idEvento,
            idRecinto: propuesto.idRecinto,
            idFecha: nuevaFecha.idFecha,
            idModalidadAcceso: modalidadNueva,
            estado: EstadoSubEvento.ACEPTADO,
          });
          idsConservados.add(nuevoSub.idSubEvento);
          idSubEventoAfectado = nuevoSub.idSubEvento;
        }

        await manager.save(BitacoraEventoEntity, {
          idEvento,
          idSubEvento: idSubEventoAfectado,
          idUsuarioActor: idUsuarioActor ?? evento.idOrganizador,
          idEstadoEvento: EstadoEvento.ACEPTADO,
        });
      }

      for (const anterior of subeventosExistentes) {
        if (
          !idsConservados.has(anterior.idSubEvento) &&
          anterior.estado !== EstadoSubEvento.CANCELADO
        ) {
          const asistentes = await this.obtenerAsistentesConBoletoValido(
            { idSubEvento: anterior.idSubEvento },
            manager,
          );
          if (asistentes.length > 0) {
            subeventosCancelados.push({
              idSubEvento: anterior.idSubEvento,
              nombreSubEvento: anterior.nombre,
              asistentes,
            });
          }

          await manager.update(SubEventoEntity, anterior.idSubEvento, {
            estado: EstadoSubEvento.CANCELADO,
          });
          await manager.query(
            `UPDATE "boleto"
             SET "idEstadoBoleto" = $1
             WHERE "idBoleto" IN (
               SELECT ae."idBoleto"
               FROM "asistenteEvento" ae
               WHERE ae."idSubEvento" = $2 AND ae."idBoleto" IS NOT NULL
             )`,
            [EstadoBoleto.CANCELADO, anterior.idSubEvento],
          );
          await manager.save(BitacoraEventoEntity, {
            idEvento,
            idSubEvento: anterior.idSubEvento,
            idUsuarioActor: idUsuarioActor ?? evento.idOrganizador,
            idEstadoEvento: EstadoEvento.CANCELADO,
          });
        }
      }

      if (evento.idAlcance === AlcanceEvento.PRIVADO) {
        for (const anterior of subeventosExistentes) {
          if (!idsConservados.has(anterior.idSubEvento)) {
            await manager.query(
              `DELETE FROM "invitacionEvento" WHERE "idSubEvento" = $1`,
              [anterior.idSubEvento],
            );
          }
        }

        for (const [idSub, idsExcedentesSet] of excedentesFifoPorSubevento.entries()) {
          const idsExcedentesUsuarios = Array.from(idsExcedentesSet);
          if (idsExcedentesUsuarios.length > 0) {
            await manager.query(
              `DELETE FROM "invitacionEvento" ie
               WHERE ie."idSubEvento" = $1
                 AND ie."idUsuario" = ANY($2::int[])
                 AND NOT EXISTS (
                   SELECT 1
                   FROM "asistenteEvento" ae
                   INNER JOIN "boleto" b ON ae."idBoleto" = b."idBoleto"
                   WHERE ae."idSubEvento" = $1
                     AND ae."idUsuario" = ie."idUsuario"
                     AND b."idEstadoBoleto" IN ($3, $4)
                 )`,
              [
                idSub,
                idsExcedentesUsuarios,
                EstadoBoleto.VALIDO,
                EstadoBoleto.UTILIZADO,
              ],
            );
          }
        }

        for (const [idSub, aforoSub] of aforoPorSubevento.entries()) {
          if (aforoSub > 0) {
            await manager.query(
              `DELETE FROM "invitacionEvento"
               WHERE "idInvitacionEvento" IN (
                 SELECT ie."idInvitacionEvento"
                 FROM "invitacionEvento" ie
                 WHERE ie."idSubEvento" = $1
                 ORDER BY (
                   EXISTS (
                     SELECT 1
                     FROM "asistenteEvento" ae
                     INNER JOIN "boleto" b ON ae."idBoleto" = b."idBoleto"
                     WHERE ae."idSubEvento" = $1
                       AND ae."idUsuario" = ie."idUsuario"
                       AND b."idEstadoBoleto" IN ($2, $3)
                   )
                 ) DESC,
                 ie."idInvitacionEvento" ASC
                 OFFSET $4
               )`,
              [
                idSub,
                EstadoBoleto.VALIDO,
                EstadoBoleto.UTILIZADO,
                aforoSub,
              ],
            );
          }
        }
      }

      await manager.update(EventoEntity, idEvento, {
        idEstadoEvento: EstadoEvento.ACEPTADO,
        esUrgente: nuevoEsUrgente,
      });

      await manager.update(
        SolicitudModificacionEntity,
        { idEvento, estado: 'Pendiente' },
        { estado: 'Aprobado' },
      );
    });

    if (
      colaCorreoA.length > 0 ||
      colaCorreoB.length > 0 ||
      colaCorreoC.length > 0 ||
      colaCorreoD.length > 0
    ) {
      void this.despacharCorreosMatrizCambio(
        colaCorreoA,
        colaCorreoB,
        colaCorreoC,
        colaCorreoD,
      );
    }
    if (subeventosCancelados.length > 0) {
      void this.notificarSubeventosCancelados(
        evento.nombre,
        subeventosCancelados,
        motivoModificacion,
      );
    }

    return {
      mensaje: 'Modificación logística aplicada directamente con éxito.',
      idEvento,
      idEstadoEvento: EstadoEvento.ACEPTADO,
    };
  }

  async rechazarSolicitud(
    idEvento: number,
    idUsuarioActor?: number,
    motivo?: string,
  ) {
    const evento = await this.eventoRepository.findOneBy({ idEvento });
    if (!evento) {
      throw new NotFoundException(
        `No se encontró la solicitud con ID ${idEvento}.`,
      );
    }

    const solicitudPendiente =
      await this.solicitudModificacionRepository.findOne({
        where: { idEvento, estado: 'Pendiente' },
      });

    if (solicitudPendiente) {
      if (!motivo || motivo.trim() === '') {
        throw new BadRequestException(
          'Dato requerido faltante. La justificación no puede estar vacía.',
        );
      }
      if (motivo.trim().length > 500) {
        throw new BadRequestException(
          'La descripción excede el límite máximo de caracteres permitidos.',
        );
      }

      const motivoLimpio = motivo.trim();

      await this.dataSource.transaction(async (manager) => {
        await manager.update(
          SolicitudModificacionEntity,
          solicitudPendiente.idSolicitudModificacion,
          {
            estado: 'Rechazado',
            motivoRechazo: motivoLimpio,
          },
        );

        const subeventosOriginales = await manager.find(SubEventoEntity, {
          where: { idEvento },
          relations: { fecha: true },
        });
        const payloads: SubeventoPayload[] = subeventosOriginales
          .filter((s) => s.fecha && s.estado !== EstadoSubEvento.CANCELADO)
          .map((s) => ({
            idRecinto: s.idRecinto,
            fecha: s.fecha!.fecha,
            horaInicio: s.fecha!.horaInicio,
            horaFin: s.fecha!.horaFin,
            nombre: s.nombre,
            descripcion: s.descripcion,
            idModalidadAcceso: s.idModalidadAcceso,
          }));
        const urgenciaOriginal = this.calcularEsUrgente(payloads);
        await manager.update(EventoEntity, idEvento, {
          esUrgente: urgenciaOriginal,
        });

        const primerSub = subeventosOriginales[0];
        if (primerSub) {
          await manager.save(BitacoraEventoEntity, {
            idEvento,
            idSubEvento: primerSub.idSubEvento,
            idUsuarioActor: idUsuarioActor ?? evento.idOrganizador,
            idEstadoEvento:
              evento.idEstadoEvento ?? EstadoEvento.ACEPTADO,
          });
        }
      });

      return {
        mensaje: 'La solicitud fue rechazada exitosamente.',
        idEvento,
        idEstadoEvento: evento.idEstadoEvento,
        idSolicitudModificacion: solicitudPendiente.idSolicitudModificacion,
        motivoRechazo: motivoLimpio,
      };
    }

    if (evento.idEstadoEvento !== EstadoEvento.ENPROCESO) {
      throw new ConflictException(
        'La solicitud seleccionada ya no se encuentra pendiente de aprobación. Actualice el listado para continuar.',
      );
    }

    if (motivo !== undefined && motivo.trim() === '') {
      throw new BadRequestException(
        'Dato requerido faltante. La justificación no puede estar vacía.',
      );
    }
    const motivoLimpio = motivo?.trim() || null;
    if (motivoLimpio && motivoLimpio.length > 500) {
      throw new BadRequestException(
        'La descripción excede el límite máximo de caracteres permitidos.',
      );
    }

    await this.eventoRepository.update(idEvento, {
      idEstadoEvento: EstadoEvento.RECHAZADO,
      motivoRechazo: motivoLimpio,
    });
    await this.subEventoRepository.update(
      { idEvento },
      { estado: EstadoSubEvento.CANCELADO },
    );

    const subeventos = await this.subEventoRepository.findBy({ idEvento });
    for (const sub of subeventos) {
      await this.bitacoraEventoRepository.save({
        idEvento,
        idSubEvento: sub.idSubEvento,
        idUsuarioActor: idUsuarioActor ?? evento.idOrganizador,
        idEstadoEvento: EstadoEvento.RECHAZADO,
      });
    }

    return {
      mensaje: 'La solicitud fue rechazada exitosamente.',
      idEvento,
      idEstadoEvento: EstadoEvento.RECHAZADO,
      motivoRechazo: motivoLimpio,
    };
  }

  async cancelarSolicitud(
    idEvento: number,
    motivo: string,
    idUsuarioActor?: number,
    rolActor?: string,
  ) {
    const motivoLimpio = motivo?.trim() ?? '';
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

    const evento = await this.eventoRepository.findOneBy({ idEvento });
    if (!evento || evento.idEstadoEvento === EstadoEvento.CANCELADO) {
      throw new ConflictException('Evento no encontrado o cancelado.');
    }
    if (evento.idEstadoEvento === EstadoEvento.FINALIZADO) {
      throw new ConflictException('El evento ya ha concluido.');
    }
    if (evento.idEstadoEvento === EstadoEvento.RECHAZADO) {
      throw new ConflictException('Evento finalizado o inactivo.');
    }

    const esSubdireccion = rolActor === TipoCuentaUsuario.SUBDIRECCION;
    if (
      !esSubdireccion &&
      idUsuarioActor !== undefined &&
      evento.idOrganizador !== idUsuarioActor
    ) {
      throw new ForbiddenException(
        'No tienes permisos para administrar este evento.',
      );
    }

    let asistentesAfectados: {
      idUsuario: number;
      correo: string;
      nombre: string;
      apellidoPa: string;
    }[] = [];

    await this.dataSource.transaction(async (manager) => {
      await this.bloquearSubeventosEInvalidarRetenciones(manager, idEvento);

      asistentesAfectados = await this.obtenerAsistentesConBoletoValido(
        { idEvento },
        manager,
      );

      await manager.update(
        EventoEntity,
        { idEvento },
        { idEstadoEvento: EstadoEvento.CANCELADO },
      );

      await manager.update(
        SubEventoEntity,
        { idEvento },
        { estado: EstadoSubEvento.CANCELADO },
      );

      await manager.query(
        `UPDATE "boleto"
         SET "idEstadoBoleto" = $1
         WHERE "idBoleto" IN (
           SELECT ae."idBoleto"
           FROM "asistenteEvento" ae
           INNER JOIN "subEvento" se ON ae."idSubEvento" = se."idSubEvento"
           WHERE se."idEvento" = $2 AND ae."idBoleto" IS NOT NULL
         )`,
        [EstadoBoleto.CANCELADO, idEvento],
      );

      const subeventos = await manager.findBy(SubEventoEntity, { idEvento });
      for (const sub of subeventos) {
        await manager.save(BitacoraEventoEntity, {
          idEvento,
          idSubEvento: sub.idSubEvento,
          idUsuarioActor: idUsuarioActor ?? evento.idOrganizador,
          idEstadoEvento: EstadoEvento.CANCELADO,
        });
      }
    });

    const notificarOrganizador =
      idUsuarioActor !== undefined && evento.idOrganizador !== idUsuarioActor;

    void this.notificarCancelacionEvento(
      evento.nombre,
      evento.idOrganizador,
      motivoLimpio,
      asistentesAfectados,
      notificarOrganizador,
    );

    return {
      mensaje: 'El evento se ha cancelado exitosamente.',
      idEvento,
      idEstadoEvento: EstadoEvento.CANCELADO,
      motivo: motivoLimpio,
    };
  }

  async registrarSolicitud(
    idOrganizador: number,
    dto: CrearSolicitudDto,
    posterKey?: string,
  ) {
    const rutaPoster = posterKey ?? dto.poster;
    if (!rutaPoster) {
      throw new BadRequestException('El póster del evento es obligatorio.');
    }

    const nuevoEvento = this.eventoRepository.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      justificacion: dto.justificacion,
      idAlcance: dto.idAlcance,
      poster: rutaPoster,
      idOrganizador,
      motivoUrgencia: dto.motivoUrgencia?.trim() || null,
    });

    const solicitante = await this.usuarioRepository.findOneBy({
      idUsuario: idOrganizador,
    });
    if (
      solicitante?.tipoCuenta === TipoCuentaUsuario.SUBDIRECCION ||
      solicitante?.esJefeAcademia
    ) {
      nuevoEvento.idEstadoEvento = EstadoEvento.ACEPTADO;
    } else {
      nuevoEvento.idEstadoEvento = EstadoEvento.ENPROCESO;
    }

    return await this.crearEvento(nuevoEvento, dto.subeventos);
  }

  /**
   * Orden de bloqueos: recinto (si aplica, ordenado por id) -> subEvento (ordenado por id) -> filas de boleto/evento.
   * Las reservas y retenciones bloquean subEvento y nunca recinto ni evento, por lo que no hay ciclos.
   */
  private async bloquearSubeventosEInvalidarRetenciones(
    manager: EntityManager,
    idEvento: number,
  ): Promise<SubEventoEntity[]> {
    const subeventos = await manager.find(SubEventoEntity, {
      where: { idEvento },
      order: { idSubEvento: 'ASC' },
      lock: { mode: 'pessimistic_write' },
    });

    await manager.query(
      `DELETE FROM "retencionAsiento"
       WHERE "idSubEvento" IN (SELECT "idSubEvento" FROM "subEvento" WHERE "idEvento" = $1)`,
      [idEvento],
    );

    return subeventos;
  }

  /** Obtiene usuarios distintos con boleto válido para un evento o subevento. */
  private async obtenerAsistentesConBoletoValido(
    filtro: { idEvento?: number; idSubEvento?: number },
    manager?: EntityManager,
  ): Promise<
    { idUsuario: number; correo: string; nombre: string; apellidoPa: string }[]
  > {
    const ejecutor = manager ?? this.dataSource;
    const condicion =
      filtro.idSubEvento !== undefined
        ? 'ae."idSubEvento" = $1'
        : 'se."idEvento" = $1';
    const idObjetivo = filtro.idSubEvento ?? filtro.idEvento;

    return ejecutor.query(
      `SELECT DISTINCT u."idUsuario", u.correo, u.nombre, u."apellidoPa"
       FROM "asistenteEvento" ae
       INNER JOIN "subEvento" se ON ae."idSubEvento" = se."idSubEvento"
       INNER JOIN boleto b ON ae."idBoleto" = b."idBoleto"
       INNER JOIN usuario u ON ae."idUsuario" = u."idUsuario"
       WHERE ${condicion}
         AND b."idEstadoBoleto" = $2`,
      [idObjetivo, EstadoBoleto.VALIDO],
    );
  }

  /** Elimina el marcador interno de urgencia al mostrar el motivo en correos. */
  private limpiarMotivoParaNotificacion(motivo?: string): string {
    const marcador = '\n\nMotivo de urgencia: ';
    const texto = motivo?.trim() ?? '';
    if (!texto) {
      return 'Actividad cancelada en la programación del evento.';
    }
    const indice = texto.lastIndexOf(marcador);
    const base = indice >= 0 ? texto.slice(0, indice).trim() : texto;
    return base || texto;
  }

  private async notificarCancelacionEvento(
    nombreEvento: string,
    idOrganizador: number,
    motivo: string,
    asistentes: {
      idUsuario: number;
      correo: string;
      nombre: string;
      apellidoPa: string;
    }[],
    notificarOrganizador: boolean,
  ): Promise<void> {
    try {
      let idOrganizadorNotificado: number | null = null;

      if (notificarOrganizador) {
        const organizador = await this.usuarioRepository.findOneBy({
          idUsuario: idOrganizador,
        });
        if (organizador?.correo) {
          idOrganizadorNotificado = organizador.idUsuario;
          await this.mailService.enviarNotificacionCancelacionEvento({
            destinatario: organizador.correo,
            nombreDestinatario:
              `${organizador.nombre} ${organizador.apellidoPa}`.trim(),
            destinatarioRol: 'organizador',
            nombreEvento,
            motivo,
          });
        }
      }

      for (const asist of asistentes) {
        if (asist.idUsuario === idOrganizadorNotificado || !asist.correo) {
          continue;
        }
        await this.mailService.enviarNotificacionCancelacionEvento({
          destinatario: asist.correo,
          nombreDestinatario: `${asist.nombre} ${asist.apellidoPa}`.trim(),
          destinatarioRol: 'asistente',
          nombreEvento,
          motivo,
        });
      }
    } catch (err) {
      this.logger.error(
        'Error al enviar notificaciones de cancelación de evento',
        err,
      );
    }
  }

  private async notificarSubeventosCancelados(
    nombreEvento: string,
    subeventos: {
      idSubEvento: number;
      nombreSubEvento: string;
      asistentes: {
        idUsuario: number;
        correo: string;
        nombre: string;
        apellidoPa: string;
      }[];
    }[],
    motivoModificacion?: string,
  ): Promise<void> {
    try {
      const motivo = this.limpiarMotivoParaNotificacion(motivoModificacion);
      for (const sub of subeventos) {
        for (const asist of sub.asistentes) {
          if (!asist.correo) continue;
          await this.mailService.enviarNotificacionCancelacionEvento({
            destinatario: asist.correo,
            nombreDestinatario: `${asist.nombre} ${asist.apellidoPa}`.trim(),
            destinatarioRol: 'asistente',
            nombreEvento,
            nombreSubEvento: sub.nombreSubEvento,
            motivo,
          });
        }
      }
    } catch (err) {
      this.logger.error(
        'Error al enviar notificaciones de cancelación de subeventos',
        err,
      );
    }
  }

  private async despacharCorreosMatrizCambio(
    colaA: Parameters<MailService['enviarCorreoACambioRecintoConservado']>[0][],
    colaB: Parameters<
      MailService['enviarCorreoBCambioModalidadNuevoRegistro']
    >[0][],
    colaC: Parameters<MailService['enviarCorreoCCambioAccesoLibre']>[0][],
    colaD: Parameters<MailService['enviarCorreoDCancelacionSobrecupoFifo']>[0][],
  ): Promise<void> {
    try {
      for (const correo of colaD) {
        await this.mailService.enviarCorreoDCancelacionSobrecupoFifo(correo);
      }
      for (const correo of colaA) {
        await this.mailService.enviarCorreoACambioRecintoConservado(correo);
      }
      for (const correo of colaB) {
        await this.mailService.enviarCorreoBCambioModalidadNuevoRegistro(
          correo,
        );
      }
      for (const correo of colaC) {
        await this.mailService.enviarCorreoCCambioAccesoLibre(correo);
      }
    } catch (err) {
      this.logger.error(
        'Error al despachar notificaciones de matriz y corte FIFO',
        err,
      );
    }
  }
}
