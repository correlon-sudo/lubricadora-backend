import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CerrarCajaDto {
  @IsNumber()
  @Min(0)
  montoContado: number;

  @IsOptional()
  @IsString()
  observacion?: string;
}
