import { InventarioService } from './inventario.service';
import { AjusteInventarioDto } from './dto/ajuste-inventario.dto';
import { FindMovimientosQueryDto } from './dto/find-movimientos.query.dto';
import { AuthenticatedUser } from '../auth/auth.types';
export declare class InventarioController {
    private inventarioService;
    constructor(inventarioService: InventarioService);
    ajustar(dto: AjusteInventarioDto, user: AuthenticatedUser): Promise<{
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
    movimientos(query: FindMovimientosQueryDto): Promise<{
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
