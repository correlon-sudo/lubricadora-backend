import { TipoMovimientoCaja } from '@prisma/client';
export declare class MovimientoCajaDto {
    tipo: TipoMovimientoCaja;
    monto: number;
    concepto: string;
}
