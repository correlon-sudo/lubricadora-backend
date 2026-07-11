"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VentaCalculoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
function round2(value) {
    return Math.round(value * 100) / 100;
}
let VentaCalculoService = class VentaCalculoService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calcular(items) {
        if (!items || items.length === 0) {
            throw new common_1.BadRequestException('La venta debe tener al menos un ítem');
        }
        const configuracion = await this.prisma.configuracion.findFirst();
        const porcentajeIva = configuracion ? Number(configuracion.porcentajeIva) : 15;
        const itemsCalculados = [];
        for (const item of items) {
            let precioUnitario;
            let ivaAplicable;
            let descripcion;
            if (item.tipoItem === 'PRODUCTO') {
                if (!item.productoId) {
                    throw new common_1.BadRequestException('productoId es requerido para items de tipo PRODUCTO');
                }
                const producto = await this.prisma.producto.findUnique({
                    where: { id: item.productoId },
                });
                if (!producto || !producto.activo) {
                    throw new common_1.NotFoundException(`Producto ${item.productoId} no encontrado`);
                }
                precioUnitario = Number(producto.precioVenta);
                ivaAplicable = producto.ivaAplicable;
                descripcion = producto.nombre;
            }
            else {
                if (!item.servicioId) {
                    throw new common_1.BadRequestException('servicioId es requerido para items de tipo SERVICIO');
                }
                const servicio = await this.prisma.servicio.findUnique({
                    where: { id: item.servicioId },
                });
                if (!servicio || !servicio.activo) {
                    throw new common_1.NotFoundException(`Servicio ${item.servicioId} no encontrado`);
                }
                precioUnitario = Number(servicio.precio);
                ivaAplicable = servicio.ivaAplicable;
                descripcion = servicio.nombre;
            }
            const descuento = item.descuento ?? 0;
            const subtotalLinea = round2(precioUnitario * item.cantidad - descuento);
            if (subtotalLinea < 0) {
                throw new common_1.BadRequestException(`El descuento no puede ser mayor al subtotal de "${descripcion}"`);
            }
            const lineaIvaPorcentaje = ivaAplicable ? porcentajeIva : 0;
            const ivaLinea = round2(subtotalLinea * (lineaIvaPorcentaje / 100));
            itemsCalculados.push({
                tipoItem: item.tipoItem,
                productoId: item.productoId ?? null,
                servicioId: item.servicioId ?? null,
                descripcion,
                cantidad: item.cantidad,
                precioUnitario,
                descuento,
                ivaPorcentaje: lineaIvaPorcentaje,
                subtotalLinea,
                ivaLinea,
            });
        }
        const subtotal = round2(itemsCalculados.reduce((s, i) => s + i.subtotalLinea, 0));
        const descuentoTotal = round2(itemsCalculados.reduce((s, i) => s + i.descuento, 0));
        const iva = round2(itemsCalculados.reduce((s, i) => s + i.ivaLinea, 0));
        const total = round2(subtotal + iva);
        return { items: itemsCalculados, subtotal, descuentoTotal, iva, total };
    }
};
exports.VentaCalculoService = VentaCalculoService;
exports.VentaCalculoService = VentaCalculoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VentaCalculoService);
//# sourceMappingURL=venta-calculo.service.js.map