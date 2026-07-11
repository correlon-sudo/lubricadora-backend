import { VentaItemDto } from '../../ventas/dto/venta-item.dto';
export declare class CreateCotizacionDto {
    clienteId?: string;
    vehiculoId?: string;
    validezDias?: number;
    items: VentaItemDto[];
}
