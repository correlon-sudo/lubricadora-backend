import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateConfiguracionDto {
  @IsOptional()
  @IsString()
  ruc?: string;

  @IsOptional()
  @IsString()
  razonSocial?: string;

  @IsOptional()
  @IsString()
  nombreComercial?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentajeIva?: number;

  @IsOptional()
  @IsString()
  moneda?: string;
}
