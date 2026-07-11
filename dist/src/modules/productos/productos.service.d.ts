import { RolUsuario } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { FindProductosQueryDto } from './dto/find-productos.query.dto';
export declare class ProductosService {
    private prisma;
    private pdfService;
    constructor(prisma: PrismaService, pdfService: PdfService);
    findAll(filters: FindProductosQueryDto, rol?: RolUsuario): Promise<{
        precioVenta: number;
        stockTotal: number;
        id: string;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        marcaId: string;
        categoriaId: string;
        stockMinimo: number;
        ivaAplicable: boolean;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
        marca: {
            id: string;
            nombre: string;
        };
        categoria: {
            id: string;
            nombre: string;
        };
        inventarios: {
            sucursalId: string;
            cantidad: number;
        }[];
    }[]>;
    findOne(id: string, rol?: RolUsuario): Promise<{
        precioVenta: number;
        stockTotal: number;
        id: string;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        marcaId: string;
        categoriaId: string;
        stockMinimo: number;
        ivaAplicable: boolean;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
        marca: {
            id: string;
            nombre: string;
        };
        categoria: {
            id: string;
            nombre: string;
        };
        inventarios: {
            sucursalId: string;
            cantidad: number;
        }[];
    }>;
    stockBajo(): Promise<{
        productoId: string;
        productoCodigo: string;
        productoNombre: string;
        sucursalId: string;
        sucursalNombre: string;
        cantidad: number;
        minimo: number;
    }[]>;
    create(dto: CreateProductoDto): Promise<{
        precioVenta: number;
        stockTotal: number;
        id: string;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        marcaId: string;
        categoriaId: string;
        stockMinimo: number;
        ivaAplicable: boolean;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
        marca: {
            id: string;
            nombre: string;
        };
        categoria: {
            id: string;
            nombre: string;
        };
        inventarios: {
            sucursalId: string;
            cantidad: number;
        }[];
    }>;
    update(id: string, dto: UpdateProductoDto): Promise<{
        precioVenta: number;
        stockTotal: number;
        id: string;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        marcaId: string;
        categoriaId: string;
        stockMinimo: number;
        ivaAplicable: boolean;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
        marca: {
            id: string;
            nombre: string;
        };
        categoria: {
            id: string;
            nombre: string;
        };
        inventarios: {
            sucursalId: string;
            cantidad: number;
        }[];
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    reportePdf(filters: FindProductosQueryDto): Promise<Buffer<ArrayBufferLike>>;
    private buildReporteHtml;
    private serializar;
}
