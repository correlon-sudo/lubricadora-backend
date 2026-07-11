import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { FindClientesQueryDto } from './dto/find-clientes.query.dto';
export declare class ClientesController {
    private clientesService;
    constructor(clientesService: ClientesService);
    findAll(query: FindClientesQueryDto): Promise<{
        id: string;
        direccion: string | null;
        telefono: string | null;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        nombres: string;
        apellidos: string | null;
        razonSocial: string | null;
        identificacion: string;
        tipoIdentificacion: import(".prisma/client").$Enums.TipoIdentificacion;
        esConsumidorFinal: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        direccion: string | null;
        telefono: string | null;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        nombres: string;
        apellidos: string | null;
        razonSocial: string | null;
        identificacion: string;
        tipoIdentificacion: import(".prisma/client").$Enums.TipoIdentificacion;
        esConsumidorFinal: boolean;
    }>;
    vehiculos(id: string): Promise<{
        id: string;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
        marca: string;
        clienteId: string;
        placa: string;
        modelo: string;
        anio: number | null;
        color: string | null;
        kilometraje: number | null;
    }[]>;
    create(dto: CreateClienteDto): Promise<{
        id: string;
        direccion: string | null;
        telefono: string | null;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        nombres: string;
        apellidos: string | null;
        razonSocial: string | null;
        identificacion: string;
        tipoIdentificacion: import(".prisma/client").$Enums.TipoIdentificacion;
        esConsumidorFinal: boolean;
    }>;
    update(id: string, dto: UpdateClienteDto): Promise<{
        id: string;
        direccion: string | null;
        telefono: string | null;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        nombres: string;
        apellidos: string | null;
        razonSocial: string | null;
        identificacion: string;
        tipoIdentificacion: import(".prisma/client").$Enums.TipoIdentificacion;
        esConsumidorFinal: boolean;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
