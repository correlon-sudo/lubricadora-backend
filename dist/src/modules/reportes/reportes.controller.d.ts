import { ReportesService } from './reportes.service';
import { ReporteVentasQueryDto } from './dto/reporte-ventas.query.dto';
import { ProductosMasVendidosQueryDto } from './dto/productos-mas-vendidos.query.dto';
import { ConsolidadoQueryDto } from './dto/consolidado.query.dto';
import { AuthenticatedUser } from '../auth/auth.types';
export declare class ReportesController {
    private reportesService;
    constructor(reportesService: ReportesService);
    ventas(query: ReporteVentasQueryDto, user: AuthenticatedUser): Promise<{
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
    productosMasVendidos(query: ProductosMasVendidosQueryDto, user: AuthenticatedUser): Promise<{
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
