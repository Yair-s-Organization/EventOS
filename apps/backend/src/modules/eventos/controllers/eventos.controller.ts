import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventosService } from '../services/eventos.service';

@ApiTags('Eventos (Cartelera Pública)')
@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  // Cartelera: Obtener eventos aprobados
  @ApiOperation({
    summary: 'Consultar cartelera de eventos aprobados',
  })
  @Get()
  async obtenerEventosPublicos() {
    return await this.eventosService.obtenerEventosPublicos();
  }

  // Obtener detalle de un evento con subeventos, fechas, recintos y ponentes
  @ApiOperation({
    summary: 'Consultar detalle de un evento aprobado',
  })
  @Get(':idEvento')
  async obtenerDetalleEventoPublico(
    @Param('idEvento', ParseIntPipe) idEvento: number,
  ) {
    return await this.eventosService.obtenerDetalleEventoPublico(idEvento);
  }
}