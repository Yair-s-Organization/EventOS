import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { ApiBearerAuth, ApiOperation, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { UsuariosService } from '../services/usuarios.service';
import { VerificarIdentidadDto } from '../dto/verificar-identidad.dto';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TipoCuentaUsuario } from '@eventos/shared';

@ApiTags('Usuarios, Verificaciones y Administración de Cuentas')
@ApiBearerAuth()
@Controller('usuarios')
@UseGuards(RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // Consulta de Perfil
  @ApiOperation({
    summary: 'Consultar perfil y vigencia de verificación del usuario',
  })
  @Get('perfil')
  async obtenerPerfil(@Req() req: any) {
    const idUsuario = Number(req.user.sub ?? req.user.idUsuario);
    return await this.usuariosService.obtenerPerfil(idUsuario);
  }

  // Verificación de Identidad con archivo PDF
  @ApiOperation({
    summary:
      'Enviar solicitud de verificación de identidad con PDF (queda Pendiente hasta aprobación de Subdirección)',
  })
  @ApiConsumes('multipart/form-data')
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

  // SUBDIRECCIÓN: Listar solicitudes de verificación pendientes
  @ApiOperation({
    summary:
      'Subdirección: Listar solicitudes de verificación de usuario pendientes',
  })
  @Get('verificaciones/pendientes')
  @Roles(TipoCuentaUsuario.SUBDIRECCION, TipoCuentaUsuario.ADMINISTRADOR)
  async listarVerificacionesPendientes(@Query('todas') todas?: string) {
    const soloPendientes = todas !== 'true';
    return await this.usuariosService.listarSolicitudesVerificacion(
      soloPendientes,
    );
  }

  // SUBDIRECCIÓN: Ver detalle de solicitud de verificación
  @ApiOperation({
    summary:
      'Subdirección: Consultar detalle y PDF de una solicitud de verificación',
  })
  @Get('verificaciones/:id')
  @Roles(TipoCuentaUsuario.SUBDIRECCION, TipoCuentaUsuario.ADMINISTRADOR)
  async obtenerDetalleVerificacion(@Param('id', ParseIntPipe) id: number) {
    return await this.usuariosService.obtenerDetalleVerificacion(id);
  }

  // SUBDIRECCIÓN Botón [Verificar usuario]
  @ApiOperation({
    summary:
      'Subdirección: Aprobar verificación de usuario (Botón Verificar usuario)',
  })
  @Patch('verificaciones/:id/aprobar')
  @Roles(TipoCuentaUsuario.SUBDIRECCION, TipoCuentaUsuario.ADMINISTRADOR)
  async aprobarVerificacion(@Param('id', ParseIntPipe) id: number) {
    return await this.usuariosService.aprobarVerificacionUsuario(id);
  }

  // SUBDIRECCIÓN Botón [Rechazar]
  @ApiOperation({
    summary: 'Subdirección: Rechazar solicitud de verificación de usuario',
  })
  @Patch('verificaciones/:id/rechazar')
  @Roles(TipoCuentaUsuario.SUBDIRECCION, TipoCuentaUsuario.ADMINISTRADOR)
  async rechazarVerificacion(@Param('id', ParseIntPipe) id: number) {
    return await this.usuariosService.rechazarVerificacionUsuario(id);
  }

  // ADMINISTRADOR Listar cuentas del sistema
  @ApiOperation({
    summary: 'Administrador (UI21): Listar cuentas del sistema con filtros',
  })
  @Get('admin/cuentas')
  @Roles(TipoCuentaUsuario.ADMINISTRADOR)
  async listarCuentasSistema(
    @Query('criterio') criterio?: string,
    @Query('buscar') buscar?: string,
    @Query('nombre') nombre?: string,
    @Query('correo') correo?: string,
    @Query('rol') rol?: string,
    @Query('estado') estado?: string,
  ) {
    return await this.usuariosService.listarCuentasSistema({
      criterio,
      buscar,
      nombre,
      correo,
      rol,
      estado,
    });
  }

  // ADMINISTRADOR Botón [Eliminar]
  @ApiOperation({
    summary:
      'Administrador: Eliminar lógicamente (inhabilitar) cuenta de usuario',
  })
  @Delete('admin/cuentas/:id')
  @Roles(TipoCuentaUsuario.ADMINISTRADOR)
  async eliminarCuenta(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const idAdminActor = Number(req.user.sub ?? req.user.idUsuario);
    return await this.usuariosService.eliminarCuentaLogica(id, idAdminActor);
  }

  // Tab 1 Asignar Jefe. Candidatos que aún NO son jefes (Excluye Subdirección y Admin)
  @ApiOperation({
    summary:
      'Tab 1 (Asignar Jefe): Listar cuentas institucionales candidatas por correo o nombre',
  })
  @Get('jefes-departamento/candidatos')
  @Roles(TipoCuentaUsuario.ADMINISTRADOR)
  async listarCandidatosJefe(
    @Req() req: any,
    @Query('buscar') buscar?: string,
  ) {
    const idAdminActor = Number(req.user?.sub ?? req.user?.idUsuario);
    return await this.usuariosService.listarCandidatosOJefes(
      false,
      buscar,
      idAdminActor,
    );
  }

  // Tab 2 Revocar Jefe. Usuarios que actualmente SÍ son jefes
  @ApiOperation({
    summary:
      'Tab 2 (Revocar Jefe): Listar Jefes de Departamento activos por correo o nombre',
  })
  @Get('jefes-departamento/activos')
  @Roles(TipoCuentaUsuario.ADMINISTRADOR)
  async listarJefesActivos(@Query('buscar') buscar?: string) {
    return await this.usuariosService.listarCandidatosOJefes(true, buscar);
  }

  //Otorga permisos de Jefe de Departamento (Bloquea Subdirección y Admin)
  @ApiOperation({
    summary: 'Asignar permisos de Jefe de Departamento a un usuario',
  })
  @Patch(':id/asignar-jefe')
  @Roles(TipoCuentaUsuario.ADMINISTRADOR)
  async asignarJefe(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const idAdminActor = Number(req.user?.sub ?? req.user?.idUsuario);
    return await this.usuariosService.asignarJefeDepartamento(id, idAdminActor);
  }

  //Revoca permisos de Jefe de Departamento
  @ApiOperation({
    summary: 'Revocar permisos de Jefe de Departamento a un usuario',
  })
  @Patch(':id/revocar-jefe')
  @Roles(TipoCuentaUsuario.ADMINISTRADOR)
  async revocarJefe(@Param('id', ParseIntPipe) id: number) {
    return await this.usuariosService.revocarJefeDepartamento(id);
  }
}