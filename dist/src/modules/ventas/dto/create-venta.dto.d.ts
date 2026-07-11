import { TipoComprobante } from '@prisma/client';
import { CreatePagoDto, VentaItemDto } from './venta-item.dto';
export declare class CreateVentaDto {
    tipoComprobante: TipoComprobante;
    clienteId?: string;
    vehiculoId?: string;
    items: VentaItemDto[];
    pagos: CreatePagoDto[];
}
