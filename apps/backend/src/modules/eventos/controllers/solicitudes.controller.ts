import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TipoCuentaUsuario } from '@eventos/shared';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventosService } from '../services/eventos.service';
import { CrearSolicitudDto } from '../dto/crearSolicitud.dto';
import { CancelarSolicitudDto } from '../dto/cancelarSolicitud.dto';
import { StorageService } from '../../../common/storage/storage.service';
import { posterOptions } from '../../../common/upload/upload.options';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('Solicitudes')
@ApiBearerAuth()
@Controller('solicitudes')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SolicitudesController {
  constructor(
    private readonly eventosService: EventosService,
    private readonly storageService: StorageService,
  ) {}

  // Lista solicitudes filtradas por estado (ej. ?estado=Pendiente o ?estado=Aprobado). Solo Subdirección.
  @ApiOperation({
    summary: 'Listar solicitudes de eventos filtradas por estado',
  })
  @Get()
  @UseGuards(RolesGuard)
  @Roles(TipoCuentaUsuario.SUBDIRECCION)
  async listarSolicitudes(@Query('estado') estado?: string) {
    return await this.eventosService.listarSolicitudesPorEstado(estado);
  }

  // Detalle de solicitud para evaluación (CU03 / UI12). Protegido para Subdirección.
  @ApiOperation({
    summary: 'Obtener detalle de una solicitud para evaluación',
  })
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(TipoCuentaUsuario.SUBDIRECCION)
  async obtenerDetalleSolicitud(@Param('id', ParseIntPipe) id: number) {
    return await this.eventosService.obtenerDetalleSolicitud(id);
  }

  // Aprueba una solicitud Pendiente. Solo Subdirección.
  @ApiOperation({
    summary: 'Aprobar solicitud de evento pendiente',
  })
  @Patch(':id/aprobar')
  @UseGuards(RolesGuard)
  @Roles(TipoCuentaUsuario.SUBDIRECCION)
  async aprobarSolicitud(@Param('id', ParseIntPipe) id: number) {
    return await this.eventosService.aprobarSolicitud(id);
  }

  // Rechaza una solicitud Pendiente y libera horarios/recintos de sus subeventos. Solo Subdirección.
  @ApiOperation({
    summary: 'Rechazar solicitud de evento pendiente y liberar espacios',
  })
  @Patch(':id/rechazar')
  @UseGuards(RolesGuard)
  @Roles(TipoCuentaUsuario.SUBDIRECCION)
  async rechazarSolicitud(@Param('id', ParseIntPipe) id: number) {
    return await this.eventosService.rechazarSolicitud(id);
  }

  // Cancela un evento Aprobado exigiendo motivo (RN-25), liberando subeventos (RN-22) y registrando en bitácora (RNF-26). Solo Subdirección.
  @ApiOperation({
    summary: 'Cancelar evento aprobado con motivo obligatorio',
  })
  @Patch(':id/cancelar')
  @UseGuards(RolesGuard)
  @Roles(TipoCuentaUsuario.SUBDIRECCION)
  async cancelarSolicitud(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelarSolicitudDto,
    @Req() req: any,
  ) {
    const idUsuarioActor = req.user?.sub;
    return await this.eventosService.cancelarSolicitud(
      id,
      dto.motivo,
      idUsuarioActor,
    );
  }

  @ApiOperation({
    summary: 'Crear nueva solicitud de evento',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(
    TipoCuentaUsuario.INTERNO,
    TipoCuentaUsuario.EXTERNO,
    TipoCuentaUsuario.SUBDIRECCION,
  )
  @UseInterceptors(FileInterceptor('poster', posterOptions))
  async crearSolicitud(
    @Body() dto: CrearSolicitudDto,
    @Req() req: any,
    @UploadedFile() posterFile?: Express.Multer.File,
  ) {
    // Si viene un archivo físico para el póster, lo sube a MinIO / S3 y obtiene la key
    const posterKey = posterFile
      ? await this.storageService.upload(posterFile, 'posters', 'public')
      : undefined;

    const idOrganizador = req.user?.sub;

    return await this.eventosService.registrarSolicitud(
      idOrganizador,
      dto,
      posterKey,
    );
  }
}
