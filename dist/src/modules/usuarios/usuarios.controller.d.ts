import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
export declare class UsuariosController {
    private usuariosService;
    constructor(usuariosService: UsuariosService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
        cedula: string;
        email: string;
        username: string;
        sucursalId: string;
        nombres: string;
        apellidos: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
        cedula: string;
        email: string;
        username: string;
        sucursalId: string;
        nombres: string;
        apellidos: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
    }>;
    create(dto: CreateUsuarioDto): Promise<{
        id: string;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
        cedula: string;
        email: string;
        username: string;
        sucursalId: string;
        nombres: string;
        apellidos: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
    }>;
    update(id: string, dto: UpdateUsuarioDto): Promise<{
        id: string;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
        cedula: string;
        email: string;
        username: string;
        sucursalId: string;
        nombres: string;
        apellidos: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
    }>;
    updatePassword(id: string, dto: UpdatePasswordDto): Promise<{
        success: boolean;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
