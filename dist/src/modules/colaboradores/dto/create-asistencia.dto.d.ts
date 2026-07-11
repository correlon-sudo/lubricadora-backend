import { EstadoAsistencia } from '@prisma/client';
export declare class CreateAsistenciaDto {
    fecha: string;
    estado: EstadoAsistencia;
    observacion?: string;
}
