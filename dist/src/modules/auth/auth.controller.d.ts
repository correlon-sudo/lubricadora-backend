import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthenticatedUser } from './auth.types';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
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
    refresh(dto: RefreshDto): Promise<{
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
    logout(dto: RefreshDto): Promise<{
        success: boolean;
    }>;
    me(user: AuthenticatedUser): Promise<{
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
}
