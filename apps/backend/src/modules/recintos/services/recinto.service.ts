import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RecintoEntity } from '../entities/recinto.entity';
import { SubEventoEntity } from '../../eventos/entities/subevento.entity';
import { EstadoEquipoEntity } from '../entities/estadoEquipo.entity';
import { EstadoEvento, EstadoRecinto, EstadoSubEvento, RecintoId } from '@eventos/shared';

@Injectable()
export class RecintoService {
    constructor(
        @InjectRepository(RecintoEntity)
        private readonly recintoRepository: Repository<RecintoEntity>,
        @InjectRepository(SubEventoEntity)
        private readonly subEventoRepository: Repository<SubEventoEntity>,
        @InjectRepository(EstadoEquipoEntity)
        private readonly estadoEquipoRepository: Repository<EstadoEquipoEntity>,
        private readonly dataSource: DataSource,
    ) {}

    private esLaboratorio(idRecinto: number): boolean {
        return (
            idRecinto === RecintoId.LABORATORIO_A ||
            idRecinto === RecintoId.LABORATORIO_B
        );
    }

    // Calcula el aforo del laboratorio a través de la tabla de equipos disponibles (estadoEquipo con estado = true)
    private async obtenerAforoReal(recinto: RecintoEntity): Promise<number> {
        if (!this.esLaboratorio(recinto.idRecinto)) {
            return recinto.aforo;
        }

        const equiposDisponibles = await this.estadoEquipoRepository.count({
            where: { idRecinto: recinto.idRecinto, estado: true },
        });

        if (recinto.aforo !== equiposDisponibles) {
            recinto.aforo = equiposDisponibles;
            await this.recintoRepository.update(recinto.idRecinto, {
                aforo: equiposDisponibles,
            });
        }

        return equiposDisponibles;
    }

    // Listamos todos los espacios con el aforo de laboratorios calculado desde estadoEquipo
    async listarTodosLosEspacios() {
        const recintos = await this.recintoRepository.find({
            order: { idRecinto: 'ASC' },
        });

        for (const recinto of recintos) {
            recinto.aforo = await this.obtenerAforoReal(recinto);
        }

        return recintos;
    }

    // Listamos únicamente espacios habilitados con su aforo actualizado
    async listarEspaciosDisponibles() {
        const recintos = await this.recintoRepository.find({
            where: { idEstadoRecinto: EstadoRecinto.HABILITADO },
            order: { idRecinto: 'ASC' },
        });

        for (const recinto of recintos) {
            recinto.aforo = await this.obtenerAforoReal(recinto);
        }

        return recintos;
    }

    // Cambiamos el estado del espacio
    async cambiarEstadoEspacio(idRecinto: number, idEstadoRecinto: EstadoRecinto) {
        const recinto = await this.recintoRepository.findOneBy({ idRecinto });
        if (!recinto) {
            throw new NotFoundException(`Recinto con ID ${idRecinto} no encontrado.`);
        }

        const aforoActual = await this.obtenerAforoReal(recinto);

        if (idEstadoRecinto === EstadoRecinto.HABILITADO) {
            if (this.esLaboratorio(idRecinto) && aforoActual <= 0) {
                throw new ConflictException(
                    'No se puede habilitar un laboratorio sin equipos funcionales (RN-38).',
                );
            }
        }

        recinto.idEstadoRecinto = idEstadoRecinto;
        await this.recintoRepository.save(recinto);

        return {
            mensaje: 'Operación realizada con éxito. Recinto actualizado.',
            recinto,
        };
    }

    // Consultamos los equipos del laboratorio
    async listarEquiposPorLaboratorio(idRecinto: number) {
        const recinto = await this.recintoRepository.findOneBy({ idRecinto });
        if (!recinto) {
            throw new NotFoundException('Recinto no encontrado.');
        }

        if (!this.esLaboratorio(idRecinto)) {
            throw new BadRequestException('El recinto no es un laboratorio.');
        }

        return await this.estadoEquipoRepository.find({
            where: { idRecinto },
            order: { numeroEquipo: 'ASC' },
        });
    }

    // Cambiamos el estado de un equipo y recalculamos el aforo del laboratorio desde estadoEquipo
    async cambiarEstadoEquipo(idEquipo: number, estado: boolean) {
        return await this.dataSource.transaction(async (manager) => {
            const equipo = await manager.findOneBy(EstadoEquipoEntity, {
                idEstadoEquipo: idEquipo,
            });
            if (!equipo) {
                throw new NotFoundException('Equipo no encontrado.');
            }

            // Actualizar estado del equipo
            equipo.estado = estado;
            await manager.save(equipo);

            // Recalcular el aforo del laboratorio contando los equipos habilitados
            const equiposHabilitados = await manager.count(EstadoEquipoEntity, {
                where: { idRecinto: equipo.idRecinto, estado: true },
            });

            const recinto = await manager.findOneBy(RecintoEntity, {
                idRecinto: equipo.idRecinto,
            });
            if (!recinto) {
                throw new NotFoundException('Recinto no encontrado al intentar recalcular.');
            }

            recinto.aforo = equiposHabilitados;

            // Inhabilitación preventiva automática si llega a 0 equipos (aforo = 0)
            if (equiposHabilitados === 0) {
                recinto.idEstadoRecinto = EstadoRecinto.INHABILITADO;
            }

            await manager.save(recinto);

            return {
                mensaje: 'Operación exitosa, estado del equipo actualizado',
                equipo,
                aforo: recinto.aforo,
                idEstadoRecinto: recinto.idEstadoRecinto,
            };
        });
    }

    async buscarRecinto(idRecinto: number) {
        const recinto = await this.recintoRepository.findOneBy({ idRecinto });
        if (!recinto || recinto.idEstadoRecinto !== EstadoRecinto.HABILITADO) {
            return false;
        }
        return true;
    }

    // Validación de recinto y aforo de equipos disponibles al solicitar evento
    async validarRecinto(idRecinto: number, accesoQR: boolean = false) {
        const recinto = await this.recintoRepository.findOneBy({ idRecinto });

        if (!recinto) {
            throw new NotFoundException(`El recinto con ID ${idRecinto} no fue encontrado.`);
        }

        // Bloqueo preventivo por mantenimiento o inhabilitado (RN-34)
        if (recinto.idEstadoRecinto !== EstadoRecinto.HABILITADO) {
            throw new ConflictException(
                `El recinto "${recinto.nombre}" no está disponible por encontrarse inhabilitado o en mantenimiento (RN-34).`,
            );
        }

        // Sala 14 no permite emisión de boletos ni acceso QR
        if (idRecinto === RecintoId.SALA_14 && accesoQR === true) {
            throw new BadRequestException(
                'En Sala 14 no se permite acceso con boleto o código QR individual.',
            );
            }

        // En Laboratorios es obligatorio acceso con boleto/QR y contar con aforo > 0 calculado desde estadoEquipo
        if (this.esLaboratorio(idRecinto)) {
            if (accesoQR === false) {
                throw new BadRequestException(
                    'En los laboratorios de cómputo es obligatorio el acceso con boleto/código QR.',
                );
            }
            const aforoLaboratorio = await this.obtenerAforoReal(recinto);
            if (aforoLaboratorio <= 0) {
                throw new ConflictException(
                    `El laboratorio "${recinto.nombre}" no cuenta con equipos de cómputo habilitados disponibles.`,
                );
            }
        }

        return true;
    }

    // Consulta la agenda y disponibilidad de horarios en una fecha específica
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

        // Rechazar si el espacio se encuentra inhabilitado
        if (recinto.idEstadoRecinto !== EstadoRecinto.HABILITADO) {
            throw new ConflictException(
                `El recinto "${recinto.nombre}" se encuentra inhabilitado y no tiene horarios disponibles (RN-34).`,
            );
        }

        const aforoActual = await this.obtenerAforoReal(recinto);

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
                aforo: aforoActual,
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