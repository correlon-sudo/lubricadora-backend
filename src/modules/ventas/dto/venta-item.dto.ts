import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';
import { FormaPago, TipoItemVenta } from '@prisma/client';

export class VentaItemDto {
  @IsEnum(TipoItemVenta)
  tipoItem: TipoItemVenta;

  @ValidateIf((o) => o.tipoItem === 'PRODUCTO')
  @IsUUID()
  productoId?: string;

  @ValidateIf((o) => o.tipoItem === 'SERVICIO')
  @IsUUID()
  servicioId?: string;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  descuento?: number;
}

export class CreatePagoDto {
  @IsEnum(FormaPago)
  formaPago: FormaPago;

  @IsNumber()
  @Min(0.01)
  monto: number;

  @IsOptional()
  @IsString()
  referencia?: string;
}
