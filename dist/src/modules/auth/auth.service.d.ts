import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../config/prisma.service';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    login(username: string, password: string): Promise<{
        token: {
            access_token: string;
            token_type: string;
            expires_in: number;
            refresh_token: string;
        };
        user: {
            id: string;
            username: string;
            name: string;
            email: string;
            avatar: string;
            roles: {
                name: import(".prisma/client").$Enums.RolUsuario;
                priority: number;
            }[];
            permissions: string[];
        };
    }>;
    refresh(refreshToken: string): Promise<{
        token: {
            access_token: string;
            token_type: string;
            expires_in: number;
            refresh_token: string;
        };
        user: {
            id: string;
            username: string;
            name: string;
            email: string;
            avatar: string;
            roles: {
                name: import(".prisma/client").$Enums.RolUsuario;
                priority: number;
            }[];
            permissions: string[];
        };
    }>;
    logout(refreshToken: string): Promise<{
        success: boolean;
    }>;
    me(usuarioId: string): Promise<{
        id: string;
        username: string;
        name: string;
        email: string;
        avatar: string;
        roles: {
            name: import(".prisma/client").$Enums.RolUsuario;
            priority: number;
        }[];
        permissions: string[];
    }>;
    private emitirSesion;
    private serializarUsuario;
}
