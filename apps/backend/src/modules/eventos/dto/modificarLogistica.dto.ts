import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  ModificarLogisticaPayload,
  SubEventoLogisticaPayload,
} from '@eventos/shared';
import { CrearSubEventoDto } from './crearSubEvento.dto';

export class SubEventoLogisticaItemDto
  extends CrearSubEventoDto
  implements SubEventoLogisticaPayload
{
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value !== undefined && value !== null ? Number(value) : value,
  )
  @IsInt({ message: 'El idSubEvento debe ser un número entero.' })
  @IsPositive({ message: 'El idSubEvento debe ser un número positivo mayor a cero.' })
  idSubEvento?: number;
}

export class ModificarLogisticaDto implements ModificarLogisticaPayload {
  @ApiProperty({ type: () => [SubEventoLogisticaItemDto] })
  @IsNotEmpty({ message: 'La solicitud debe contener al menos un subevento.' })
  @Transform(({ value }: { value: unknown }) => {
    let parsed = value;
    if (typeof value === 'string') {
      try {
        parsed = JSON.parse(value);
      } catch {
        parsed = value;
      }
    }
    if (Array.isArray(parsed)) {
      return parsed.map((item) =>
        item instanceof SubEventoLogisticaItemDto
          ? item
          : plainToInstance(SubEventoLogisticaItemDto, item),
      );
    }
    return parsed;
  })
  @IsArray({ message: 'Los subeventos deben enviarse en formato de lista/arreglo.' })
  @ArrayMinSize(1, { message: 'La solicitud debe contener al menos un subevento.' })
  @ValidateNested({ each: true })
  @Type(() => SubEventoLogisticaItemDto)
  subeventos: SubEventoLogisticaItemDto[];

  @ApiProperty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({
    message: 'Dato requerido faltante. La justificación no puede estar vacía.',
  })
  @IsString({
    message: 'El motivo de modificación debe ser una cadena de texto.',
  })
  @MaxLength(500, {
    message: 'La descripción excede el límite máximo de caracteres permitidos.',
  })
  motivoModificacion: string;
}
