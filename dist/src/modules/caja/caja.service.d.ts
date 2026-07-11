import { PrismaService } from '../../config/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AbrirCajaDto } from './dto/abrir-caja.dto';
import { CerrarCajaDto } from './dto/cerrar-caja.dto';
import { MovimientoCajaDto } from './dto/movimiento-caja.dto';
export declare class CajaService {
    private prisma;
    private pdfService;
    private auditoriaService;
    constructor(prisma: PrismaService, pdfService: PdfService, auditoriaService: AuditoriaService);
    abrir(sucursalId: string, usuarioId: string, dto: AbrirCajaDto, ip?: string): Promise<{
        montoInicial: number;
        totalEfectivo: number;
        totalTransferencia: number;
        totalTarjeta: number;
        montoEsperado: number;
        montoContado: number;
        diferencia: number;
    }>;
    actual(sucursalId: string): Promise<{
        montoInicial: number;
        totalEfectivo: number;
        totalTransferencia: number;
        totalTarjeta: number;
        montoEsperado: number;
        montoContado: number;
        diferencia: number;
    }>;
    cerrar(id: string, usuarioId: string, dto: CerrarCajaDto, ip?: string): Promise<{
        montoInicial: number;
        totalEfectivo: number;
        totalTransferencia: number;
        totalTarjeta: number;
        montoEsperado: number;
        montoContado: number;
        diferencia: number;
    }>;
    movimiento(id: string, usuarioId: string, dto: MovimientoCajaDto): Promise<{
        monto: number;
        id: string;
        usuarioId: string;
        fecha: Date;
        tipo: import(".prisma/client").$Enums.TipoMovimientoCaja;
        cajaId: string;
        concepto: string;
    }>;
    historial(sucursalId?: string): Promise<{
        montoInicial: number;
        totalEfectivo: number;
        totalTransferencia: number;
        totalTarjeta: number;
        montoEsperado: number;
        montoContado: number;
        diferencia: number;
    }[]>;
    reporteDiario(id: string): Promise<{
        ventas: {
            numero: string;
            total: number;
            estado: import(".prisma/client").$Enums.EstadoVenta;
            pagos: {
                formaPago: import(".prisma/client").$Enums.FormaPago;
                monto: number;
            }[];
        }[];
        movimientos: {
            tipo: import(".prisma/client").$Enums.TipoMovimientoCaja;
            monto: number;
            concepto: string;
            fecha: Date;
        }[];
        montoInicial: number;
        totalEfectivo: number;
        totalTransferencia: number;
        totalTarjeta: number;
        montoEsperado: number;
        montoContado: number;
        diferencia: number;
    }>;
    reportePdf(id: string): Promise<Buffer<ArrayBufferLike>>;
    private serializar;
    private buildReporteHtml;
}
