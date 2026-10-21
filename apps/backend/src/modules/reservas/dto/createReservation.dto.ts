import { IsInt, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

export class CreateReservationDto {
    @IsNotEmpty({ message: 'El idSubEvento es obligatorio' })
    @IsInt({ message: 'El idSubEvento debe ser un número entero' })
    @IsPositive({ message: 'El idSubEvento debe ser un número positivo mayor a cero' })
    idSubEvento: number;
    
    @IsOptional()
    @IsInt({ message: 'El idAsiento debe ser un número entero' })
    @IsPositive({ message: 'El idAsiento debe ser un número positivo mayor a cero' })
    idAsiento?: number;
}