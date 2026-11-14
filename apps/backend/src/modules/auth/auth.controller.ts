import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { ActivarCuentaLogisticaDto } from './dto/activarCuentaLogistica.dto';
import { SolicitarRecuperacionDto } from './dto/solicitarRecuperacion.dto';
import { RestablecerContrasenaDto } from './dto/restablecerContrasena.dto';
import { ConfirmarRegistroDto } from './dto/confirmarRegistro.dto';
import { RolesGuard } from './roles.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary:
      'Solicitar registro de usuario y enviar enlace de verificación por correo',
  })
  @ApiBody({ type: RegistroDto })
  @Post('registro')
  @HttpCode(HttpStatus.OK)
  async registrarUsuario(@Body() body: RegistroDto) {
    return await this.authService.registrar(body);
  }

  @ApiOperation({
    summary: 'Validar token de invitación recibido por correo para prellenar el registro',
  })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'Token JWT de invitación de logística o evento privado',
  })
  @Get('invitacion/validar')
  @HttpCode(HttpStatus.OK)
  async validarTokenInvitacion(@Query('token') token: string) {
    return await this.authService.validarTokenInvitacion(token);
  }

  @ApiOperation({
    summary:
      'Confirmar correo electrónico mediante token y crear la cuenta en la base de datos',
  })
  @ApiBody({ type: ConfirmarRegistroDto })
  @Post('confirmar-registro')
  @HttpCode(HttpStatus.CREATED)
  async confirmarRegistroPost(@Body() body: ConfirmarRegistroDto) {
    return await this.authService.confirmarRegistro(body?.token);
  }

  @ApiOperation({
    summary:
      'Confirmar correo electrónico por parámetro de consulta y crear la cuenta',
  })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'Token JWT recibido en el correo de confirmación de registro',
  })
  @Get('confirmar-registro')
  @HttpCode(HttpStatus.OK)
  async confirmarRegistroGet(@Query('token') token: string) {
    return await this.authService.confirmarRegistro(token);
  }

  @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async iniciarSesion(@Body() body: LoginDto) {
    return await this.authService.login(body);
  }

  @ApiOperation({
    summary:
      'Solicitar correo con enlace de recuperación de contraseña (15 min)',
  })
  @ApiBody({ type: SolicitarRecuperacionDto })
  @Post('recuperar-contrasena')
  @HttpCode(HttpStatus.OK)
  async solicitarRecuperacion(@Body() body: SolicitarRecuperacionDto) {
    return await this.authService.solicitarRecuperacionContrasena(body);
  }

  @ApiOperation({
    summary: 'Validar vigencia e integridad del token de recuperación',
  })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'Token JWT recibido en el correo',
  })
  @Get('restablecer-contrasena/validar')
  @HttpCode(HttpStatus.OK)
  async validarTokenRecuperacion(@Query('token') token: string) {
    return await this.authService.validarTokenRecuperacion(token);
  }

  @ApiOperation({
    summary: 'Restablecer contraseña con token de un solo uso',
  })
  @ApiBody({ type: RestablecerContrasenaDto })
  @Post('restablecer-contrasena')
  @HttpCode(HttpStatus.OK)
  async restablecerContrasena(@Body() body: RestablecerContrasenaDto) {
    return await this.authService.restablecerContrasena(body);
  }

  @ApiOperation({
    summary:
      'Activar cuenta mediante token JWT de invitación para Personal de Logística',
  })
  @Post('activar-logistica')
  @HttpCode(HttpStatus.CREATED)
  async activarCuentaLogistica(@Body() body: ActivarCuentaLogisticaDto) {
    return await this.authService.activarCuentaLogistica(body);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión activa e invalidar token JWT' })
  @Post('logout')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  async cerrarSesion(@Req() req: any) {
    const authHeader: string = req.headers?.authorization || '';
    const token = authHeader.split(' ')[1] || '';
    return await this.authService.logout(token);
  }
}