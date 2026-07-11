import { TipoMovimientoInventario } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class FindMovimientosQueryDto extends PaginationDto {
    productoId?: string;
    sucursalId?: string;
    tipo?: TipoMovimientoInventario;
    desde?: string;
    hasta?: string;
}
