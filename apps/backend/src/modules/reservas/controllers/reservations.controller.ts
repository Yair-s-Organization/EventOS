import { Controller, Post, Body, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ReservationsService } from '../services/reservations.service';
import { CreateReservationDto } from '../dto/createReservation.dto';

@Controller('reservations')
export class ReservationsController {
  
  constructor(private readonly reservationsService: ReservationsService) {}

  // Lista de eventos del usuario
  @Get('mis-boletos')
  async obtenerMisBoletos() {
    const idUsuario = 1; // TODO: Reemplazar con token JWT
    return await this.reservationsService.obtenerMisBoletos(idUsuario);
  }

  // Detalle de un boleto específico con QR al vuelo
  @Get('mis-boletos/:idBoleto')
  async obtenerDetalleBoleto(
    @Param('idBoleto', ParseIntPipe) idBoleto: number,
  ) {
    const idUsuario = 1; // TODO: Reemplazar con token JWT
    return await this.reservationsService.obtenerDetalleBoleto(idUsuario, idBoleto);
  }

  // Consultar lugares y asientos libres
  @Get('disponibilidad/:idSubEvento')
  async consultarDisponibilidad(
    @Param('idSubEvento', ParseIntPipe) idSubEvento: number,
  ) {
    return await this.reservationsService.consultarDisponibilidad(idSubEvento);
  }

  // Crear una reserva con transacción atómica y QR
  @Post()
  async crearReserva(@Body() dto: CreateReservationDto) {
    const idUsuario = 1; // TODO: Reemplazar con token JWT
    return await this.reservationsService.crearReserva(idUsuario, dto);
  }

  // Cancelación lógica y liberación de lugar
  @Patch(':idBoleto/cancelar')
  async cancelarReserva(
    @Param('idBoleto', ParseIntPipe) idBoleto: number,
  ) {
    const idUsuario = 1; // TODO: Reemplazar con token JWT
    return await this.reservationsService.cancelarReserva(idUsuario, idBoleto);
  }
}