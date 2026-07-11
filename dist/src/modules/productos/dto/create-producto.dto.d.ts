export declare class CreateProductoDto {
    codigo: string;
    nombre: string;
    descripcion?: string;
    marcaId: string;
    categoriaId: string;
    precioCosto: number;
    precioVenta: number;
    stockMinimo?: number;
    ivaAplicable?: boolean;
}
