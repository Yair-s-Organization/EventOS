import { Controller, Post, Body } from '@nestjs/common';
import { ReservationsService } from '../services/reservations.service';
import { CreateReservationDto } from '../dto/createReservation.dto';
@Controller('reservations')
export class ReservationsController {
  
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  async crearReserva(@Body() dto: CreateReservationDto) {
    // IMPORTANTE: Como aún no conectamos la seguridad real (Guards), 
    // se va a simular temporalmente que el usuario que hace la petición tiene el ID 1.
    // Cuando se integre el JWT, esto se extraerá automáticamente de la petición 
    const idUsuarioMock = 1; 
    return await this.reservationsService.crearReserva(idUsuarioMock, dto);
  }
}