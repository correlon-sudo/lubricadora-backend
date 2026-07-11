import { TipoComprobante } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { VentaCalculoService, TotalesCalculados } from './venta-calculo.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { CreatePagoDto } from './dto/venta-item.dto';
interface PersistirParams {
    tipoComprobante: TipoComprobante;
    clienteId?: string;
    vehiculoId?: string;
    cotizacionId?: string;
    pagos: CreatePagoDto[];
    sucursalId: string;
    usuarioId: string;
    ip?: string;
}
export declare class VentasService {
    private prisma;
    private calculoService;
    private pdfService;
    private auditoriaService;
    constructor(prisma: PrismaService, calculoService: VentaCalculoService, pdfService: PdfService, auditoriaService: AuditoriaService);
    findAll(sucursalId?: string): Promise<{
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
    }[]>;
    findOne(id: string): Promise<{
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
    create(dto: CreateVentaDto, sucursalId: string, usuarioId: string, ip?: string): Promise<{
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
    persistir(calculado: TotalesCalculados, params: PersistirParams): Promise<{
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
    anular(id: string, usuarioIdQueAnula: string, ip?: string): Promise<{
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
    private consumidorFinalId;
    private serializar;
    private buildVentaHtml;
}
export {};
