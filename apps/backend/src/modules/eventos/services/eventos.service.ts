import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EventoEntity } from '../entities/evento.entity';
import { UsuarioEntity } from '../../auth/entities/usuario.entity';
import { SubEventoEntity } from '../entities/subevento.entity';
import { FechaEntity } from '../entities/fecha.entity';
import { RecintoService } from '../../recintos/services/recinto.service';
import { StorageService } from '../../../common/storage/storage.service';
import {
  EstadoEvento,
  EstadoSubEvento,
  EstadoVerificacion,
  type SubeventoPayload,
} from '@eventos/shared';
import type { CrearSolicitudDto } from '../dto/crearSolicitud.dto';

@Injectable()
export class EventosService {
  eventoRepository: Repository<EventoEntity>;
  usuarioRepository: Repository<UsuarioEntity>;
  subEventoRepository: Repository<SubEventoEntity>;
  recintoService: RecintoService;
  storageService: StorageService;
  private readonly dataSource: DataSource;

  constructor(
    @InjectRepository(EventoEntity) repo: Repository<EventoEntity>,
    @InjectRepository(UsuarioEntity) repoUsuario: Repository<UsuarioEntity>,
    @InjectRepository(SubEventoEntity) repoSubEvento: Repository<SubEventoEntity>,
    recintoService: RecintoService,
    storageService: StorageService,
    dataSource: DataSource,
  ) {
    this.eventoRepository = repo;
    this.usuarioRepository = repoUsuario;
    this.subEventoRepository = repoSubEvento;
    this.recintoService = recintoService;
    this.storageService = storageService;
    this.dataSource = dataSource;
  }

  // Valida que la cuenta del usuario exista, esté activa y verificada.
  async verificarUsuario(idUsuario: number) {
    const usuario = await this.usuarioRepository.findOneBy({ idUsuario });
    if (!usuario || !usuario.estatus || usuario.esVerificado !== EstadoVerificacion.VERIFICADO) {
      return false;
    }
    return true;
  }

  // Valida coherencia de horario y traslapes internos entre subeventos
  validarTraslapeInterno(subeventos: SubeventoPayload[]) {
    for (let i = 0; i < subeventos.length; i++) {
      const a = subeventos[i];

      // La hora de inicio debe ser anterior a la hora de fin
      if (a.horaInicio >= a.horaFin) {
        throw new BadRequestException(
          'La hora de inicio debe ser anterior a la hora de fin.',
        );
      }

      for (let j = i + 1; j < subeventos.length; j++) {
        const b = subeventos[j];

        // Si coinciden en mismo recinto y misma fecha, verificar traslape
        if (a.idRecinto === b.idRecinto && a.fecha === b.fecha) {
          if (a.horaInicio < b.horaFin && b.horaInicio < a.horaFin) {
            throw new ConflictException(
              'El espacio ya se encuentra solicitado en ese horario dentro de la misma solicitud.',
            );
          }
        }
      }
    }
    return true;
  }

  // RN-06: Consulta si un subevento colisiona en horario y recinto con otros eventos activos en la BD
  async consultarColisionBD(subevento: SubeventoPayload): Promise<boolean> {
    const colision = await this.subEventoRepository
      .createQueryBuilder('subevento')
      .innerJoin('subevento.fecha', 'fecha')
      .innerJoin('subevento.evento', 'evento')
      .where('subevento.idRecinto = :idRecinto', { idRecinto: subevento.idRecinto })
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
      })
      .getOne();

    if (colision) {
      throw new ConflictException(
        'El espacio ya se encuentra solicitado o reservado para el horario seleccionado.',
      );
    }

    return true;
  }

  // Valida las reglas de recinto y traslapes para cada uno de los 1..N subeventos
  async validarSubeventos(subeventos: SubeventoPayload[]) {
    if (!subeventos || subeventos.length === 0) {
      throw new BadRequestException('La solicitud debe contener al menos un subevento.');
    }

    // Validar que no haya traslapes internos
    this.validarTraslapeInterno(subeventos);

    // Validar las reglas de cada recinto y consultar colisiones con la BD
    for (const subeventoActual of subeventos) {
      await this.recintoService.validarRecinto(
        subeventoActual.idRecinto,
        subeventoActual.accesoQR ?? false,
      );

      await this.consultarColisionBD(subeventoActual);
    }

    return true;
  }

  async crearEvento(evento: EventoEntity, subeventos: SubeventoPayload[] = []) {
    // Validación de cuenta verificada
    const estaVerificado = await this.verificarUsuario(evento.idOrganizador);
    if (!estaVerificado) {
      throw new ForbiddenException('El usuario no cuenta con una verificación previa');
    }

    // Validación de reglas de recinto para cada subevento
    if (subeventos.length > 0) {
      await this.validarSubeventos(subeventos);
    }

    // Transacción atómica: guarda el evento, sus fechas y sus subeventos como un todo
    return await this.dataSource.transaction(async (manager) => {
      // Guardar el evento general (incluye nombre, descripción, póster, justificación, etc.)
      const eventoGuardado = await manager.save(EventoEntity, evento);

      // Guardar cada subevento con su bloque de fecha
      const subeventosGuardados: SubEventoEntity[] = [];

      for (const sub of subeventos) {
        // Guarda en la tabla 'fechas'
        const fechaGuardada = await manager.save(FechaEntity, {
          fecha: sub.fecha,
          horaInicio: sub.horaInicio,
          horaFin: sub.horaFin,
        });

        // Guarda en la tabla 'subeventos' asociando idEvento e idFecha
        const nuevoSubEvento = await manager.save(SubEventoEntity, {
          idEvento: eventoGuardado.idEvento,
          idRecinto: sub.idRecinto,
          idFecha: fechaGuardada.idFecha,
          accesoQR: sub.accesoQR ?? false,
          estado: EstadoSubEvento.ACEPTADO,
        });

        subeventosGuardados.push(nuevoSubEvento);
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

  // Lista solicitudes (eventos) filtradas por estado. "Pendiente" equivale a EstadoEvento.ENPROCESO.
  async listarSolicitudesPorEstado(estado?: string) {
    const mapa: Record<string, EstadoEvento> = {
      pendiente: EstadoEvento.ENPROCESO,
      enproceso: EstadoEvento.ENPROCESO,
      aceptado: EstadoEvento.ACEPTADO,
      rechazado: EstadoEvento.RECHAZADO,
      cancelado: EstadoEvento.CANCELADO,
      finalizado: EstadoEvento.FINALIZADO,
    };

    const where: { idEstadoEvento?: EstadoEvento } = {};
    if (estado !== undefined && estado !== '') {
      const idEstado = mapa[estado.trim().toLowerCase()];//convierte el estado a minisculas y busca en el mapa
      if (idEstado === undefined) {
        throw new BadRequestException(`Estado inválido: "${estado}".`);
      }
      where.idEstadoEvento = idEstado;
    }
    return await this.eventoRepository.find({
      where,
      order: { idEvento: 'DESC' },
    });
  }

  // Devuelve el detalle completo de una solicitud para evaluación (CU03 / UI12)
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
      throw new NotFoundException(`No se encontró la solicitud con ID ${idEvento}.`);
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
        evento.poster.startsWith('http://') || evento.poster.startsWith('https://')
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
              computadorasDisponibles: sub.recinto.computadorasDisponibles,
              idEstadoRecinto: sub.recinto.idEstadoRecinto,
            }
          : null,
      })),
    };
  }

  // Aprueba una solicitud: valida que exista y esté Pendiente, y cambia el estado a ACEPTADO.
  async aprobarSolicitud(idEvento: number) {
    const evento = await this.eventoRepository.findOneBy({ idEvento });
    if (!evento) {
      throw new NotFoundException(`No se encontró la solicitud con ID ${idEvento}.`);
    }
    if (evento.idEstadoEvento !== EstadoEvento.ENPROCESO) {
      throw new ConflictException(
        'Solo se pueden aprobar solicitudes en estado Pendiente.',
      );
    }

    await this.eventoRepository.update(idEvento, {
      idEstadoEvento: EstadoEvento.ACEPTADO,
    });

    return {
      mensaje: 'Solicitud aprobada con éxito.',
      idEvento,
      idEstadoEvento: EstadoEvento.ACEPTADO,
    };
  }

  // Rechaza una solicitud: valida que exista y esté Pendiente, pasa a RECHAZADO y cancela subeventos para liberar espacios.
  async rechazarSolicitud(idEvento: number) {
    const evento = await this.eventoRepository.findOneBy({ idEvento });
    if (!evento) {
      throw new NotFoundException(`No se encontró la solicitud con ID ${idEvento}.`);
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

    return {
      mensaje: 'Solicitud rechazada con éxito.',
      idEvento,
      idEstadoEvento: EstadoEvento.RECHAZADO,
    };
  }

  // Orquesta la creación de una solicitud a partir del DTO recibido y delega a la transacción crearEvento
  async registrarSolicitud(
    idOrganizador: number,
    dto: CrearSolicitudDto,
    posterKey?: string,
  ) {
    const nuevoEvento = this.eventoRepository.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      justificacion: dto.justificacion,
      idAlcance: dto.idAlcance,
      poster: posterKey ?? dto.poster ?? null,
      idOrganizador,
    });

    return await this.crearEvento(nuevoEvento, dto.subeventos);
  }
}