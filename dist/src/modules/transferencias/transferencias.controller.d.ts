import { Request, Response } from 'express';
import { TransferenciasService } from './transferencias.service';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';
import { RecibirTransferenciaDto } from './dto/recibir-transferencia.dto';
import { AuthenticatedUser } from '../auth/auth.types';
export declare class TransferenciasController {
    private transferenciasService;
    constructor(transferenciasService: TransferenciasService);
    findAll(user: AuthenticatedUser, sucursalId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        detalles: ({
            producto: {
                nombre: string;
                codigo: string;
            };
        } & {
            id: string;
            productoId: string;
            cantidad: number;
            cantidadRecibida: number | null;
            transferenciaId: string;
        })[];
        sucursalOrigen: {
            id: string;
            nombre: string;
            direccion: string | null;
            telefono: string | null;
            esMatriz: boolean;
            activo: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        sucursalDestino: {
            id: string;
            nombre: string;
            direccion: string | null;
            telefono: string | null;
            esMatriz: boolean;
            activo: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        usuarioEnvia: {
            nombres: string;
            apellidos: string;
        };
        usuarioRecibe: {
            nombres: string;
            apellidos: string;
        };
    } & {
        id: string;
        createdAt: Date;
        observacion: string | null;
        numero: string;
        estado: import(".prisma/client").$Enums.EstadoTransferencia;
        sucursalDestinoId: string;
        sucursalOrigenId: string;
        usuarioEnviaId: string;
        usuarioRecibeId: string | null;
        fechaEnvio: Date | null;
        fechaRecepcion: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        detalles: ({
            producto: {
                nombre: string;
                codigo: string;
            };
        } & {
            id: string;
            productoId: string;
            cantidad: number;
            cantidadRecibida: number | null;
            transferenciaId: string;
        })[];
        sucursalOrigen: {
            id: string;
            nombre: string;
            direccion: string | null;
            telefono: string | null;
            esMatriz: boolean;
            activo: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        sucursalDestino: {
            id: string;
            nombre: string;
            direccion: string | null;
            telefono: string | null;
            esMatriz: boolean;
            activo: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        usuarioEnvia: {
            nombres: string;
            apellidos: string;
        };
        usuarioRecibe: {
            nombres: string;
            apellidos: string;
        };
    } & {
        id: string;
        createdAt: Date;
        observacion: string | null;
        numero: string;
        estado: import(".prisma/client").$Enums.EstadoTransferencia;
        sucursalDestinoId: string;
        sucursalOrigenId: string;
        usuarioEnviaId: string;
        usuarioRecibeId: string | null;
        fechaEnvio: Date | null;
        fechaRecepcion: Date | null;
    }>;
    reportePdf(id: string, res: Response): Promise<void>;
    create(dto: CreateTransferenciaDto, user: AuthenticatedUser, req: Request): Promise<{
        detalles: ({
            producto: {
                nombre: string;
                codigo: string;
            };
        } & {
            id: string;
            productoId: string;
            cantidad: number;
            cantidadRecibida: number | null;
            transferenciaId: string;
        })[];
        sucursalOrigen: {
            id: string;
            nombre: string;
            direccion: string | null;
            telefono: string | null;
            esMatriz: boolean;
            activo: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        sucursalDestino: {
            id: string;
            nombre: string;
            direccion: string | null;
            telefono: string | null;
            esMatriz: boolean;
            activo: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        usuarioEnvia: {
            nombres: string;
            apellidos: string;
        };
        usuarioRecibe: {
            nombres: string;
            apellidos: string;
        };
    } & {
        id: string;
        createdAt: Date;
        observacion: string | null;
        numero: string;
        estado: import(".prisma/client").$Enums.EstadoTransferencia;
        sucursalDestinoId: string;
        sucursalOrigenId: string;
        usuarioEnviaId: string;
        usuarioRecibeId: string | null;
        fechaEnvio: Date | null;
        fechaRecepcion: Date | null;
    }>;
    enviar(id: string, user: AuthenticatedUser, req: Request): Promise<{
        detalles: ({
            producto: {
                nombre: string;
                codigo: string;
            };
        } & {
            id: string;
            productoId: string;
            cantidad: number;
            cantidadRecibida: number | null;
            transferenciaId: string;
        })[];
        sucursalOrigen: {
            id: string;
            nombre: string;
            direccion: string | null;
            telefono: string | null;
            esMatriz: boolean;
            activo: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        sucursalDestino: {
            id: string;
            nombre: string;
            direccion: string | null;
            telefono: string | null;
            esMatriz: boolean;
            activo: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        usuarioEnvia: {
            nombres: string;
            apellidos: string;
        };
        usuarioRecibe: {
            nombres: string;
            apellidos: string;
        };
    } & {
        id: string;
        createdAt: Date;
        observacion: string | null;
        numero: string;
        estado: import(".prisma/client").$Enums.EstadoTransferencia;
        sucursalDestinoId: string;
        sucursalOrigenId: string;
        usuarioEnviaId: string;
        usuarioRecibeId: string | null;
        fechaEnvio: Date | null;
        fechaRecepcion: Date | null;
    }>;
    recibir(id: string, dto: RecibirTransferenciaDto, user: AuthenticatedUser, req: Request): Promise<{
        detalles: ({
            producto: {
                nombre: string;
                codigo: string;
            };
        } & {
            id: string;
            productoId: string;
            cantidad: number;
            cantidadRecibida: number | null;
            transferenciaId: string;
        })[];
        sucursalOrigen: {
            id: string;
            nombre: string;
            direccion: string | null;
            telefono: string | null;
            esMatriz: boolean;
            activo: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        sucursalDestino: {
            id: string;
            nombre: string;
            direccion: string | null;
            telefono: string | null;
            esMatriz: boolean;
            activo: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        usuarioEnvia: {
            nombres: string;
            apellidos: string;
        };
        usuarioRecibe: {
            nombres: string;
            apellidos: string;
        };
    } & {
        id: string;
        createdAt: Date;
        observacion: string | null;
        numero: string;
        estado: import(".prisma/client").$Enums.EstadoTransferencia;
        sucursalDestinoId: string;
        sucursalOrigenId: string;
        usuarioEnviaId: string;
        usuarioRecibeId: string | null;
        fechaEnvio: Date | null;
        fechaRecepcion: Date | null;
    }>;
    anular(id: string, user: AuthenticatedUser, req: Request): Promise<{
        detalles: ({
            producto: {
                nombre: string;
                codigo: string;
            };
        } & {
            id: string;
            productoId: string;
            cantidad: number;
            cantidadRecibida: number | null;
            transferenciaId: string;
        })[];
        sucursalOrigen: {
            id: string;
            nombre: string;
            direccion: string | null;
            telefono: string | null;
            esMatriz: boolean;
            activo: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        sucursalDestino: {
            id: string;
            nombre: string;
            direccion: string | null;
            telefono: string | null;
            esMatriz: boolean;
            activo: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        usuarioEnvia: {
            nombres: string;
            apellidos: string;
        };
        usuarioRecibe: {
            nombres: string;
            apellidos: string;
        };
    } & {
        id: string;
        createdAt: Date;
        observacion: string | null;
        numero: string;
        estado: import(".prisma/client").$Enums.EstadoTransferencia;
        sucursalDestinoId: string;
        sucursalOrigenId: string;
        usuarioEnviaId: string;
        usuarioRecibeId: string | null;
        fechaEnvio: Date | null;
        fechaRecepcion: Date | null;
    }>;
}
