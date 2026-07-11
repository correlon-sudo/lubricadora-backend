import { PrismaService } from '../../config/prisma.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
export declare class SucursalesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        nombre: string;
        direccion: string | null;
        telefono: string | null;
        esMatriz: boolean;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        nombre: string;
        direccion: string | null;
        telefono: string | null;
        esMatriz: boolean;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateSucursalDto): import(".prisma/client").Prisma.Prisma__SucursalClient<{
        id: string;
        nombre: string;
        direccion: string | null;
        telefono: string | null;
        esMatriz: boolean;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, dto: UpdateSucursalDto): Promise<{
        id: string;
        nombre: string;
        direccion: string | null;
        telefono: string | null;
        esMatriz: boolean;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
