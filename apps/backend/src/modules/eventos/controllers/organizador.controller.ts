import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../auth/roles.guard';
import { OrganizadorService } from '../services/organizador.service';

@ApiTags('Organizador')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('eventos')
export class OrganizadorController {
  constructor(private readonly organizadorService: OrganizadorService) {}

  private obtenerIdUsuarioAutenticado(req: any): number {
    const idUsuario = req.user?.sub ?? req.user?.idUsuario;
    if (!idUsuario) {
      throw new ForbiddenException(
        'No se pudo identificar al usuario en el token.',
      );
    }
    return Number(idUsuario);
  }

  @ApiOperation({
    summary: 'Consultar mis eventos registrados como organizador',
  })
  @Get('mis-eventos')
  async obtenerMisEventos(@Req() req: any) {
    const idUsuario = this.obtenerIdUsuarioAutenticado(req);
    return await this.organizadorService.obtenerMisEventos(idUsuario);
  }

  @ApiOperation({
    summary: 'Consultar detalle administrativo de un evento propio',
  })
  @Get(':idEvento/detalle-organizador')
  async obtenerDetalleOrganizador(
    @Param('idEvento', ParseIntPipe) idEvento: number,
    @Req() req: any,
  ) {
    const idUsuario = this.obtenerIdUsuarioAutenticado(req);
    return await this.organizadorService.obtenerDetalleOrganizador(
      idEvento,
      idUsuario,
    );
  }
}

