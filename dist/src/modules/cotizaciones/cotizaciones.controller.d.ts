import { Response } from 'express';
import { CotizacionesService } from './cotizaciones.service';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { ConvertirCotizacionDto } from './dto/convertir-cotizacion.dto';
import { AuthenticatedUser } from '../auth/auth.types';
export declare class CotizacionesController {
    private cotizacionesService;
    constructor(cotizacionesService: CotizacionesService);
    findAll(user: AuthenticatedUser, sucursalId?: string): Promise<{
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
    reportePdf(id: string, res: Response): Promise<void>;
    create(dto: CreateCotizacionDto, user: AuthenticatedUser): Promise<{
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
    convertir(id: string, dto: ConvertirCotizacionDto, user: AuthenticatedUser): Promise<{
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
