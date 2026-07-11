import { RolUsuario } from '@prisma/client';
export declare const ROL_PRIORIDAD: Record<RolUsuario, number>;
export declare const ROL_PERMISOS: Record<RolUsuario, string[]>;
export declare function parseTtlToSeconds(ttl: string): number;
