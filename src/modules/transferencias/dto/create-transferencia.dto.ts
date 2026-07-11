import { Type } from 'class-transformer';
import { ArrayMinSize, IsInt, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class TransferenciaItemDto {
  @IsUUID()
  productoId: string;

  @IsInt()
  @Min(1)
  cantidad: number;
}

export class CreateTransferenciaDto {
  @IsUUID()
  sucursalDestinoId: string;

  @IsOptional()
  @IsString()
  observacion?: string;

  @ValidateNested({ each: true })
  @Type(() => TransferenciaItemDto)
  @ArrayMinSize(1)
  items: TransferenciaItemDto[];
}
