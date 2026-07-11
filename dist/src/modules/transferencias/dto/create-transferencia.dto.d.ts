export declare class TransferenciaItemDto {
    productoId: string;
    cantidad: number;
}
export declare class CreateTransferenciaDto {
    sucursalDestinoId: string;
    observacion?: string;
    items: TransferenciaItemDto[];
}
