import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsUUID, Min, ValidateNested } from 'class-validator';

export class RecibirItemDto {
  @IsUUID()
  productoId: string;

  @IsInt()
  @Min(0)
  cantidadRecibida: number;
}

export class RecibirTransferenciaDto {
  // Si se omite, se recibe la cantidad completa enviada de cada ítem.
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecibirItemDto)
  items?: RecibirItemDto[];
}
