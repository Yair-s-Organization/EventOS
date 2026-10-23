import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RecintoService } from '../services/recinto.service';
import { RolesGuard } from '../../auth/roles.guard';

@Controller(['espacios', 'recintos'])
export class EspaciosController {
  constructor(private readonly recintoService: RecintoService) {}

  // Consulta la agenda de eventos de un espacio en una fecha específica (RN-15 / UI12)
  @Get(':id/agenda')
  @UseGuards(RolesGuard)
  async obtenerAgenda(
    @Param('id', ParseIntPipe) id: number,
    @Query('fecha') fecha: string,
  ) {
    return await this.recintoService.obtenerAgendaEspacio(id, fecha);
  }
}
