import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  EstadoEvento,
  EstadoSubEvento,
  EstadoVerificacion,
  TipoCuentaUsuario,
  type SubeventoPayload,
} from '@eventos/shared';
import { EventoEntity } from '../entities/evento.entity';
import { UsuarioEntity } from '../../auth/entities/usuario.entity';
import { SubEventoEntity } from '../entities/subevento.entity';
import { FechaEntity } from '../entities/fecha.entity';
import { BitacoraEventoEntity } from '../entities/bitacoraEvento.entity';
import { RecintoService } from '../../recintos/services/recinto.service';
import { StorageService } from '../../../common/storage/storage.service';
import type { CrearSolicitudDto } from '../dto/crearSolicitud.dto';

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(EventoEntity)
    private readonly eventoRepository: Repository<EventoEntity>,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
    @InjectRepository(SubEventoEntity)
    private readonly subEventoRepository: Repository<SubEventoEntity>,
    @InjectRepository(BitacoraEventoEntity)
    private readonly bitacoraEventoRepository: Repository<BitacoraEventoEntity>,
    private readonly recintoService: RecintoService,
    private readonly storageService: StorageService,
    private readonly dataSource: DataSource,
  ) {}

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

  private obtenerAhoraCDMX(): { fechaHoy: string; horaActual: string } {
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

  calcularEsUrgente(subeventos: SubeventoPayload[]): boolean {
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

    return eventos.map((evento) => ({
      ...evento,
      posterUrl: evento.poster
        ? evento.poster.startsWith('http://') ||
          evento.poster.startsWith('https://')
          ? evento.poster
          : this.storageService.publicUrl(evento.poster)
        : null,
    }));
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

    let posterUrl: string | null = null;
    if (evento.poster) {
      posterUrl =
        evento.poster.startsWith('http://') ||
        evento.poster.startsWith('https://')
          ? evento.poster
          : this.storageService.publicUrl(evento.poster);
    }

    return {
      idEvento: evento.idEvento,
      nombre: evento.nombre,
      descripcion: evento.descripcion,
      justificacion: evento.justificacion,
      idAlcance: evento.idAlcance,
      idEstadoEvento: evento.idEstadoEvento,
      esUrgente: evento.esUrgente,
      poster: evento.poster,
      poster_url: posterUrl,
      posterUrl: posterUrl,
      solicitante: solicitante
        ? {
            idUsuario: solicitante.idUsuario,
            nombre: solicitante.nombre,
            apellidoPa: solicitante.apellidoPa,
            apellidoMa: solicitante.apellidoMa,
            nombreCompleto: `${solicitante.nombre} ${solicitante.apellidoPa}${
              solicitante.apellidoMa ? ' ' + solicitante.apellidoMa : ''
            }`,
            correo: solicitante.correo,
            esVerificado: solicitante.esVerificado,
            tipoCuenta: solicitante.tipoCuenta,
            esJefeAcademia: solicitante.esJefeAcademia,
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
    if (evento.idEstadoEvento !== EstadoEvento.ENPROCESO) {
      throw new ConflictException(
        'Solo se pueden aprobar solicitudes en estado Pendiente.',
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
      mensaje: 'Solicitud aprobada con éxito.',
      idEvento,
      idEstadoEvento: EstadoEvento.ACEPTADO,
    };
  }

  async rechazarSolicitud(idEvento: number, idUsuarioActor?: number) {
    const evento = await this.eventoRepository.findOneBy({ idEvento });
    if (!evento) {
      throw new NotFoundException(
        `No se encontró la solicitud con ID ${idEvento}.`,
      );
    }
    if (evento.idEstadoEvento !== EstadoEvento.ENPROCESO) {
      throw new ConflictException(
        'Solo se pueden rechazar solicitudes en estado Pendiente.',
      );
    }

    await this.eventoRepository.update(idEvento, {
      idEstadoEvento: EstadoEvento.RECHAZADO,
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
      mensaje: 'Solicitud rechazada con éxito.',
      idEvento,
      idEstadoEvento: EstadoEvento.RECHAZADO,
    };
  }

  async cancelarSolicitud(
    idEvento: number,
    motivo: string,
    idUsuarioActor?: number,
  ) {
    if (!motivo || motivo.trim() === '') {
      throw new BadRequestException('El motivo de cancelación es obligatorio.');
    }

    const evento = await this.eventoRepository.findOneBy({ idEvento });
    if (!evento) {
      throw new NotFoundException(
        `No se encontró la solicitud con ID ${idEvento}.`,
      );
    }

    if (evento.idEstadoEvento === EstadoEvento.CANCELADO) {
      throw new ConflictException('El evento ya se encuentra cancelado.');
    }
    if (evento.idEstadoEvento === EstadoEvento.FINALIZADO) {
      throw new ConflictException('El evento ya ha concluido.');
    }
    if (evento.idEstadoEvento !== EstadoEvento.ACEPTADO) {
      throw new ConflictException(
        'Solo se pueden cancelar eventos en estado Aprobado.',
      );
    }

    await this.eventoRepository.update(idEvento, {
      idEstadoEvento: EstadoEvento.CANCELADO,
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
        idUsuarioActor: idUsuarioActor ?? null,
        idEstadoEvento: EstadoEvento.CANCELADO,
      });
    }

    return {
      mensaje: 'El evento se ha cancelado exitosamente.',
      idEvento,
      idEstadoEvento: EstadoEvento.CANCELADO,
      motivo: motivo.trim(),
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
}
