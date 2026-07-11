import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';
import { RecibirTransferenciaDto } from './dto/recibir-transferencia.dto';
export declare class TransferenciasService {
    private prisma;
    private pdfService;
    private auditoriaService;
    constructor(prisma: PrismaService, pdfService: PdfService, auditoriaService: AuditoriaService);
    findAll(sucursalId?: string): Prisma.PrismaPromise<({
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
    create(dto: CreateTransferenciaDto, sucursalOrigenId: string, usuarioId: string, ip?: string): Promise<{
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
    enviar(id: string, usuarioId: string, ip?: string): Promise<{
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
    recibir(id: string, usuarioId: string, dto: RecibirTransferenciaDto, ip?: string): Promise<{
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
    anular(id: string, usuarioId: string, ip?: string): Promise<{
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
    reportePdf(id: string): Promise<Buffer<ArrayBufferLike>>;
    private generarNumero;
    private buildTransferenciaHtml;
}
