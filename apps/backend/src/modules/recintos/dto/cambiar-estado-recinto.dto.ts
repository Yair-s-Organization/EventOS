import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoRecinto } from '@eventos/shared';

export class CambiarEstadoRecintoDto {
    @IsNotEmpty()
    @IsEnum(EstadoRecinto)
    idEstadoRecinto: EstadoRecinto;
}