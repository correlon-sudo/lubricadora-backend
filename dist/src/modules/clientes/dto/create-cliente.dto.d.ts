import { TipoIdentificacion } from '@prisma/client';
export declare class CreateClienteDto {
    tipoIdentificacion: TipoIdentificacion;
    identificacion: string;
    nombres: string;
    apellidos?: string;
    razonSocial?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
}
