import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventosService } from '../services/eventos.service';
import { CrearSolicitudDto } from '../dto/crearSolicitud.dto';
import { StorageService } from '../../../common/storage/storage.service';
import { posterOptions } from '../../../common/upload/upload.options';

@Controller('solicitudes')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SolicitudesController {
  constructor(
    private readonly eventosService: EventosService,
    private readonly storageService: StorageService,
  ) {}

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
