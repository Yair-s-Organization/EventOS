import { Controller, Post, Body, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ReservationsService } from '../services/reservations.service';
import { CreateReservationDto } from '../dto/createReservation.dto';

@Controller('reservations')
export class ReservationsController {
  
  constructor(private readonly reservationsService: ReservationsService) {}

  //Endpoint para consultar lugares y asientos libres
  @Get('disponibilidad/:idSubEvento')
  async consultarDisponibilidad(
    @Param('idSubEvento', ParseIntPipe) idSubEvento: number,
  ) {
    return await this.reservationsService.consultarDisponibilidad(idSubEvento);
  }

  //Endpoint para crear una reserva y generar boleto/QR
  @Post()
  async crearReserva(@Body() dto: CreateReservationDto) {
    // Reemplazar el "1" con el ID real del usuario extraído del token JWT (AuthModule)
    const idUsuario = 1; 
    
    return await this.reservationsService.crearReserva(idUsuario, dto);
  }
}