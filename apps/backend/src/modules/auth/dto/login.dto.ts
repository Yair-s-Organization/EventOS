import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'organizador@ipn.mx' })
  @IsEmail({}, { message: 'Credenciales incorrectas o inexistentes.' })
  @MaxLength(120, { message: 'Credenciales incorrectas o inexistentes.' })
  @IsNotEmpty({ message: 'Por favor, completa todos los campos obligatorios.' })
  @IsString({ message: 'Por favor, completa todos los campos obligatorios.' })
  correo: string;

  @ApiProperty({ example: 'Admin123!' })
  @MaxLength(72, { message: 'Credenciales incorrectas o inexistentes.' })
  @IsNotEmpty({ message: 'Por favor, completa todos los campos obligatorios.' })
  @IsString({ message: 'Por favor, completa todos los campos obligatorios.' })
  contrasena: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  captchaToken?: string;
}
