import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { FindAuditoriaQueryDto } from './dto/find-auditoria.query.dto';
interface RegistrarParams {
    usuarioId: string;
    accion: string;
    entidad: string;
    entidadId: string;
    detalle?: Record<string, unknown>;
    ip?: string;
}
export declare class AuditoriaService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    registrar(params: RegistrarParams): Promise<void>;
    findAll(filters: FindAuditoriaQueryDto): Promise<{
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
            detalle: Prisma.JsonValue | null;
            ip: string | null;
            fecha: Date;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
}
export {};
