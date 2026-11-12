import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class EscanearBoletoDto {
  @ApiPropertyOptional({
    description: 'El token extraído del código QR',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  tokenQr?: string;

  @ApiPropertyOptional({
    description: 'El ID numérico del boleto (alternativa manual al QR)',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  idBoleto?: number;
}
