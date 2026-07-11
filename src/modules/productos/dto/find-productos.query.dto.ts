import { IsOptional, IsString, IsUUID } from 'class-validator';

export class FindProductosQueryDto {
  @IsOptional()
  @IsUUID()
  marcaId?: string;

  @IsOptional()
  @IsUUID()
  categoriaId?: string;

  @IsOptional()
  @IsUUID()
  sucursalId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
