import { AuditoriaService } from './auditoria.service';
import { FindAuditoriaQueryDto } from './dto/find-auditoria.query.dto';
export declare class AuditoriaController {
    private auditoriaService;
    constructor(auditoriaService: AuditoriaService);
    findAll(query: FindAuditoriaQueryDto): Promise<{
        items: ({
            usuario: {
                username: string;
                nombres: string;
                apellidos: string;
            };
        } & {
            id: string;
            usuarioId: string;
            entidad: string;
            accion: string;
            entidadId: string;
            detalle: import("@prisma/client/runtime/library").JsonValue | null;
            ip: string | null;
            fecha: Date;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
}
