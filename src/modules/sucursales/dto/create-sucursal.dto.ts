import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateSucursalDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsBoolean()
  esMatriz?: boolean;
}
