import { RolUsuario } from '@prisma/client';
export declare class CreateUsuarioDto {
    sucursalId: string;
    nombres: string;
    apellidos: string;
    cedula: string;
    email: string;
    username: string;
    password: string;
    rol: RolUsuario;
}
