import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async iniciarSesion(@Body() body: LoginDto) {
    return await this.authService.login(body);
  }


  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async cerrarSesion() {
    return await this.authService.logout();
  }
}