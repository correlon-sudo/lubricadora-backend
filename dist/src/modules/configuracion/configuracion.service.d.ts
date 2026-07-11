import { PrismaService } from '../../config/prisma.service';
import { UpdateConfiguracionDto } from './dto/update-configuracion.dto';
export declare class ConfiguracionService {
    private prisma;
    constructor(prisma: PrismaService);
    get(): Promise<{
        porcentajeIva: number;
        id: string;
        direccion: string | null;
        telefono: string | null;
        updatedAt: Date;
        ruc: string | null;
        razonSocial: string | null;
        nombreComercial: string | null;
        logoUrl: string | null;
        moneda: string;
    }>;
    update(dto: UpdateConfiguracionDto): Promise<{
        porcentajeIva: number;
        id: string;
        direccion: string | null;
        telefono: string | null;
        updatedAt: Date;
        ruc: string | null;
        razonSocial: string | null;
        nombreComercial: string | null;
        logoUrl: string | null;
        moneda: string;
    }>;
    private serializar;
}
