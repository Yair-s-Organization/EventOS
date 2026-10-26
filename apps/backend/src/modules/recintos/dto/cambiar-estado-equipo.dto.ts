import { IsBoolean, IsNotEmpty } from 'class-validator';

export class CambiarEstadoEquipoDto {
  @IsNotEmpty()
  @IsBoolean()
  estado: boolean;
}