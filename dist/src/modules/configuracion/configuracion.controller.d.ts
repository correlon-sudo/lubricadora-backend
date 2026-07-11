import { ConfiguracionService } from './configuracion.service';
import { UpdateConfiguracionDto } from './dto/update-configuracion.dto';
export declare class ConfiguracionController {
    private configuracionService;
    constructor(configuracionService: ConfiguracionService);
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
}
