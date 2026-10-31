import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TipoPerfilVerificacion } from '@eventos/shared';

export class VerificarIdentidadDto {
  @IsNotEmpty()
  @IsEnum(TipoPerfilVerificacion)
  tipoPerfil: TipoPerfilVerificacion;
  @IsOptional() //Opcional porque el externo no manda nada
  @IsString()
  informacionAdicional?: string;
}