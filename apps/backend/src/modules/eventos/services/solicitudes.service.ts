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
  EstadoBoleto,
  EstadoEvento,
  EstadoSubEvento,
  EstadoVerificacion,
  TipoCuentaUsuario,
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
  ): Promise<boolean> {
    const qb = this.subEventoRepository
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

  async validarSubeventos(
    subeventos: SubeventoPayload[],
    excluirIdEvento?: number,
  ): Promise<boolean> {
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

    for (const subeventoActual of subeventos) {
      await this.recintoService.validarRecinto(
        subeventoActual.idRecinto,
        subeventoActual.accesoQR ?? false,
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
      await this.validarSubeventos(subeventos);
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

        const nuevoSubEvento = await manager.save(SubEventoEntity, {
          nombre: sub.nombre,
          descripcion: sub.descripcion,
          idEvento: eventoGuardado.idEvento,
          idRecinto: sub.idRecinto,
          idFecha: fechaGuardada.idFecha,
          accesoQR: sub.accesoQR ?? false,
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

  private resolverPosterUrl(poster?: string | null): string | null {
    if (!poster) return null;
    return poster.startsWith('http://') || poster.startsWith('https://')
      ? poster
      : this.storageService.publicUrl(poster);
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
        posterUrl: this.resolverPosterUrl(evento.poster),
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

    const solicitudPendiente =
      await this.solicitudModificacionRepository.findOne({
        where: { idEvento, estado: 'Pendiente' },
      });

    let subeventosPropuestosDetallados = null;
    if (solicitudPendiente) {
      const recintos = await this.dataSource
        .getRepository(RecintoEntity)
        .find();
      const mapaRecintos = new Map(recintos.map((r) => [r.idRecinto, r]));
      subeventosPropuestosDetallados = (
        solicitudPendiente.subeventosPropuestos || []
      ).map((prop) => {
        const rec = mapaRecintos.get(prop.idRecinto);
        return {
          ...prop,
          espacio: rec
            ? {
              idRecinto: rec.idRecinto,
              nombre: rec.nombre,
              aforo: rec.aforo,
              idEstadoRecinto: rec.idEstadoRecinto,
            }
            : null,
        };
      });
    }

    const posterUrl = this.resolverPosterUrl(evento.poster);

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
        }
        : null,
      subeventos: (evento.subEventos || []).map((sub) => ({
        idSubEvento: sub.idSubEvento,
        nombre: sub.nombre,
        descripcion: sub.descripcion,
        accesoQR: sub.accesoQR,
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
    await this.validarSubeventos(subeventosPropuestos, idEvento);
    const nuevoEsUrgente = this.calcularEsUrgente(subeventosPropuestos);

    const subeventosConCambioRecinto: {
      idSubEvento: number;
      nombreSubEvento: string;
      idNuevoRecinto: number;
      fecha: string;
      horaInicio: string;
      horaFin: string;
    }[] = [];

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

    const evento = await this.eventoRepository.findOneBy({ idEvento });
    if (!evento) {
      throw new NotFoundException('Evento no encontrado.');
    }

    await this.dataSource.transaction(async (manager) => {
      const subeventosExistentes = await manager.find(SubEventoEntity, {
        where: { idEvento },
      });
      const idsConservados = new Set<number>();

      for (const propuesto of subeventosPropuestos) {
        const existente = propuesto.idSubEvento
          ? subeventosExistentes.find(
              (s) => s.idSubEvento === propuesto.idSubEvento,
            )
          : undefined;

        let idSubEventoAfectado: number;

        if (existente) {
          idsConservados.add(existente.idSubEvento);
          const cambioRecinto = existente.idRecinto !== propuesto.idRecinto;
          if (cambioRecinto) {
            await manager.query(
              `UPDATE boleto b
               SET "idAsiento" = NULL
               FROM "asistenteEvento" ae
               WHERE ae."idBoleto" = b."idBoleto"
                 AND ae."idSubEvento" = $1
                 AND b."idEstadoBoleto" = $2`,
              [existente.idSubEvento, EstadoBoleto.VALIDO],
            );
            subeventosConCambioRecinto.push({
              idSubEvento: existente.idSubEvento,
              nombreSubEvento: propuesto.nombre,
              idNuevoRecinto: propuesto.idRecinto,
              fecha: propuesto.fecha,
              horaInicio: propuesto.horaInicio,
              horaFin: propuesto.horaFin,
            });
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
            idRecinto: propuesto.idRecinto,
            accesoQR: propuesto.accesoQR ?? existente.accesoQR,
            estado: EstadoSubEvento.ACEPTADO,
          });
          idSubEventoAfectado = existente.idSubEvento;
        } else {
          const nuevaFecha = await manager.save(FechaEntity, {
            fecha: propuesto.fecha,
            horaInicio: propuesto.horaInicio,
            horaFin: propuesto.horaFin,
          });
          const nuevoSub = await manager.save(SubEventoEntity, {
            nombre: propuesto.nombre,
            descripcion: propuesto.descripcion,
            idEvento,
            idRecinto: propuesto.idRecinto,
            idFecha: nuevaFecha.idFecha,
            accesoQR: propuesto.accesoQR ?? false,
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

    if (subeventosConCambioRecinto.length > 0) {
      void this.notificarAsistentesCambioRecinto(idEvento, subeventosConCambioRecinto);
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
            accesoQR: s.accesoQR,
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

  private async notificarAsistentesCambioRecinto(
    idEvento: number,
    cambios: {
      idSubEvento: number;
      nombreSubEvento: string;
      idNuevoRecinto: number;
      fecha: string;
      horaInicio: string;
      horaFin: string;
    }[],
  ): Promise<void> {
    try {
      const evento = await this.eventoRepository.findOneBy({ idEvento });
      for (const cambio of cambios) {
        const recinto = await this.dataSource.query(
          `SELECT nombre FROM recinto WHERE "idRecinto" = $1 LIMIT 1`,
          [cambio.idNuevoRecinto],
        );
        const nombreRecinto = recinto[0]?.nombre || 'Nuevo Recinto';

        const asistentes = await this.obtenerAsistentesConBoletoValido({
          idSubEvento: cambio.idSubEvento,
        });

        for (const asist of asistentes) {
          const nombreCompleto = `${asist.nombre} ${asist.apellidoPa}`.trim();
          await this.mailService.enviarNotificacionCambioRecinto({
            destinatario: asist.correo,
            nombreAsistente: nombreCompleto,
            nombreEvento: evento?.nombre || 'Evento Institucional',
            nombreSubEvento: cambio.nombreSubEvento,
            nuevoRecinto: nombreRecinto,
            fecha: cambio.fecha,
            horaInicio: cambio.horaInicio,
            horaFin: cambio.horaFin,
          });
        }
      }
    } catch (err) {
      this.logger.error(
        'Error al enviar notificaciones de cambio de recinto a asistentes',
        err,
      );
    }
  }
}
