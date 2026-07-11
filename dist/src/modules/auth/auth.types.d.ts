import { RolUsuario } from '@prisma/client';
export interface AuthenticatedUser {
    id: string;
    username: string;
    sucursalId: string;
    rol: RolUsuario;
}
