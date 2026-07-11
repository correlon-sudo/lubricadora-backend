import { FormaPago, TipoItemVenta } from '@prisma/client';
export declare class VentaItemDto {
    tipoItem: TipoItemVenta;
    productoId?: string;
    servicioId?: string;
    cantidad: number;
    descuento?: number;
}
export declare class CreatePagoDto {
    formaPago: FormaPago;
    monto: number;
    referencia?: string;
}
