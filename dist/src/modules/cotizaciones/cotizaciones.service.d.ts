import { PrismaService } from '../../config/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { VentaCalculoService } from '../ventas/venta-calculo.service';
import { VentasService } from '../ventas/ventas.service';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { ConvertirCotizacionDto } from './dto/convertir-cotizacion.dto';
export declare class CotizacionesService {
    private prisma;
    private calculoService;
    private ventasService;
    private pdfService;
    constructor(prisma: PrismaService, calculoService: VentaCalculoService, ventasService: VentasService, pdfService: PdfService);
    findAll(sucursalId?: string): Promise<{
        subtotal: number;
        descuento: number;
        iva: number;
        total: number;
        detalles: {
            precioUnitario: number;
            descuento: number;
            ivaPorcentaje: number;
            subtotal: number;
        }[];
    }[]>;
    findOne(id: string): Promise<{
        subtotal: number;
        descuento: number;
        iva: number;
        total: number;
        detalles: {
            precioUnitario: number;
            descuento: number;
            ivaPorcentaje: number;
            subtotal: number;
        }[];
    }>;
    create(dto: CreateCotizacionDto, sucursalId: string, usuarioId: string): Promise<{
        subtotal: number;
        descuento: number;
        iva: number;
        total: number;
        detalles: {
            precioUnitario: number;
            descuento: number;
            ivaPorcentaje: number;
            subtotal: number;
        }[];
    }>;
    convertir(id: string, dto: ConvertirCotizacionDto, usuarioId: string): Promise<{
        subtotal: number;
        descuentoTotal: number;
        iva: number;
        total: number;
        detalles: {
            precioUnitario: number;
            descuento: number;
            ivaPorcentaje: number;
            subtotal: number;
        }[];
        pagos: {
            monto: number;
        }[];
    }>;
    reportePdf(id: string): Promise<Buffer<ArrayBufferLike>>;
    private generarNumero;
    private serializar;
    private buildCotizacionHtml;
}
