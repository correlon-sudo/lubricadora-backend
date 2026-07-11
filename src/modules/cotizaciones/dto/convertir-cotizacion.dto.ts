import { Type } from 'class-transformer';
import { ArrayMinSize, IsEnum, ValidateNested } from 'class-validator';
import { TipoComprobante } from '@prisma/client';
import { CreatePagoDto } from '../../ventas/dto/venta-item.dto';

export class ConvertirCotizacionDto {
  @IsEnum(TipoComprobante)
  tipoComprobante: TipoComprobante;

  @ValidateNested({ each: true })
  @Type(() => CreatePagoDto)
  @ArrayMinSize(1)
  pagos: CreatePagoDto[];
}
