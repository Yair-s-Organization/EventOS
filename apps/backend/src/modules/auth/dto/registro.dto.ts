// src/auth/dto/registro.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class RegistroDto {
  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan' })
  nombre: string;

  @ApiProperty({ description: 'Apellido paterno', example: 'Pérez' })
  apellidoPa: string;

  @ApiProperty({ description: 'Apellido materno', example: 'Gómez' })
  apellidoMa: string;

  @ApiProperty({ description: 'Correo electrónico institucional o personal', example: 'juan.perez@example.com' })
  correo: string;

  @ApiProperty({ description: 'Contraseña de la cuenta', example: 'Password123!' })
  contrasena: string;
}
