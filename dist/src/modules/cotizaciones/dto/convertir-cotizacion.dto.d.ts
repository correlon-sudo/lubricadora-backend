import { TipoComprobante } from '@prisma/client';
import { CreatePagoDto } from '../../ventas/dto/venta-item.dto';
export declare class ConvertirCotizacionDto {
    tipoComprobante: TipoComprobante;
    pagos: CreatePagoDto[];
}
