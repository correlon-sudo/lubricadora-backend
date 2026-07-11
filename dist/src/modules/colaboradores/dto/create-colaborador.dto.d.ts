import { TipoSueldo } from '@prisma/client';
export declare class CreateColaboradorDto {
    usuarioId?: string;
    nombres: string;
    apellidos: string;
    cedula: string;
    telefono?: string;
    direccion?: string;
    email?: string;
    cargo?: string;
    tipoSueldo: TipoSueldo;
    montoSueldo: number;
    fechaIngreso: string;
}
