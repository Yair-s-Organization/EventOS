import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  async registrarUsuario(
    @Body()
    body: {
      nombre: string;
      apellidoPa: string;
      apellidoMa?: string;
      correo: string;
      contrasena: string;
    },
  ) {
    return await this.authService.registrar(body);
  }

  @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async iniciarSesion(@Body() body: LoginDto) {
    return await this.authService.login(body);
  }


  @ApiOperation({ summary: 'Cerrar sesión activa' })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async cerrarSesion() {
    return await this.authService.logout();
  }
}