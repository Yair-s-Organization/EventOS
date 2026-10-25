import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { SubeventoPayload } from '@eventos/shared';

export class CrearSubEventoDto implements SubeventoPayload {
  @ApiProperty()
  @IsNotEmpty({ message: 'El nombre del subevento es obligatorio.' })
  @IsString({ message: 'El nombre del subevento debe ser una cadena de texto.' })
  @MaxLength(150, { message: 'El nombre del subevento no puede exceder 150 caracteres.' })
  nombre: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'La descripción del subevento es obligatoria.' })
  @IsString({ message: 'La descripción del subevento debe ser una cadena de texto.' })
  @MaxLength(500, { message: 'La descripción del subevento no puede exceder 500 caracteres.' })
  descripcion: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El idRecinto es obligatorio.' })
  @Transform(({ value }: { value: unknown }) => (value !== undefined ? Number(value) : value))
  @IsInt({ message: 'El idRecinto debe ser un número entero.' })
  @IsPositive({ message: 'El idRecinto debe ser un número positivo mayor a cero.' })
  idRecinto: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return value;
  })
  @IsBoolean({ message: 'El campo accesoQR debe ser un valor booleano.' })
  accesoQR?: boolean;

  @ApiProperty()
  @IsNotEmpty({ message: 'La fecha del evento es obligatoria.' })
  @IsDateString({}, { message: 'El formato de fecha debe ser válido (YYYY-MM-DD).' })
  fecha: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'La hora de inicio es obligatoria.' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'La hora de inicio debe tener formato HH:mm o HH:mm:ss (24h).',
  })
  horaInicio: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'La hora de finalización es obligatoria.' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'La hora de fin debe tener formato HH:mm o HH:mm:ss (24h).',
  })
  horaFin: string;
}

