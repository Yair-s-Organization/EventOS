import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import type { SubeventoPayload } from '@eventos/shared';

export class CrearSubEventoDto implements SubeventoPayload {
  @IsNotEmpty({ message: 'El idRecinto es obligatorio.' })
  @Transform(({ value }: { value: unknown }) => (value !== undefined ? Number(value) : value))
  @IsInt({ message: 'El idRecinto debe ser un número entero.' })
  @IsPositive({ message: 'El idRecinto debe ser un número positivo mayor a cero.' })
  idRecinto: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return value;
  })
  @IsBoolean({ message: 'El campo accesoQR debe ser un valor booleano.' })
  accesoQR?: boolean;

  @IsNotEmpty({ message: 'La fecha del evento es obligatoria.' })
  @IsDateString({}, { message: 'El formato de fecha debe ser válido (YYYY-MM-DD).' })
  fecha: string;

  @IsNotEmpty({ message: 'La hora de inicio es obligatoria.' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'La hora de inicio debe tener formato HH:mm o HH:mm:ss (24h).',
  })
  horaInicio: string;

  @IsNotEmpty({ message: 'La hora de finalización es obligatoria.' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'La hora de fin debe tener formato HH:mm o HH:mm:ss (24h).',
  })
  horaFin: string;
}
