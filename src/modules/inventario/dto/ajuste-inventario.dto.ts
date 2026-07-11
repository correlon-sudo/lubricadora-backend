import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, NotEquals } from 'class-validator';

export class AjusteInventarioDto {
  @IsUUID()
  productoId: string;

  @IsUUID()
  sucursalId: string;

  // Delta: positivo = entrada, negativo = salida
  @IsInt()
  @NotEquals(0)
  cantidad: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  observacion?: string;
}
