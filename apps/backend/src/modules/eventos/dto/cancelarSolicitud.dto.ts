import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Expose, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CancelarSolicitudPayload } from '@eventos/shared';

export class CancelarSolicitudDto implements CancelarSolicitudPayload {
  @ApiProperty()
  @Expose()
  @Transform(({ value, obj }: { value: unknown; obj: Record<string, unknown> }) => {
    const raw = value !== undefined ? value : obj?.motivoCancelacion;
    return typeof raw === 'string' ? raw.trim() : raw;
  })
  @IsNotEmpty({
    message: 'Dato requerido faltante. La justificación no puede estar vacía.',
  })
  @IsString({
    message: 'El motivo de cancelación debe ser una cadena de texto.',
  })
  @MaxLength(500, {
    message: 'La descripción excede el límite máximo de caracteres permitidos.',
  })
  motivo: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({
    message: 'El motivo de cancelación debe ser una cadena de texto.',
  })
  motivoCancelacion?: string;
}
