import { PrismaService } from '../../config/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
export declare class UsuariosService {
    private prisma;
    constructor(prisma: PrismaService);
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
    updatePassword(id: string, password: string): Promise<{
        success: boolean;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
