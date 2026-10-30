import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'organizador@ipn.mx' })
  @IsEmail()
  correo: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsNotEmpty()
  @IsString()
  contrasena: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  captchaToken?: string;
}
