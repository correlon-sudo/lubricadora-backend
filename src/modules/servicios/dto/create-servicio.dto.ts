import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateServicioDto {
  @IsString()
  codigo: string;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsOptional()
  @IsBoolean()
  ivaAplicable?: boolean;
}
