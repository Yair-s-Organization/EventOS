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

    //Listamos todos los espacios(Admin)
    async listarTodosLosEspacios() {
        return await this.recintoRepository.find({
            order: { idRecinto: 'ASC' },
        });
    }

    //Listamos únicamente espacios habilitados
    async listarEspaciosDisponibles() {
        return await this.recintoRepository.find({
            where: { idEstadoRecinto: EstadoRecinto.HABILITADO },
            order: { idRecinto: 'ASC' },
        });
    }

    //Cambiamos el estado del espacio
    async cambiarEstadoEspacio(idRecinto: number, idEstadoRecinto: EstadoRecinto) {
        const recinto = await this.recintoRepository.findOneBy({ idRecinto });
        if (!recinto) {
            throw new NotFoundException(`Recinto con ID ${idRecinto} no encontrado.`);
        }

        if (idEstadoRecinto === EstadoRecinto.HABILITADO) {
            const esLaboratorio =
                idRecinto === RecintoId.LABORATORIO_A || idRecinto === RecintoId.LABORATORIO_B;
            if (esLaboratorio && (recinto.computadorasDisponibles ?? 0) <= 0) {
                throw new ConflictException(
                    'No se puede habilitar un laboratorio sin equipos funcionales (RN-38).',
                );
            }
        }

        recinto.idEstadoRecinto = idEstadoRecinto;
        await this.recintoRepository.save(recinto);

        return {
            mensaje: 'Operación realizada con éxito. Recinto actualizado.', // MSG-17
            recinto,
        };
    }

    //Consultamos los equipos del laboratorio
    async listarEquiposPorLaboratorio(idRecinto: number) {
        const recinto = await this.recintoRepository.findOneBy({ idRecinto });
        if (!recinto) {
            throw new NotFoundException('Recinto no encontrado.');
        }

        const esLaboratorio =
            idRecinto === RecintoId.LABORATORIO_A || idRecinto === RecintoId.LABORATORIO_B;
        if (!esLaboratorio) {
            throw new BadRequestException('El recinto no es un laboratorio.');
        }

        return await this.estadoEquipoRepository.find({
            where: { idRecinto },
            order: { numeroEquipo: 'ASC' },
        });
    }

    //Cambiamos el estado de un equipo y volvemos a calcular su capacidad
    async cambiarEstadoEquipo(idEquipo: number, estado: boolean) {
        return await this.dataSource.transaction(async (manager) => {
            const equipo = await manager.findOneBy(EstadoEquipoEntity, {
                idEstadoEquipo: idEquipo,
            });
            if (!equipo) {
                throw new NotFoundException('Equipo no encontrado.');
            }

            //Actualizar estado del equipo
            equipo.estado = estado;
            await manager.save(equipo);

            //Recalcular computadorasDisponibles
            const equiposHabilitados = await manager.count(EstadoEquipoEntity, {
                where: { idRecinto: equipo.idRecinto, estado: true },
            });

            const recinto = await manager.findOneBy(RecintoEntity, {
                idRecinto: equipo.idRecinto,
            });
            if (!recinto) {
                throw new NotFoundException('Recinto no encontrado al intentar recalcular.');
            }
            recinto.computadorasDisponibles = equiposHabilitados;

            //Inhabilitación preventiva automática si llega a 0 equipos
            if (equiposHabilitados === 0) {
                recinto.idEstadoRecinto = EstadoRecinto.INHABILITADO;
            }

            await manager.save(recinto);

            return {
                mensaje: 'Operación exitosa, estado del equipo actualizado', // MSG-12
                equipo,
                computadorasDisponibles: recinto.computadorasDisponibles,
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

    //Validación de recinto y equipos disponibles al solicitar evento
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

        // Sala 14 no permite emisión de boletos ni acceso QR (RN-04)
        if (idRecinto === RecintoId.SALA_14 && accesoQR === true) {
            throw new BadRequestException(
                'En Sala 14 no se permite acceso con boleto o código QR individual (RN-04).',
            );
        }

        // En Laboratorios es obligatorio acceso con boleto/QR y contar con equipos (RN-18 / RN-38)
        const esLaboratorio =
            idRecinto === RecintoId.LABORATORIO_A || idRecinto === RecintoId.LABORATORIO_B;
        if (esLaboratorio) {
            if (accesoQR === false) {
                throw new BadRequestException(
                    'En los laboratorios de cómputo es obligatorio el acceso con boleto/código QR (RN-18).',
                );
            }
            if ((recinto.computadorasDisponibles ?? 0) <= 0) {
                throw new ConflictException(
                    `El laboratorio "${recinto.nombre}" no cuenta con equipos de cómputo habilitados disponibles (RN-18 / MSG-E-03).`,
                );
            }
        }

        return true;
    }

    //Consulta la agenda y disponibilidad de horarios en una fecha específica
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

        //Rechazar si el espacio se encuentra inhabilitado (RN-34)
        if (recinto.idEstadoRecinto !== EstadoRecinto.HABILITADO) {
            throw new ConflictException(
                `El recinto "${recinto.nombre}" se encuentra inhabilitado y no tiene horarios disponibles (RN-34).`,
            );
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