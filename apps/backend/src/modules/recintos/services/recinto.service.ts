import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecintoEntity } from '../entities/recinto.entity';
import { SubEventoEntity } from '../../eventos/entities/subevento.entity';
import { EstadoEvento, EstadoRecinto, EstadoSubEvento, RecintoId } from '@eventos/shared';

@Injectable()
export class RecintoService {
    recintoRepository: Repository<RecintoEntity>;
    subEventoRepository: Repository<SubEventoEntity>;

    constructor(
        @InjectRepository(RecintoEntity) repo: Repository<RecintoEntity>,
        @InjectRepository(SubEventoEntity) subEventoRepo: Repository<SubEventoEntity>,
    ) {
        this.recintoRepository = repo;
        this.subEventoRepository = subEventoRepo;
    }

    async buscarRecinto(idRecinto: number) {
        const recinto = await this.recintoRepository.findOneBy({ idRecinto });
        if (!recinto || recinto.idEstadoRecinto !== EstadoRecinto.HABILITADO) {
            return false;
        }
        return true;
    }

    async validarRecinto(idRecinto: number, accesoQR: boolean = false) {
        const recinto = await this.recintoRepository.findOneBy({ idRecinto });

        if (!recinto) {
            throw new NotFoundException(`El recinto con ID ${idRecinto} no fue encontrado.`);
        }

        // Bloqueo preventivo por mantenimiento o inhabilitado
        if (recinto.idEstadoRecinto !== EstadoRecinto.HABILITADO) {
            throw new ConflictException(
                `El recinto "${recinto.nombre}" no está disponible por encontrarse inhabilitado o en mantenimiento (RN-34).`,
            );
        }

        // Sala 14 no permite emisión de boletos ni acceso QR
        if (idRecinto === RecintoId.SALA_14 && accesoQR === true) {
            throw new BadRequestException(
                'En Sala 14 no se permite acceso con boleto o código QR individual (RN-04).',
            );
        }

        // En Laboratorios es obligatorio acceso con boleto/QR por asignación de equipo
        const esLaboratorio =
            idRecinto === RecintoId.LABORATORIO_A || idRecinto === RecintoId.LABORATORIO_B;
        if (esLaboratorio && accesoQR === false) {
            throw new BadRequestException(
                'En los laboratorios de cómputo es obligatorio el acceso con boleto/código QR (RN-18).',
            );
        }

        return true;
    }

    // Consulta la agenda de eventos para un espacio físico en una fecha específica (RN-15 / UI12)
    async obtenerAgendaEspacio(idRecinto: number, fecha: string) {
        if (!fecha) {
            throw new BadRequestException('El parámetro "fecha" es requerido (formato YYYY-MM-DD).');
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            throw new BadRequestException('El formato de la fecha debe ser YYYY-MM-DD.');
        }

        const recinto = await this.recintoRepository.findOneBy({ idRecinto });
        if (!recinto) {
            throw new NotFoundException(`El espacio físico con ID ${idRecinto} no fue encontrado.`);
        }

        const subEventos = await this.subEventoRepository
            .createQueryBuilder('subevento')
            .innerJoinAndSelect('subevento.fecha', 'fecha')
            .innerJoinAndSelect('subevento.evento', 'evento')
            .where('subevento.idRecinto = :idRecinto', { idRecinto })
            .andWhere('fecha.fecha = :fecha', { fecha })
            .andWhere('subevento.estado != :estadoCancelado', {
                estadoCancelado: EstadoSubEvento.CANCELADO,
            })
            .andWhere('evento.idEstadoEvento NOT IN (:...estadosExcluidos)', {
                estadosExcluidos: [EstadoEvento.CANCELADO, EstadoEvento.RECHAZADO],
            })
            .orderBy('fecha.horaInicio', 'ASC')
            .getMany();

        return {
            espacio: {
                idRecinto: recinto.idRecinto,
                nombre: recinto.nombre,
                aforo: recinto.aforo,
                computadorasDisponibles: recinto.computadorasDisponibles,
                idEstadoRecinto: recinto.idEstadoRecinto,
            },
            fecha,
            totalEventos: subEventos.length,
            agenda: subEventos.map((sub) => ({
                idSubEvento: sub.idSubEvento,
                nombreSubevento: sub.nombre,
                idEvento: sub.idEvento,
                nombreEvento: sub.evento?.nombre ?? '',
                idEstadoEvento: sub.evento?.idEstadoEvento,
                estadoSubEvento: sub.estado,
                accesoQR: sub.accesoQR,
                horaInicio: sub.fecha?.horaInicio ?? '',
                horaFin: sub.fecha?.horaFin ?? '',
            })),
        };
    }
}