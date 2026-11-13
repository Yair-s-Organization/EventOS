import { IsBoolean, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AgregarPersonalLogisticaDto {
  @ApiProperty({
    description:
      'Correo electrónico del colaborador a invitar o asignar como personal de logística',
    example: 'colaborador@ipn.mx',
  })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  @IsEmail({}, { message: 'Advertencia: Ingrese un correo válido.' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  correo: string;

  @ApiPropertyOptional({
    description:
      'Si es true, solo verifica si el usuario existe (asignándolo si existe) sin enviar aún el correo de invitación a usuarios no registrados',
  })
  @IsOptional()
  @IsBoolean()
  soloVerificar?: boolean;
}
