import { Request, Response } from 'express';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { AuthenticatedUser } from '../auth/auth.types';
export declare class VentasController {
    private ventasService;
    constructor(ventasService: VentasService);
    findAll(user: AuthenticatedUser, sucursalId?: string): Promise<{
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
    reportePdf(id: string, res: Response): Promise<void>;
    create(dto: CreateVentaDto, user: AuthenticatedUser, req: Request): Promise<{
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
    anular(id: string, user: AuthenticatedUser, req: Request): Promise<{
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
}
