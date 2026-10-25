import { IsNotEmpty, IsString } from 'class-validator';

export class CancelarSolicitudDto {
  @IsNotEmpty({ message: 'El motivo de cancelación es obligatorio.' })
  @IsString({ message: 'El motivo de cancelación debe ser una cadena de texto.' })
  motivo: string;
}
