import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { QrService } from './qr.service';
import { CreateReservationDto } from '../dto/createReservation.dto';
import { Repository, In, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { DisponibilidadSubEvento, AsientoDisponible, EstadoRecinto, EstadoBoleto, EstadoSubEvento } from '@eventos/shared';

import { BoletoEntity } from '../entities/boleto.entity';
import { AsistenteEventoEntity } from '../entities/asistenteEvento.entity';
import { SubEventoEntity } from '../../eventos/entities/subevento.entity';
import { RecintoEntity } from '../../recintos/entities/recinto.entity';
import { AsientoEntity } from '../entities/asiento.entity';
import { FechaEntity } from '../../eventos/entities/fecha.entity';
import { EventoPersonalLogisticaEntity } from '../../eventos/entities/eventoPersonalLogistica.entity';

@Injectable()
export class ReservationsService {

  
    constructor(
        private dataSource: DataSource,
        private readonly qrService: QrService, 
        @InjectRepository(SubEventoEntity) private subEventoRepo: Repository<SubEventoEntity>,
        @InjectRepository(RecintoEntity) private recintoRepo: Repository<RecintoEntity>,
        @InjectRepository(AsientoEntity) private asientoRepo: Repository<AsientoEntity>,
        @InjectRepository(BoletoEntity) private boletoRepo: Repository<BoletoEntity>,
        @InjectRepository(AsistenteEventoEntity) private asistenteRepo: Repository<AsistenteEventoEntity>,
        @InjectRepository(FechaEntity) private fechaRepo: Repository<FechaEntity>,
        @InjectRepository(EventoPersonalLogisticaEntity) private logisticaRepo: Repository<EventoPersonalLogisticaEntity>,
    ) {}

    //CONSULTAR DISPONIBILIDAD

    async consultarDisponibilidad(idSubEvento: number): Promise<DisponibilidadSubEvento> {
        // validar subevento
        const subEvento = await this.subEventoRepo.findOne({ 
            where: { idSubEvento: idSubEvento } 
        });
        
        if (!subEvento) {
            throw new NotFoundException('El subevento solicitado no existe.');
        }

        // validar Recinto
        const recinto = await this.recintoRepo.findOne({ 
            where: { idRecinto: subEvento.idRecinto } 
        });

        if (!recinto) {
            throw new ConflictException('El subevento no tiene un recinto asignado en la base de datos.');
        }

        if (recinto.idEstadoRecinto !== EstadoRecinto.HABILITADO) {
            throw new ConflictException('El recinto asignado a este evento no se encuentra habilitado.');
        }

        // obtener los id de los boletos asociados a este Subevento
        const asistentes = await this.asistenteRepo.find({ 
            where: { idSubEvento: idSubEvento } 
        });
        
        const idsBoleto = asistentes.map(a => a.idBoleto).filter(id => id !== null);

        let lugaresOcupados = 0;
        const idsAsientosOcupados = new Set<number>();

        
        if (idsBoleto.length > 0) {
            const boletos = await this.boletoRepo.findBy({idBoleto: In(idsBoleto)});

            for (const boleto of boletos) {
                if (boleto.idEstadoBoleto === EstadoBoleto.VALIDO || boleto.idEstadoBoleto === EstadoBoleto.UTILIZADO) {
                    lugaresOcupados++;
                    if (boleto.idAsiento !== null) {
                        idsAsientosOcupados.add(boleto.idAsiento);
                    }
                }
            }
        }

        // calculo de lugares libres
        const lugaresDisponibles = Math.max(0, recinto.aforo - lugaresOcupados);

        const asientosBD = await this.asientoRepo.find({ 
            where: { idRecinto: recinto.idRecinto } 
        });

        const asientos: AsientoDisponible[] = asientosBD.map(a => ({
            idAsiento: a.idAsiento,
            fila: a.fila,
            numero: a.numero,
            ocupado: idsAsientosOcupados.has(a.idAsiento),
        }));

        
        return {
            idSubEvento: subEvento.idSubEvento,
            recinto: recinto,
            lugaresDisponibles,
            asientos,
        };
    } 


    //CREAR RESERVA

    //logica de negocio para crear reserva

    async crearReserva(idUsuario: number, dto: CreateReservationDto): Promise<{ mensaje: string, boleto: any, qr?: string }>{
        
        // Transaccion
        return await this.dataSource.transaction(async (manager) => {
            
            // Verificar existencia y cierre de registro agreagndo el bloqueo de fila
            const subEvento = await manager.findOne(SubEventoEntity, { 
                where: { idSubEvento: dto.idSubEvento },
                lock: { mode: 'pessimistic_write' } 
            });
            
            if (!subEvento) {
                throw new NotFoundException('El subevento no existe');
            }
            
            if (subEvento.estado !== EstadoSubEvento.ACEPTADO) {
                throw new ConflictException('El registro para este evento se encuentra cerrado o cancelado');
            }

            const fechaEvento = await manager.findOne(FechaEntity, { 
                where: { idFecha: subEvento.idFecha } 
            });
            
            if (!fechaEvento) {
                throw new ConflictException('El evento no tiene una fecha asignada en la base de datos.');
            }

            const limiteReserva = new Date(`${fechaEvento.fecha}T${fechaEvento.horaInicio}`);
            
            if (new Date() > limiteReserva) {
                throw new ConflictException('El tiempo límite para registrarse a este evento ha terminado.');
            }

            // Verificar que el usuario no sea Personal de Logistica
            const esLogistica = await manager.findOne(EventoPersonalLogisticaEntity, {
                where: { idEvento: subEvento.idEvento, idUsuario: idUsuario }
            });
            
            if (esLogistica) {
                throw new ForbiddenException('El personal de logística asignado no puede reservar boletos como asistente.');
            }

            // Verificar que no exista reserva activa previa
            const reservasEvento = await manager.find(AsistenteEventoEntity, {
                where: { idSubEvento: dto.idSubEvento, idUsuario: idUsuario }
            });

            for (const reserva of reservasEvento) {
                if (reserva.idBoleto) {
                    const boletoAsociado = await manager.findOne(BoletoEntity, { 
                        where: { idBoleto: reserva.idBoleto } 
                    });
                    
                    if (boletoAsociado && (boletoAsociado.idEstadoBoleto === EstadoBoleto.VALIDO || boletoAsociado.idEstadoBoleto === EstadoBoleto.UTILIZADO)) {
                        throw new ConflictException('Ya cuentas con una reserva activa para este evento.');
                    }
                }
            }

            // Verificar Aforo y Butaca
            const recinto = await manager.findOne(RecintoEntity, { 
                where: { idRecinto: subEvento.idRecinto } 
            });
            
            if (!recinto) {
                throw new ConflictException('El evento no tiene un recinto registrado en la base de datos.');
            }

            
            const asistentesAct = await manager.find(AsistenteEventoEntity, { 
                where: { idSubEvento: dto.idSubEvento } 
            });
            
            let lugaresOcupados = 0;
            const idsBoleto = asistentesAct.map(a => a.idBoleto).filter(id => id !== null);

            if (idsBoleto.length > 0) {
                const boletos = await manager.find(BoletoEntity, { 
                    where: { idBoleto: In(idsBoleto) } 
                });
                
                for (const b of boletos) {
                    if (b.idEstadoBoleto === EstadoBoleto.VALIDO || b.idEstadoBoleto === EstadoBoleto.UTILIZADO) {
                        lugaresOcupados++;
                    }
                }
            }

            if (lugaresOcupados >= recinto.aforo) {
                throw new ConflictException('El aforo para este evento se ha agotado.');
            }

            if (dto.idAsiento) {
                const asientoOcupado = await manager.findOne(BoletoEntity, {
                    where: { idAsiento: dto.idAsiento, idEstadoBoleto: EstadoBoleto.VALIDO }
                });
                
                if (asientoOcupado) {
                    throw new ConflictException('El asiento seleccionado ya se encuentra ocupado.');
                }
            }

            //GENERACION DE QR

            const fechaFinEvento = new Date(`${fechaEvento.fecha}T${fechaEvento.horaFin}`);

            const boletoNuevoObj = manager.create(BoletoEntity, {
                tokenQr: '', 
                idAsiento: dto.idAsiento || null,
                idEstadoBoleto: EstadoBoleto.VALIDO
            });
            
            const boletoGuardado = await manager.save(BoletoEntity, boletoNuevoObj);

            const reservaExistente = await manager.findOne(AsistenteEventoEntity, {
                where: { idSubEvento: dto.idSubEvento, idUsuario: idUsuario }
            });

            if (reservaExistente) {
                reservaExistente.idBoleto = boletoGuardado.idBoleto;
                await manager.save(AsistenteEventoEntity, reservaExistente);
            } else {
                const intermedia = manager.create(AsistenteEventoEntity, {
                    idSubEvento: dto.idSubEvento,
                    idUsuario: idUsuario,
                    idBoleto: boletoGuardado.idBoleto
                });
                await manager.save(AsistenteEventoEntity, intermedia);
            }

            if (subEvento.accesoQR) {
                const infoBoleto = {
                    idBoleto: boletoGuardado.idBoleto,
                    idEvento: subEvento.idEvento,
                    idUsuario: idUsuario
                };

                const { token, qrBase64 } = await this.qrService.generateQrCode(infoBoleto, fechaFinEvento);

                boletoGuardado.tokenQr = token;
                await manager.save(BoletoEntity, boletoGuardado);

                return {
                    mensaje: 'Reserva creada exitosamente',
                    boleto: boletoGuardado,
                    qr: qrBase64 //imagen del boleto para el front
                };
            }

            return {
                mensaje: 'Reserva creada exitosamente sin necesidad de QR',
                boleto: boletoGuardado,
            };

        }); 
    }

    //CONSULTAR MIS EVENTOS

    async obtenerMisBoletos(idUsuario: number) {
        const reservas = await this.asistenteRepo.find({
            where: { idUsuario: idUsuario }
        });

        const misBoletos = [];

        for (const reserva of reservas) {
            if (!reserva.idBoleto) continue;

            const boleto = await this.boletoRepo.findOne({ where: { idBoleto: reserva.idBoleto } });
            if (!boleto) continue;

            const subEvento = await this.subEventoRepo.findOne({ where: { idSubEvento: reserva.idSubEvento } });
            if (!subEvento) continue; 

            const fechaEvento = await this.fechaRepo.findOne({ where: { idFecha: subEvento.idFecha } });
            if (!fechaEvento) continue; 
            
            const limiteTerminoEvento = new Date(`${fechaEvento.fecha}T${fechaEvento.horaFin}`);
            
            if (new Date() > limiteTerminoEvento && boleto.idEstadoBoleto === EstadoBoleto.VALIDO) {
                boleto.idEstadoBoleto = EstadoBoleto.CANCELADO;
                await this.boletoRepo.save(boleto);
            }

            misBoletos.push({
                idSubEvento: subEvento.idSubEvento,
                idBoleto: boleto.idBoleto,
                estadoBoleto: boleto.idEstadoBoleto,
                fecha: fechaEvento.fecha,
                horaInicio: fechaEvento.horaInicio,
                horaFin: fechaEvento.horaFin,
            });
        }

        return misBoletos;
    }

    //DETALLE DEL BOLETO Y QR

    async obtenerDetalleBoleto(idUsuario: number, idBoleto: number) {
        const reserva = await this.asistenteRepo.findOne({
            where: { idUsuario: idUsuario, idBoleto: idBoleto }
        });

        if (!reserva) {
            throw new NotFoundException('No se encontró una reserva asociada a este boleto para el usuario actual.');
        }

        const boleto = await this.boletoRepo.findOne({ where: { idBoleto: idBoleto } });
        if (!boleto) throw new NotFoundException('Boleto no encontrado.');

        const subEvento = await this.subEventoRepo.findOne({ where: { idSubEvento: reserva.idSubEvento } });
        if (!subEvento) throw new NotFoundException('SubEvento asociado no encontrado.'); 

        const fechaEvento = await this.fechaRepo.findOne({ where: { idFecha: subEvento.idFecha } });
        if (!fechaEvento) throw new NotFoundException('Fecha del evento no encontrada.'); 

        const recinto = await this.recintoRepo.findOne({ where: { idRecinto: subEvento.idRecinto } });
        if (!recinto) throw new NotFoundException('Recinto no encontrado.'); 

        const limiteTerminoEvento = new Date(`${fechaEvento.fecha}T${fechaEvento.horaFin}`);
        if (new Date() > limiteTerminoEvento && boleto.idEstadoBoleto === EstadoBoleto.VALIDO) {
            boleto.idEstadoBoleto = EstadoBoleto.CANCELADO;
            await this.boletoRepo.save(boleto);
        }

        let qrBase64 = null;
        if (boleto.tokenQr && boleto.tokenQr !== '') {
            qrBase64 = await this.qrService.generateImageFromToken(boleto.tokenQr);
        }

        let asientoDetalle = null;
        if (boleto.idAsiento) {
            const asiento = await this.asientoRepo.findOne({ where: { idAsiento: boleto.idAsiento } });
            if (asiento) {
                asientoDetalle = { fila: asiento.fila, numero: asiento.numero };
            }
        }

        return {
            idBoleto: boleto.idBoleto,
            estadoBoleto: boleto.idEstadoBoleto,
            qr: qrBase64,
            asiento: asientoDetalle,
            subEvento: {
                idSubEvento: subEvento.idSubEvento,
                idEvento: subEvento.idEvento,
                fecha: fechaEvento.fecha,
                horaInicio: fechaEvento.horaInicio,
                horaFin: fechaEvento.horaFin,
            },
            recinto: {
                idRecinto: recinto.idRecinto,
                nombre: recinto.nombre,
            }
        };
    }

    //CANCELACION LOGICA Y LIBERACION DEL LUGAR

    async cancelarReserva(idUsuario: number, idBoleto: number) {
    //Validar que la reserva existe y le pertenece al usuario
    const reserva = await this.asistenteRepo.findOne({
        where: { idUsuario: idUsuario, idBoleto: idBoleto }
    });

    if (!reserva) {
        throw new NotFoundException('No se encontró la reserva o no pertenece al usuario actual.');
    }

    const boleto = await this.boletoRepo.findOne({ where: { idBoleto: idBoleto } });
    if (!boleto) {
        throw new NotFoundException('El boleto no existe.');
    }

    //Validar que el boleto sea elegible para cancelacion
    if (boleto.idEstadoBoleto === EstadoBoleto.CANCELADO) {
        throw new ConflictException('Esta reserva ya se encontraba cancelada.');
    }
    if (boleto.idEstadoBoleto === EstadoBoleto.UTILIZADO) {
        throw new ConflictException('No puedes cancelar un boleto que ya fue escaneado en la entrada.');
    }

    //Esta parte es por si se usa el estado de boleto Expirado

    // if (boleto.idEstadoBoleto === EstadoBoleto.EXPIRADO) {
    //     throw new ConflictException('No puedes cancelar un boleto de un evento que ya terminó.');
    // }

    //Validar que el evento no haya comenzado
    const subEvento = await this.subEventoRepo.findOne({ where: { idSubEvento: reserva.idSubEvento } });
    if (subEvento) {
        const fechaEvento = await this.fechaRepo.findOne({ where: { idFecha: subEvento.idFecha } });
        if (fechaEvento) {
            const limiteCancelacion = new Date(`${fechaEvento.fecha}T${fechaEvento.horaInicio}`);
            if (new Date() > limiteCancelacion) {
                throw new ConflictException('El evento ya comenzó, el periodo de cancelación ha finalizado.');
            }
        }
    }

    // Aplicar Cancelacion Logica
    boleto.idEstadoBoleto = EstadoBoleto.CANCELADO;
    await this.boletoRepo.save(boleto);

    return {
      mensaje: 'Reserva cancelada exitosamente. Tu lugar ha sido liberado.',
      boleto: boleto
    };
  }


}