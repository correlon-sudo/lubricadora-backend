import { PrismaService } from '../../config/prisma.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { FindVehiculosQueryDto } from './dto/find-vehiculos.query.dto';
export declare class VehiculosService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(filters: FindVehiculosQueryDto): Promise<({
        cliente: {
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
        };
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        cliente: {
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
        };
    } & {
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
    }>;
    findByPlaca(placa: string): Promise<{
        historialServicios: any[];
        cliente: {
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
        };
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
    }>;
    create(dto: CreateVehiculoDto): Promise<{
        cliente: {
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
        };
    } & {
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
    }>;
    update(id: string, dto: UpdateVehiculoDto): Promise<{
        cliente: {
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
        };
    } & {
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
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
