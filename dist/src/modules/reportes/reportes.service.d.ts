import { PrismaService } from '../../config/prisma.service';
import { ReporteVentasQueryDto } from './dto/reporte-ventas.query.dto';
import { ProductosMasVendidosQueryDto } from './dto/productos-mas-vendidos.query.dto';
import { ConsolidadoQueryDto } from './dto/consolidado.query.dto';
export declare class ReportesService {
    private prisma;
    constructor(prisma: PrismaService);
    dashboardResumen(sucursalId: string): Promise<{
        ventasHoy: {
            cantidad: number;
            total: number;
        };
        cajaAbierta: boolean;
        montoInicialCaja: number;
        stockBajoCount: number;
        transferenciasPendientes: number;
    }>;
    reporteVentas(query: ReporteVentasQueryDto): Promise<{
        ventas: {
            id: string;
            numero: string;
            fecha: Date;
            cliente: string;
            vendedor: string;
            sucursal: string;
            subtotal: number;
            iva: number;
            total: number;
        }[];
        totales: {
            cantidad: number;
            subtotal: number;
            iva: number;
            total: number;
        };
    }>;
    productosMasVendidos(query: ProductosMasVendidosQueryDto): Promise<{
        producto: {
            id: string;
            nombre: string;
            codigo: string;
        };
        cantidadVendida: number;
        totalVendido: number;
    }[]>;
    consolidado(query: ConsolidadoQueryDto): Promise<{
        porSucursal: {
            sucursalId: string;
            sucursalNombre: string;
            cantidadVentas: number;
            subtotal: number;
            iva: number;
            total: number;
        }[];
        totalGeneral: {
            cantidadVentas: number;
            subtotal: number;
            iva: number;
            total: number;
        };
    }>;
}
