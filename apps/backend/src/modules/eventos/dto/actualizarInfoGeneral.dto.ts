import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AlcanceEvento,
  type ActualizarInfoGeneralPayload,
  type PonentePayload,
} from '@eventos/shared';

export class PonenteItemDto implements PonentePayload {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value !== undefined && value !== null ? Number(value) : value,
  )
  @IsInt({ message: 'El idPonente debe ser un número entero.' })
  @IsPositive({ message: 'El idPonente debe ser un número positivo.' })
  idPonente?: number;

  @ApiProperty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({ message: 'El nombre del ponente es obligatorio.' })
  @IsString({ message: 'El nombre del ponente debe ser una cadena de texto.' })
  @MaxLength(50, { message: 'El nombre del ponente no puede exceder 50 caracteres.' })
  nombre: string;

  @ApiProperty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({ message: 'El apellido paterno del ponente es obligatorio.' })
  @IsString({ message: 'El apellido paterno debe ser una cadena de texto.' })
  @MaxLength(50, { message: 'El apellido paterno no puede exceder 50 caracteres.' })
  apellidoPa: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'El apellido materno debe ser una cadena de texto.' })
  @MaxLength(50, { message: 'El apellido materno no puede exceder 50 caracteres.' })
  apellidoMa?: string | null;

  @ApiProperty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({ message: 'Advertencia: Ingrese un correo válido.' })
  @IsEmail({}, { message: 'Advertencia: Ingrese un correo válido.' })
  @MaxLength(254, { message: 'El correo no puede exceder 254 caracteres.' })
  correo: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value !== undefined && value !== null ? Number(value) : value,
  )
  @IsInt({ message: 'El idSubEvento debe ser un número entero.' })
  @IsPositive({ message: 'El idSubEvento debe ser un número positivo.' })
  idSubEvento?: number;
}

export class ActualizarInfoGeneralDto implements ActualizarInfoGeneralPayload {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({ message: 'El nombre del evento es obligatorio.' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres.' })
  nombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({
    message: 'Dato requerido faltante. La descripción no puede estar vacía.',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @MaxLength(500, {
    message: 'La descripción excede el límite máximo de caracteres permitidos.',
  })
  descripcion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({
    message: 'Dato requerido faltante. La justificación no puede estar vacía.',
  })
  @IsString({ message: 'La justificación debe ser una cadena de texto.' })
  @MaxLength(2000, {
    message: 'La descripción excede el límite máximo de caracteres permitidos.',
  })
  justificacion?: string;

  @ApiPropertyOptional({ enum: AlcanceEvento })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value !== undefined && value !== null ? Number(value) : value,
  )
  @IsEnum(AlcanceEvento, {
    message: 'Debe seleccionar un tipo de alcance válido para continuar.',
  })
  idAlcance?: AlcanceEvento;

  @ApiPropertyOptional({ type: () => [PonenteItemDto] })
  @IsOptional()
  @IsArray({ message: 'La lista de ponentes debe ser un arreglo.' })
  @ValidateNested({ each: true })
  @Type(() => PonenteItemDto)
  ponentes?: PonenteItemDto[];
}
