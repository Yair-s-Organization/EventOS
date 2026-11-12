import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const SOLO_LETRAS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const PASSWORD_COMPLEJIDAD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,72}$/;

export class RegistroDto {
  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(SOLO_LETRAS_REGEX, {
    message:
      'El nombre y los apellidos solo pueden contener letras, sin números ni símbolos especiales.',
  })
  @MaxLength(50, {
    message: 'El nombre y los apellidos no pueden exceder los 50 caracteres.',
  })
  @IsNotEmpty({
    message:
      'Por favor, completa todos los campos obligatorios resaltados para continuar.',
  })
  @IsString({
    message:
      'Por favor, completa todos los campos obligatorios resaltados para continuar.',
  })
  nombre: string;

  @ApiProperty({ description: 'Apellido paterno', example: 'Pérez' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(SOLO_LETRAS_REGEX, {
    message:
      'El nombre y los apellidos solo pueden contener letras, sin números ni símbolos especiales.',
  })
  @MaxLength(50, {
    message: 'El nombre y los apellidos no pueden exceder los 50 caracteres.',
  })
  @IsNotEmpty({
    message:
      'Por favor, completa todos los campos obligatorios resaltados para continuar.',
  })
  @IsString({
    message:
      'Por favor, completa todos los campos obligatorios resaltados para continuar.',
  })
  apellidoPa: string;

  @ApiProperty({ description: 'Apellido materno', example: 'Gómez' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(SOLO_LETRAS_REGEX, {
    message:
      'El nombre y los apellidos solo pueden contener letras, sin números ni símbolos especiales.',
  })
  @MaxLength(50, {
    message: 'El nombre y los apellidos no pueden exceder los 50 caracteres.',
  })
  @IsNotEmpty({
    message:
      'Por favor, completa todos los campos obligatorios resaltados para continuar.',
  })
  @IsString({
    message:
      'Por favor, completa todos los campos obligatorios resaltados para continuar.',
  })
  apellidoMa: string;

  @ApiProperty({
    description: 'Correo electrónico institucional o personal',
    example: 'juan.perez@example.com',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Advertencia: Ingrese un correo válido.' })
  @MaxLength(120, {
    message: 'Advertencia: Ingrese un correo válido.',
  })
  @IsNotEmpty({
    message:
      'Por favor, completa todos los campos obligatorios resaltados para continuar.',
  })
  @IsString({
    message:
      'Por favor, completa todos los campos obligatorios resaltados para continuar.',
  })
  correo: string;

  @ApiProperty({
    description: 'Contraseña de la cuenta',
    example: 'Password123!',
  })
  @Matches(PASSWORD_COMPLEJIDAD_REGEX, {
    message:
      'La contraseña debe tener al menos 8 caracteres e incluir letras y números.',
  })
  @MaxLength(72, {
    message: 'La contraseña no puede exceder los 72 caracteres.',
  })
  @MinLength(8, {
    message:
      'La contraseña debe tener al menos 8 caracteres e incluir letras y números.',
  })
  @IsNotEmpty({
    message:
      'Por favor, completa todos los campos obligatorios resaltados para continuar.',
  })
  @IsString({
    message:
      'Por favor, completa todos los campos obligatorios resaltados para continuar.',
  })
  contrasena: string;
}
