import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProductoDto {
  @IsString()
  codigo: string;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsUUID()
  marcaId: string;

  @IsUUID()
  categoriaId: string;

  @IsNumber()
  @Min(0)
  precioCosto: number;

  @IsNumber()
  @Min(0)
  precioVenta: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockMinimo?: number;

  @IsOptional()
  @IsBoolean()
  ivaAplicable?: boolean;
}
