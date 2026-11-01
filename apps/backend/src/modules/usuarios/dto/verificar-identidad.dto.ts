import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoPerfilVerificacion } from '@eventos/shared';

export class VerificarIdentidadDto {
  @ApiProperty({
    description: 'Tipo de perfil que solicita la verificación',
    enum: TipoPerfilVerificacion,
    example: 'Estudiante',
  })
  @IsNotEmpty()
  @IsEnum(TipoPerfilVerificacion)
  tipoPerfil: TipoPerfilVerificacion;

  @ApiProperty({
    description: 'Información adicional (por ejemplo, número de boleta si es interno)',
    example: '2025630917',
    required: false,
  })
  @IsOptional()
  @IsString()
  informacionAdicional?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Documento probatorio en formato PDF',
  })
  documentoPDF: any; 
}
