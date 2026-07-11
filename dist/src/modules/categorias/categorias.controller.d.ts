import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
export declare class CategoriasController {
    private categoriasService;
    constructor(categoriasService: CategoriasService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        nombre: string;
        descripcion: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        nombre: string;
        descripcion: string | null;
    }>;
    create(dto: CreateCategoriaDto): import(".prisma/client").Prisma.Prisma__CategoriaClient<{
        id: string;
        nombre: string;
        descripcion: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, dto: UpdateCategoriaDto): Promise<{
        id: string;
        nombre: string;
        descripcion: string | null;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
