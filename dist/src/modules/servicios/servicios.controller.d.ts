import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
export declare class ServiciosController {
    private serviciosService;
    constructor(serviciosService: ServiciosService);
    findAll(): Promise<{
        precio: number;
        id: string;
        nombre: string;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        ivaAplicable: boolean;
    }[]>;
    findOne(id: string): Promise<{
        precio: number;
        id: string;
        nombre: string;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        ivaAplicable: boolean;
    }>;
    create(dto: CreateServicioDto): Promise<{
        precio: number;
        id: string;
        nombre: string;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        ivaAplicable: boolean;
    }>;
    update(id: string, dto: UpdateServicioDto): Promise<{
        precio: number;
        id: string;
        nombre: string;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        ivaAplicable: boolean;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
