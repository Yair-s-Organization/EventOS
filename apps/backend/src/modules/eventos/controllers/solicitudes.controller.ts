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
import { EventosService } from '../services/eventos.service';
import { CrearSolicitudDto } from '../dto/crearSolicitud.dto';
import { StorageService } from '../../../common/storage/storage.service';
import { posterOptions } from '../../../common/upload/upload.options';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('solicitudes')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SolicitudesController {
  constructor(
    private readonly eventosService: EventosService,
    private readonly storageService: StorageService,
  ) {}

  // Lista solicitudes filtradas por estado (ej. ?estado=Pendiente). Solo Subdirección.
  @Get()
  @UseGuards(RolesGuard)
  @Roles(TipoCuentaUsuario.SUBDIRECCION)
  async listarSolicitudes(@Query('estado') estado?: string) {
    return await this.eventosService.listarSolicitudesPorEstado(estado);
  }

  // Detalle de solicitud para evaluación (CU03 / UI12). Protegido para Subdirección.
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(TipoCuentaUsuario.SUBDIRECCION)
  async obtenerDetalleSolicitud(@Param('id', ParseIntPipe) id: number) {
    return await this.eventosService.obtenerDetalleSolicitud(id);
  }

  // Aprueba una solicitud Pendiente. Solo Subdirección.
  @Patch(':id/aprobar')
  @UseGuards(RolesGuard)
  @Roles(TipoCuentaUsuario.SUBDIRECCION)
  async aprobarSolicitud(@Param('id', ParseIntPipe) id: number) {
    return await this.eventosService.aprobarSolicitud(id);
  }

  // Rechaza una solicitud Pendiente y libera horarios/recintos de sus subeventos. Solo Subdirección.
  @Patch(':id/rechazar')
  @UseGuards(RolesGuard)
  @Roles(TipoCuentaUsuario.SUBDIRECCION)
  async rechazarSolicitud(@Param('id', ParseIntPipe) id: number) {
    return await this.eventosService.rechazarSolicitud(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
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

    // ID del usuario autenticado vía JWT, o fallback al ID 1 en desarrollo
    const idOrganizador = req.user?.sub ?? 1;

    return await this.eventosService.registrarSolicitud(
      idOrganizador,
      dto,
      posterKey,
    );
  }
}
