import { Type } from 'class-transformer';
import { ArrayMinSize, IsInt, IsOptional, IsUUID, Min, ValidateNested } from 'class-validator';
import { VentaItemDto } from '../../ventas/dto/venta-item.dto';

export class CreateCotizacionDto {
  @IsOptional()
  @IsUUID()
  clienteId?: string;

  @IsOptional()
  @IsUUID()
  vehiculoId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  validezDias?: number;

  @ValidateNested({ each: true })
  @Type(() => VentaItemDto)
  @ArrayMinSize(1)
  items: VentaItemDto[];
}
