import { IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { TipoMovimientoCaja } from '@prisma/client';

export class MovimientoCajaDto {
  @IsEnum(TipoMovimientoCaja)
  tipo: TipoMovimientoCaja;

  @IsNumber()
  @Min(0.01)
  monto: number;

  @IsString()
  concepto: string;
}
