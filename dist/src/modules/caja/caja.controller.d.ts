import { Request, Response } from 'express';
import { CajaService } from './caja.service';
import { AbrirCajaDto } from './dto/abrir-caja.dto';
import { CerrarCajaDto } from './dto/cerrar-caja.dto';
import { MovimientoCajaDto } from './dto/movimiento-caja.dto';
import { AuthenticatedUser } from '../auth/auth.types';
export declare class CajaController {
    private cajaService;
    constructor(cajaService: CajaService);
    abrir(dto: AbrirCajaDto, user: AuthenticatedUser, req: Request): Promise<{
        montoInicial: number;
        totalEfectivo: number;
        totalTransferencia: number;
        totalTarjeta: number;
        montoEsperado: number;
        montoContado: number;
        diferencia: number;
    }>;
    actual(user: AuthenticatedUser): Promise<{
        montoInicial: number;
        totalEfectivo: number;
        totalTransferencia: number;
        totalTarjeta: number;
        montoEsperado: number;
        montoContado: number;
        diferencia: number;
    }>;
    historial(user: AuthenticatedUser, sucursalId?: string): Promise<{
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
    reportePdf(id: string, res: Response): Promise<void>;
    cerrar(id: string, dto: CerrarCajaDto, user: AuthenticatedUser, req: Request): Promise<{
        montoInicial: number;
        totalEfectivo: number;
        totalTransferencia: number;
        totalTarjeta: number;
        montoEsperado: number;
        montoContado: number;
        diferencia: number;
    }>;
    movimiento(id: string, dto: MovimientoCajaDto, user: AuthenticatedUser): Promise<{
        monto: number;
        id: string;
        usuarioId: string;
        fecha: Date;
        tipo: import(".prisma/client").$Enums.TipoMovimientoCaja;
        cajaId: string;
        concepto: string;
    }>;
}
