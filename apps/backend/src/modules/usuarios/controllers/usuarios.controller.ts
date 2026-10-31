import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsuariosService } from '../services/usuarios.service';
import { VerificarIdentidadDto } from '../dto/verificar-identidad.dto';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TipoCuentaUsuario } from '@eventos/shared';

@ApiTags('Usuarios y Jefes de Departamento')
@ApiBearerAuth()
@Controller('usuarios')
@UseGuards(RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // Consulta de Perfil [ GET /api/usuarios/perfil ] 
  @ApiOperation({ summary: 'Consultar perfil y vigencia de verificación del usuario' })
  @Get('perfil')
  async obtenerPerfil(@Req() req: any) {
    const idUsuario = Number(req.user.sub ?? req.user.idUsuario);
    return await this.usuariosService.obtenerPerfil(idUsuario);
  }

  // Verificación de Identidad con archivo PDF [ POST /api/usuarios/verificar ]
  @ApiOperation({ summary: 'Enviar solicitud de verificación de identidad con PDF' })
  @Post('verificar')
  @UseInterceptors(FileInterceptor('documentoPDF'))
  async verificarCuenta(
    @Req() req: any,
    @Body() dto: VerificarIdentidadDto,
    @UploadedFile() file: any,
  ) {
    const idUsuario = Number(req.user.sub ?? req.user.idUsuario);

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

  // Tab 1 (Asignar Jefe): Candidatos institucionales que aún NO son jefes [ GET /api/usuarios/jefes-departamento/candidatos?buscar= ]
  @ApiOperation({
    summary: 'Tab 1 (Asignar Jefe): Listar cuentas institucionales candidatas por correo o nombre',
  })
  @Get('jefes-departamento/candidatos')
  @Roles(TipoCuentaUsuario.ADMINISTRADOR)
  async listarCandidatosJefe(@Query('buscar') buscar?: string) {
    return await this.usuariosService.listarCandidatosOJefes(false, buscar);
  }

  // Tab 2 (Revocar Jefe): Usuarios que actualmente SÍ son jefes [ GET /api/usuarios/jefes-departamento/activos?buscar= ]
  @ApiOperation({
    summary: 'Tab 2 (Revocar Jefe): Listar Jefes de Departamento activos por correo o nombre',
  })
  @Get('jefes-departamento/activos')
  @Roles(TipoCuentaUsuario.ADMINISTRADOR)
  async listarJefesActivos(@Query('buscar') buscar?: string) {
    return await this.usuariosService.listarCandidatosOJefes(true, buscar);
  }

  // Modal [Asignar]: Otorga permisos de Jefe de Departamento [ PATCH /api/usuarios/:id/asignar-jefe ]
  @ApiOperation({
    summary: 'Asignar permisos de Jefe de Departamento a un usuario',
  })
  @Patch(':id/asignar-jefe')
  @Roles(TipoCuentaUsuario.ADMINISTRADOR)
  async asignarJefe(@Param('id', ParseIntPipe) id: number) {
    return await this.usuariosService.asignarJefeDepartamento(id);
  }

  // Modal [Confirmar Revocar]: Revoca permisos de Jefe de Departamento, [ PATCH /api/usuarios/:id/revocar-jefe ]
  @ApiOperation({
    summary: 'Revocar permisos de Jefe de Departamento a un usuario',
  })
  @Patch(':id/revocar-jefe')
  @Roles(TipoCuentaUsuario.ADMINISTRADOR)
  async revocarJefe(@Param('id', ParseIntPipe) id: number) {
    return await this.usuariosService.revocarJefeDepartamento(id);
  }
}