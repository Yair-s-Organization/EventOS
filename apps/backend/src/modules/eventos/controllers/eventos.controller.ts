import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { EventosService } from '../services/eventos.service';

@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  // Cartelera: Obtener eventos aprobados
  @Get()
  async obtenerEventosPublicos() {
    return await this.eventosService.obtenerEventosPublicos();
  }

  // Obtener detalle de un evento con subeventos, fechas, recintos y ponentes
  @Get(':idEvento')
  async obtenerDetalleEventoPublico(
    @Param('idEvento', ParseIntPipe) idEvento: number,
  ) {
    return await this.eventosService.obtenerDetalleEventoPublico(idEvento);
  }
}