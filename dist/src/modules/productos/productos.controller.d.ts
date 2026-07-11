import { Response } from 'express';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { FindProductosQueryDto } from './dto/find-productos.query.dto';
import { AuthenticatedUser } from '../auth/auth.types';
export declare class ProductosController {
    private productosService;
    constructor(productosService: ProductosService);
    stockBajo(): Promise<{
        productoId: string;
        productoCodigo: string;
        productoNombre: string;
        sucursalId: string;
        sucursalNombre: string;
        cantidad: number;
        minimo: number;
    }[]>;
    reportePdf(query: FindProductosQueryDto, res: Response): Promise<void>;
    findAll(query: FindProductosQueryDto, user: AuthenticatedUser): Promise<{
        precioVenta: number;
        stockTotal: number;
        id: string;
        stockMinimo: number;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        marcaId: string;
        categoriaId: string;
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
    findOne(id: string, user: AuthenticatedUser): Promise<{
        precioVenta: number;
        stockTotal: number;
        id: string;
        stockMinimo: number;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        marcaId: string;
        categoriaId: string;
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
    create(dto: CreateProductoDto): Promise<{
        precioVenta: number;
        stockTotal: number;
        id: string;
        stockMinimo: number;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        marcaId: string;
        categoriaId: string;
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
        stockMinimo: number;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        marcaId: string;
        categoriaId: string;
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
}
