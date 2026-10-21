import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecintoEntity } from '../entities/recinto.entity';
import { EstadoRecinto, RecintoId } from '@eventos/shared';

@Injectable()
export class RecintoService {
    recintoRepository: Repository<RecintoEntity>;

    constructor(@InjectRepository(RecintoEntity) repo: Repository<RecintoEntity>) {
        this.recintoRepository = repo;
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
}