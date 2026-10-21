import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EventoEntity } from '../entities/evento.entity';
import { UsuarioEntity } from '../../auth/entities/usuario.entity';
import { SubEventoEntity } from '../entities/subevento.entity';
import { FechaEntity } from '../entities/fecha.entity';
import { RecintoService } from '../../recintos/services/recinto.service';
import {
  EstadoEvento,
  EstadoSubEvento,
  EstadoVerificacion,
  type SubeventoPayload,
} from '@eventos/shared';

@Injectable()
export class EventosService {
  eventoRepository: Repository<EventoEntity>;
  usuarioRepository: Repository<UsuarioEntity>;
  subEventoRepository: Repository<SubEventoEntity>;
  recintoService: RecintoService;
  private readonly dataSource: DataSource;

  constructor(
    @InjectRepository(EventoEntity) repo: Repository<EventoEntity>,
    @InjectRepository(UsuarioEntity) repoUsuario: Repository<UsuarioEntity>,
    @InjectRepository(SubEventoEntity) repoSubEvento: Repository<SubEventoEntity>,
    recintoService: RecintoService,
    dataSource: DataSource,
  ) {
    this.eventoRepository = repo;
    this.usuarioRepository = repoUsuario;
    this.subEventoRepository = repoSubEvento;
    this.recintoService = recintoService;
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
}