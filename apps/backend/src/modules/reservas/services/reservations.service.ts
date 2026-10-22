import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { QrService } from './qr.service';
import { CreateReservationDto } from '../dto/createReservation.dto';
import { Repository, In } from 'typeorm';
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

  
  constructor(private readonly qrService: QrService, 
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
    
    const idsBoleto = asistentes
      .map(a => a.idBoleto)
      .filter(id => id !== null);

    let lugaresOcupados = 0;
    const idsAsientosOcupados = new Set<number>();

    
    if (idsBoleto.length > 0) {
      const boletos = await this.boletoRepo.findBy({ 
        idBoleto: In(idsBoleto) 
      });

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
        // Verificar existencia y cierre de registro
        const subEvento = await this.subEventoRepo.findOne({ 
            where: { idSubEvento: dto.idSubEvento } 
        });
        
        if (!subEvento) {
            throw new NotFoundException('El subevento no existe');
        }
        
        if (subEvento.estado !== EstadoSubEvento.ACEPTADO) {
            throw new ConflictException('El registro para este evento se encuentra cerrado o cancelado');
        }

        const fechaEvento = await this.fechaRepo.findOne({ 
            where: { idFecha: subEvento.idFecha } 
        });
        
        if (!fechaEvento) {
            throw new ConflictException('El evento no tiene una fecha asignada en la base de datos.');
        }

        const limiteReserva = new Date(`${fechaEvento.fecha}T${fechaEvento.horaInicio}`);
        
        if (new Date() > limiteReserva) {
            throw new ConflictException('El tiempo límite para registrarse a este evento ha terminado.');
        }

        // Verificar que el usuario no sea Personal de Logística
        const esLogistica = await this.logisticaRepo.findOne({
            where: { idEvento: subEvento.idEvento, idUsuario: idUsuario }
        });
        
        if (esLogistica) {
            throw new ForbiddenException('El personal de logística asignado no puede reservar boletos como asistente.');
        }

        // Verificar que no exista reserva activa previa
        const reservasEvento = await this.asistenteRepo.find({
            where: { idSubEvento: dto.idSubEvento, idUsuario: idUsuario }
        });

        for (const reserva of reservasEvento) {
            if (reserva.idBoleto) {
                const boletoAsociado = await this.boletoRepo.findOne({ 
                where: { idBoleto: reserva.idBoleto } 
                });
                
                if (boletoAsociado && (boletoAsociado.idEstadoBoleto === EstadoBoleto.VALIDO || boletoAsociado.idEstadoBoleto === EstadoBoleto.UTILIZADO)) {
                    throw new ConflictException('Ya cuentas con una reserva activa para este evento.');
                }
            }
        }

        // Verificar Aforo y Butaca
        const recinto = await this.recintoRepo.findOne({ 
            where: { idRecinto: subEvento.idRecinto } 
        });
        
        if (!recinto) {
            throw new ConflictException('El evento no tiene un recinto registrado en la base de datos.');
        }

        
        const asistentesAct = await this.asistenteRepo.find({ 
            where: { idSubEvento: dto.idSubEvento } 
        });
        
        let lugaresOcupados = 0;
        const idsBoleto = asistentesAct.map(a => a.idBoleto).filter(id => id !== null);

        if (idsBoleto.length > 0) {
            const boletos = await this.boletoRepo.findBy({ idBoleto: In(idsBoleto) });
            
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
            const asientoOcupado = await this.boletoRepo.findOne({
                where: { idAsiento: dto.idAsiento, idEstadoBoleto: EstadoBoleto.VALIDO }
            });
            
            if (asientoOcupado) {
                throw new ConflictException('El asiento seleccionado ya se encuentra ocupado.');
            }
        }

        //GENERACION DE QR

        const fechaFinEvento = new Date(`${fechaEvento.fecha}T${fechaEvento.horaFin}`);

        const boletoNuevoObj = this.boletoRepo.create({
            tokenQr: '', 
            idAsiento: dto.idAsiento || null,
            idEstadoBoleto: EstadoBoleto.VALIDO
        });
        
        const boletoGuardado = await this.boletoRepo.save(boletoNuevoObj);

        const reservaExistente = await this.asistenteRepo.findOne({
            where: { idSubEvento: dto.idSubEvento, idUsuario: idUsuario }
        });

        if (reservaExistente) {
            reservaExistente.idBoleto = boletoGuardado.idBoleto;
            await this.asistenteRepo.save(reservaExistente);
        } else {
            const intermedia = this.asistenteRepo.create({
                idSubEvento: dto.idSubEvento,
                idUsuario: idUsuario,
                idBoleto: boletoGuardado.idBoleto
            });
            await this.asistenteRepo.save(intermedia);
        }

        if (subEvento.accesoQR) {
            const infoBoleto = {
                idBoleto: boletoGuardado.idBoleto,
                idEvento: subEvento.idEvento,
                idUsuario: idUsuario
            };

            const { token, qrBase64 } = await this.qrService.generateQrCode(infoBoleto, fechaFinEvento);

            boletoGuardado.tokenQr = token;
            await this.boletoRepo.save(boletoGuardado);

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
    }

}