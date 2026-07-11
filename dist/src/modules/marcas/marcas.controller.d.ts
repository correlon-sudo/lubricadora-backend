import { MarcasService } from './marcas.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
export declare class MarcasController {
    private marcasService;
    constructor(marcasService: MarcasService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        nombre: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        nombre: string;
    }>;
    create(dto: CreateMarcaDto): import(".prisma/client").Prisma.Prisma__MarcaClient<{
        id: string;
        nombre: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, dto: UpdateMarcaDto): Promise<{
        id: string;
        nombre: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
