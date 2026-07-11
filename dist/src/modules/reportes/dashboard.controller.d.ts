import { ReportesService } from './reportes.service';
import { AuthenticatedUser } from '../auth/auth.types';
export declare class DashboardController {
    private reportesService;
    constructor(reportesService: ReportesService);
    resumen(user: AuthenticatedUser, sucursalId?: string): Promise<{
        ventasHoy: {
            cantidad: number;
            total: number;
        };
        cajaAbierta: boolean;
        montoInicialCaja: number;
        stockBajoCount: number;
        transferenciasPendientes: number;
    }>;
}
