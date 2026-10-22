import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { QrService } from './qr.service';
import { CreateReservationDto } from '../dto/createReservation.dto';

import { SubEvento, Fecha, Recinto, Boleto, AsistenteEvento, EstadoSubEvento, EstadoBoleto } from '@eventos/shared';

@Injectable()
export class ReservationsService {

  // simulacion de bd (mocking)
 
  private subEventosMock: SubEvento[] = [
    { idSubEvento: 1, idEvento: 10, idRecinto: 100, idFecha: 1000, nombre: 'Subevento Demo', descripcion: 'Descripción demo', accesoQR: true, estado: EstadoSubEvento.ACEPTADO }
  ];
  
  private fechasMock: Fecha[] = [
    { idFecha: 1000, fecha: '2026-12-31', horaInicio: '10:00', horaFin: '12:00' }
  ];

  private recintosMock: Recinto[] = [
    { idRecinto: 100, nombre: 'Auditorio Principal', aforo: 50 } 
  ];

  
  private logisticaMock: { idEvento: number, idUsuario: number }[] = [
    { idEvento: 10, idUsuario: 999 } 
  ];

  private boletosMock: Boleto[] = [];
  private asistentesEventoMock: AsistenteEvento[] = [];
  private contadorBoletos = 1;

  constructor(private readonly qrService: QrService) {}

  //logica de negocio

  async crearReserva(idUsuario: number, dto: CreateReservationDto): Promise<{ mensaje: string, boleto: Boleto, qr?: string }>{

    //verificar existencia y cierre de registro
    const subEvento = this.subEventosMock.find(se => se.idSubEvento === dto.idSubEvento);

    if(!subEvento){
        throw new NotFoundException('El subevento no existe');
    }

    if(subEvento.estado != EstadoSubEvento.ACEPTADO){
        throw new ConflictException('El registro para este evento se encuentra cerrado o cancelado');
    }

    const fechaEvento = this.fechasMock.find(f => f.idFecha === subEvento.idFecha);
    if(!fechaEvento){
        throw new ConflictException('El evento no tiene una fecha asignada en la base de datos.');
    }
    const limiteReserva = new Date(`${fechaEvento.fecha}T${fechaEvento.horaInicio}`);

    if(new Date() > limiteReserva){
        throw new ConflictException('El tiempo límite para registrarse a este evento ha terminado.');
    }

    //verificar que el usuario no sea Personal de Logística
    const esLogistica = this.logisticaMock.some(log => log.idEvento === subEvento.idEvento && log.idUsuario === idUsuario);
    if(esLogistica){
        throw new ForbiddenException('El personal de logística asignado no puede reservar boletos como asistente.');
    }

    //verificar que no exista reserva previa
    const reservasEvento = this.asistentesEventoMock.filter(ae => ae.idSubEvento === dto.idSubEvento && ae.idUsuario == idUsuario);
    for(const reserva of reservasEvento){
        const boletoAsociado = this.boletosMock.find(b => b.idBoleto === reserva.idBoleto);
        if(boletoAsociado && (boletoAsociado.idEstadoBoleto == EstadoBoleto.VALIDO || boletoAsociado.idEstadoBoleto === EstadoBoleto.UTILIZADO)){
            throw new ConflictException('Ya cuentas con una reserva activa para este evento.');
        }
    }

    //verificar aforo
    const recinto = this.recintosMock.find(r => r.idRecinto === subEvento.idRecinto);

    if(!recinto){
        throw new ConflictException('El evento no tiene un recinto registrado en la base de datos.')
    }

    const asistentesAct = this.asistentesEventoMock.filter(ae => ae.idSubEvento === dto.idSubEvento);
    let lugaresOcupados = 0;
    
    for(const asistente of asistentesAct){
        const boleto = this.boletosMock.find(b => b.idBoleto === asistente.idBoleto);
        if(boleto && boleto.idEstadoBoleto === EstadoBoleto.VALIDO){
            lugaresOcupados++;
        }
    }

    if(lugaresOcupados >= recinto.aforo){
        throw new ConflictException('El aforo para este evento se ha agotado.');
    }

    //validar asiento enviado por el front
    if(dto.idAsiento){
        const asientoOcupado = this.boletosMock.some(b => b.idAsiento === dto.idAsiento && b.idEstadoBoleto === EstadoBoleto.VALIDO);

        if(asientoOcupado){
            throw new ConflictException('El asiento seleccionado ya se encuentra ocupado.');
        }

    }

    //generacion de qr y guardado de reserva

    const nuevoId = this.contadorBoletos++;
    const fechaFinEvento = new Date(`${fechaEvento.fecha}T${fechaEvento.horaFin}`);

    const nuevoBoleto: Boleto = {
        idBoleto: nuevoId,
        tokenQr: '',
        fechaGeneracion: new Date().toISOString(),
        idAsiento: dto.idAsiento || null,
        idEstadoBoleto: EstadoBoleto.VALIDO
    }

    if(subEvento.accesoQR){
        const infoBoleto = {
            idBoleto: nuevoId,
            idEvento: subEvento.idEvento,
            idUsuario: idUsuario
        };

        const imagenQrBase64 = await this.qrService.generateQrCode(infoBoleto, fechaFinEvento);

        //cambiar cuando ya este la base de datos
        nuevoBoleto.tokenQr = imagenQrBase64;
        this.boletosMock.push(nuevoBoleto);
        this.asistentesEventoMock.push({idSubEvento: dto.idSubEvento, idUsuario, idBoleto: nuevoId});

        return {
            mensaje: 'Reserva creada exitosamente',
            boleto: nuevoBoleto,
            qr: imagenQrBase64
        };
    }

    this.boletosMock.push(nuevoBoleto);
    this.asistentesEventoMock.push({idSubEvento: dto.idSubEvento, idUsuario, idBoleto: nuevoId});

    return {
        mensaje: 'Reserva creada exitosamente sin necesidad de QR',
        boleto: nuevoBoleto,
    };

  }

}