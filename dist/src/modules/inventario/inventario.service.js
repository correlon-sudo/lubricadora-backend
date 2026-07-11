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
exports.InventarioService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
let InventarioService = class InventarioService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ajustar(dto, usuarioId) {
        return this.prisma.$transaction(async (tx) => {
            const inventario = await tx.inventarioSucursal.upsert({
                where: {
                    productoId_sucursalId: {
                        productoId: dto.productoId,
                        sucursalId: dto.sucursalId,
                    },
                },
                update: { cantidad: { increment: dto.cantidad } },
                create: {
                    productoId: dto.productoId,
                    sucursalId: dto.sucursalId,
                    cantidad: dto.cantidad,
                    fechaIngreso: new Date(),
                },
            });
            if (inventario.cantidad < 0) {
                throw new common_1.BadRequestException('El ajuste dejaría el stock en negativo');
            }
            const movimiento = await tx.movimientoInventario.create({
                data: {
                    productoId: dto.productoId,
                    sucursalId: dto.sucursalId,
                    tipo: 'AJUSTE',
                    cantidad: dto.cantidad,
                    stockResultante: inventario.cantidad,
                    referenciaTipo: 'ajuste',
                    usuarioId,
                },
            });
            return { inventario, movimiento };
        });
    }
    async movimientos(filters) {
        const where = {
            productoId: filters.productoId,
            sucursalId: filters.sucursalId,
            tipo: filters.tipo,
            ...((filters.desde || filters.hasta) && {
                fecha: {
                    gte: filters.desde ? new Date(filters.desde) : undefined,
                    lte: filters.hasta ? new Date(filters.hasta) : undefined,
                },
            }),
        };
        const [items, total] = await Promise.all([
            this.prisma.movimientoInventario.findMany({
                where,
                include: {
                    producto: { select: { codigo: true, nombre: true } },
                    sucursal: { select: { nombre: true } },
                    usuario: { select: { nombres: true, apellidos: true } },
                },
                orderBy: { fecha: 'desc' },
                skip: (filters.page - 1) * filters.limit,
                take: filters.limit,
            }),
            this.prisma.movimientoInventario.count({ where }),
        ]);
        return { items, total, page: filters.page, limit: filters.limit };
    }
};
exports.InventarioService = InventarioService;
exports.InventarioService = InventarioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventarioService);
//# sourceMappingURL=inventario.service.js.map