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
exports.ReportesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
function finDelDia(fecha) {
    const d = new Date(fecha);
    d.setHours(23, 59, 59, 999);
    return d;
}
let ReportesService = class ReportesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async dashboardResumen(sucursalId) {
        const hoyInicio = new Date();
        hoyInicio.setHours(0, 0, 0, 0);
        const hoyFin = new Date();
        hoyFin.setHours(23, 59, 59, 999);
        const [ventasHoy, cajaAbierta, stockBajo, transferenciasPendientes] = await Promise.all([
            this.prisma.venta.aggregate({
                where: { sucursalId, estado: 'EMITIDA', fecha: { gte: hoyInicio, lte: hoyFin } },
                _sum: { total: true },
                _count: { id: true },
            }),
            this.prisma.caja.findFirst({ where: { sucursalId, estado: 'ABIERTA' } }),
            this.prisma.inventarioSucursal.findMany({
                where: { sucursalId },
                include: { producto: { select: { stockMinimo: true } } },
            }),
            this.prisma.transferencia.count({
                where: {
                    OR: [{ sucursalOrigenId: sucursalId }, { sucursalDestinoId: sucursalId }],
                    estado: { in: ['PENDIENTE', 'EN_TRANSITO'] },
                },
            }),
        ]);
        const stockBajoCount = stockBajo.filter((i) => i.cantidad < (i.stockMinimo ?? i.producto.stockMinimo)).length;
        return {
            ventasHoy: {
                cantidad: ventasHoy._count.id,
                total: Number(ventasHoy._sum.total ?? 0),
            },
            cajaAbierta: !!cajaAbierta,
            montoInicialCaja: cajaAbierta ? Number(cajaAbierta.montoInicial) : null,
            stockBajoCount,
            transferenciasPendientes,
        };
    }
    async reporteVentas(query) {
        const where = {
            estado: 'EMITIDA',
            fecha: { gte: new Date(query.desde), lte: finDelDia(query.hasta) },
            ...(query.sucursalId && { sucursalId: query.sucursalId }),
            ...(query.usuarioId && { usuarioId: query.usuarioId }),
        };
        const [ventas, totales] = await Promise.all([
            this.prisma.venta.findMany({
                where,
                include: {
                    cliente: { select: { nombres: true, apellidos: true } },
                    usuario: { select: { nombres: true, apellidos: true } },
                    sucursal: { select: { nombre: true } },
                },
                orderBy: { fecha: 'desc' },
            }),
            this.prisma.venta.aggregate({
                where,
                _sum: { subtotal: true, iva: true, total: true },
                _count: { id: true },
            }),
        ]);
        return {
            ventas: ventas.map((v) => ({
                id: v.id,
                numero: v.numero,
                fecha: v.fecha,
                cliente: v.cliente ? `${v.cliente.nombres} ${v.cliente.apellidos ?? ''}`.trim() : null,
                vendedor: `${v.usuario.nombres} ${v.usuario.apellidos}`,
                sucursal: v.sucursal.nombre,
                subtotal: Number(v.subtotal),
                iva: Number(v.iva),
                total: Number(v.total),
            })),
            totales: {
                cantidad: totales._count.id,
                subtotal: Number(totales._sum.subtotal ?? 0),
                iva: Number(totales._sum.iva ?? 0),
                total: Number(totales._sum.total ?? 0),
            },
        };
    }
    async productosMasVendidos(query) {
        const agrupado = await this.prisma.ventaDetalle.groupBy({
            by: ['productoId'],
            where: {
                tipoItem: 'PRODUCTO',
                productoId: { not: null },
                venta: {
                    estado: 'EMITIDA',
                    fecha: { gte: new Date(query.desde), lte: finDelDia(query.hasta) },
                    ...(query.sucursalId && { sucursalId: query.sucursalId }),
                },
            },
            _sum: { cantidad: true, subtotal: true },
            orderBy: { _sum: { cantidad: 'desc' } },
            take: query.limit ?? 10,
        });
        const productoIds = agrupado.map((a) => a.productoId).filter((id) => !!id);
        const productos = await this.prisma.producto.findMany({
            where: { id: { in: productoIds } },
            select: { id: true, codigo: true, nombre: true },
        });
        const productoPorId = new Map(productos.map((p) => [p.id, p]));
        return agrupado.map((a) => ({
            producto: productoPorId.get(a.productoId) ?? null,
            cantidadVendida: a._sum.cantidad ?? 0,
            totalVendido: Number(a._sum.subtotal ?? 0),
        }));
    }
    async consolidado(query) {
        const where = {
            estado: 'EMITIDA',
            fecha: { gte: new Date(query.desde), lte: finDelDia(query.hasta) },
        };
        const agrupado = await this.prisma.venta.groupBy({
            by: ['sucursalId'],
            where,
            _sum: { subtotal: true, iva: true, total: true },
            _count: { id: true },
        });
        const sucursales = await this.prisma.sucursal.findMany({
            select: { id: true, nombre: true },
        });
        const sucursalPorId = new Map(sucursales.map((s) => [s.id, s.nombre]));
        const porSucursal = agrupado.map((a) => ({
            sucursalId: a.sucursalId,
            sucursalNombre: sucursalPorId.get(a.sucursalId) ?? '—',
            cantidadVentas: a._count.id,
            subtotal: Number(a._sum.subtotal ?? 0),
            iva: Number(a._sum.iva ?? 0),
            total: Number(a._sum.total ?? 0),
        }));
        const totalGeneral = porSucursal.reduce((acc, s) => ({
            cantidadVentas: acc.cantidadVentas + s.cantidadVentas,
            subtotal: acc.subtotal + s.subtotal,
            iva: acc.iva + s.iva,
            total: acc.total + s.total,
        }), { cantidadVentas: 0, subtotal: 0, iva: 0, total: 0 });
        return { porSucursal, totalGeneral };
    }
};
exports.ReportesService = ReportesService;
exports.ReportesService = ReportesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportesService);
//# sourceMappingURL=reportes.service.js.map