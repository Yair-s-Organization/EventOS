import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { EventosService } from '../services/eventos.service';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TipoCuentaUsuario } from '@eventos/shared';

@ApiTags('Eventos y Bitácora')
@Controller('eventos')
export class EventosController {
  constructor(
    private readonly eventosService: EventosService,
    private readonly jwtService: JwtService,
  ) {}

  // Extraemos el payload del JWT sin fallar cuando el usuario no ha iniciado sesión
  private async extraerUsuarioOpcional(req: any) {
    const authHeader = req?.headers?.authorization;
    if (!authHeader) return undefined;

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) return undefined;

    try {
      return await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_PASS || 'clave_secreta',
      });
    } catch {
      return undefined;
    }
  }

  private obtenerIdUsuarioAutenticado(req: any): number {
    const idUsuario = req.user?.sub ?? req.user?.idUsuario;
    if (!idUsuario) {
      throw new ForbiddenException('No se pudo identificar al usuario en el token.');
    }
    return Number(idUsuario);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Consultar mis eventos registrados como organizador',
  })
  @Get('mis-eventos')
  @UseGuards(RolesGuard)
  async obtenerMisEventos(@Req() req: any) {
    const idUsuario = this.obtenerIdUsuarioAutenticado(req);
    return await this.eventosService.obtenerMisEventos(idUsuario);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Consultar detalle administrativo de un evento propio',
  })
  @Get(':idEvento/detalle-organizador')
  @UseGuards(RolesGuard)
  async obtenerDetalleOrganizador(
    @Param('idEvento', ParseIntPipe) idEvento: number,
    @Req() req: any,
  ) {
    const idUsuario = this.obtenerIdUsuarioAutenticado(req);
    return await this.eventosService.obtenerDetalleOrganizador(idEvento, idUsuario);
  }

  //Cartelera de eventos próximos (sin sesión: solo acceso libre; con sesión: internos o externos según cuenta)
  @ApiOperation({
    summary: 'Consultar cartelera de eventos próximos (Acceso libre sin sesión / Completo con sesión)',
  })
  @Get()
  async obtenerEventosPublicos(@Req() req: any) {
    const usuario = await this.extraerUsuarioOpcional(req);
    return await this.eventosService.obtenerEventosPublicos(usuario);
  }

  //Consultar Bitácora General de Movimientos
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Consultar bitácora general de movimientos del sistema (UI20)',
  })
  @Get('bitacora')
  @UseGuards(RolesGuard)
  @Roles(TipoCuentaUsuario.ADMINISTRADOR)
  async obtenerBitacoraGeneral(@Query('buscar') buscar?: string) {
    const movimientos = await this.eventosService.obtenerBitacoraGeneral(buscar);
    return {
      mensaje:
        movimientos.length === 0
          ? 'No hay registros de eventos disponibles. (MSG-E-32)'
          : 'Bitácora consultada con éxito.',
      total: movimientos.length,
      movimientos,
    };
  }

  //Exportar Bitácora General de Movimientos
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Exportar y descargar reporte de la bitácora general de movimientos (UI20)',
  })
  @Get('bitacora/exportar')
  @UseGuards(RolesGuard)
  @Roles(TipoCuentaUsuario.ADMINISTRADOR)
  async exportarBitacoraGeneral(
    @Query('buscar') buscar: string | undefined,
    @Res() res: any,
  ) {
    const reporte = await this.eventosService.exportarBitacoraGeneral(buscar);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${reporte.nombreArchivo}"`,
    );

    return res.status(200).send(reporte.contenidoCsv);
  }

  // Obtener detalle de un evento con subeventos, fechas, recintos y ponentes
  @ApiOperation({
    summary: 'Consultar detalle de un evento aprobado',
  })
  @Get(':idEvento')
  async obtenerDetalleEventoPublico(
    @Param('idEvento', ParseIntPipe) idEvento: number,
    @Req() req: any,
  ) {
    const usuario = await this.extraerUsuarioOpcional(req);
    return await this.eventosService.obtenerDetalleEventoPublico(idEvento, usuario);
  }
}