import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlcanceEvento } from '@eventos/shared';
import { CrearSubEventoDto } from './crearSubEvento.dto';

export class CrearSolicitudDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'El nombre del evento es obligatorio.' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres.' })
  nombre: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Dato requerido faltante. La descripción no puede estar vacía.' }) // MSG-E-13
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @MaxLength(2000, { message: 'La descripción excede el límite máximo de caracteres permitidos.' }) // MSG-E-14
  descripcion: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Dato requerido faltante. La justificación no puede estar vacía.' }) // MSG-E-29
  @IsString({ message: 'La justificación debe ser una cadena de texto.' })
  justificacion: string;

  @ApiProperty({ enum: AlcanceEvento })
  @IsNotEmpty({ message: 'Debe seleccionar un tipo de alcance válido para continuar.' }) // MSG-E-15
  @Transform(({ value }: { value: unknown }) => (value !== undefined ? Number(value) : value))
  @IsEnum(AlcanceEvento, { message: 'Debe seleccionar un tipo de alcance válido para continuar.' })
  idAlcance: AlcanceEvento;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'La ruta del póster debe ser una cadena de texto.' })
  poster?: string;

  @ApiProperty({ type: () => [CrearSubEventoDto] })
  @IsNotEmpty({ message: 'La solicitud debe contener al menos un subevento.' })
  @Transform(({ value }: { value: unknown }) => {
    // Si la petición viene por FormData (multipart/form-data), el campo llega serializado en texto
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
        item instanceof CrearSubEventoDto ? item : plainToInstance(CrearSubEventoDto, item),
      );
    }
    return parsed;
  })
  @IsArray({ message: 'Los subeventos deben enviarse en formato de lista/arreglo.' })
  @ArrayMinSize(1, { message: 'La solicitud debe contener al menos un subevento.' })
  @ValidateNested({ each: true })
  subeventos: CrearSubEventoDto[];
}

