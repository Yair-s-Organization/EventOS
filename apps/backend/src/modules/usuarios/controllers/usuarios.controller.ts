import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsuariosService } from '../services/usuarios.service';
import { VerificarIdentidadDto } from '../dto/verificar-identidad.dto';
import { RolesGuard } from '../../auth/roles.guard';

@Controller('usuarios')
@UseGuards(RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // Consulta de Perfil (UI28)
  @Get('perfil')
  async obtenerPerfil(@Req() req: any) {
    const idUsuario = req.user.idUsuario;
    return await this.usuariosService.obtenerPerfil(idUsuario);
  }

  // Verificación de Identidad con archivo PDF (UI32)
  @Post('verificar')
  @UseInterceptors(FileInterceptor('documentoPDF'))
  async verificarCuenta(
    @Req() req: any,
    @Body() dto: VerificarIdentidadDto,
    @UploadedFile() file: any,
  ) {
    const idUsuario = req.user.idUsuario;

    if (!file) {
      throw new BadRequestException('El archivo PDF es requerido.');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException(
        'Solo se admiten documentos en formato PDF.',
      );
    }

    const archivoBase64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    return await this.usuariosService.verificarCuenta(
      idUsuario,
      dto.tipoPerfil,
      dto.informacionAdicional ?? null,
      archivoBase64,
    );
  }
}