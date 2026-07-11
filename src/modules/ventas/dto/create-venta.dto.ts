import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsEnum,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { TipoComprobante } from '@prisma/client';
import { CreatePagoDto, VentaItemDto } from './venta-item.dto';

export class CreateVentaDto {
  @IsEnum(TipoComprobante)
  tipoComprobante: TipoComprobante;

  @IsOptional()
  @IsUUID()
  clienteId?: string;

  @IsOptional()
  @IsUUID()
  vehiculoId?: string;

  @ValidateNested({ each: true })
  @Type(() => VentaItemDto)
  @ArrayMinSize(1)
  items: VentaItemDto[];

  @ValidateNested({ each: true })
  @Type(() => CreatePagoDto)
  @ArrayMinSize(1)
  pagos: CreatePagoDto[];
}
