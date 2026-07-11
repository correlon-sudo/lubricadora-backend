import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateVehiculoDto {
  @IsUUID()
  clienteId: string;

  @IsString()
  placa: string;

  @IsString()
  marca: string;

  @IsString()
  modelo: string;

  @IsOptional()
  @IsInt()
  anio?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  kilometraje?: number;
}
