import { PrismaService } from '../../config/prisma.service';
import { AjusteInventarioDto } from './dto/ajuste-inventario.dto';
import { FindMovimientosQueryDto } from './dto/find-movimientos.query.dto';
export declare class InventarioService {
    private prisma;
    constructor(prisma: PrismaService);
    ajustar(dto: AjusteInventarioDto, usuarioId: string): Promise<{
        inventario: {
            id: string;
            sucursalId: string;
            stockMinimo: number | null;
            productoId: string;
            cantidad: number;
            fechaIngreso: Date | null;
        };
        movimiento: {
            id: string;
            sucursalId: string;
            usuarioId: string;
            fecha: Date;
            productoId: string;
            cantidad: number;
            tipo: import(".prisma/client").$Enums.TipoMovimientoInventario;
            stockResultante: number;
            referenciaTipo: string | null;
            referenciaId: string | null;
        };
    }>;
    movimientos(filters: FindMovimientosQueryDto): Promise<{
        items: ({
            sucursal: {
                nombre: string;
            };
            usuario: {
                nombres: string;
                apellidos: string;
            };
            producto: {
                nombre: string;
                codigo: string;
            };
        } & {
            id: string;
            sucursalId: string;
            usuarioId: string;
            fecha: Date;
            productoId: string;
            cantidad: number;
            tipo: import(".prisma/client").$Enums.TipoMovimientoInventario;
            stockResultante: number;
            referenciaTipo: string | null;
            referenciaId: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
}
