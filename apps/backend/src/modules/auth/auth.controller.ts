import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { RolesGuard } from './roles.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  async registrarUsuario(
    @Body()
    body: RegistroDto,
  ) {
    return await this.authService.registrar(body);
  }

  @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async iniciarSesion(@Body() body: LoginDto) {
    return await this.authService.login(body);
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