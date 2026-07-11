import { TipoItemVenta } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { VentaItemDto } from './dto/venta-item.dto';
export interface ItemCalculado {
    tipoItem: TipoItemVenta;
    productoId: string | null;
    servicioId: string | null;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
    ivaPorcentaje: number;
    subtotalLinea: number;
    ivaLinea: number;
}
export interface TotalesCalculados {
    items: ItemCalculado[];
    subtotal: number;
    descuentoTotal: number;
    iva: number;
    total: number;
}
export declare class VentaCalculoService {
    private prisma;
    constructor(prisma: PrismaService);
    calcular(items: VentaItemDto[]): Promise<TotalesCalculados>;
}
