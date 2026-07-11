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
exports.ProductosService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../config/prisma.service");
const pdf_service_1 = require("../pdf/pdf.service");
let ProductosService = class ProductosService {
    constructor(prisma, pdfService) {
        this.prisma = prisma;
        this.pdfService = pdfService;
    }
    async findAll(filters, rol) {
        const where = {
            activo: true,
            marcaId: filters.marcaId,
            categoriaId: filters.categoriaId,
            ...(filters.search && {
                OR: [
                    { nombre: { contains: filters.search, mode: 'insensitive' } },
                    { codigo: { contains: filters.search, mode: 'insensitive' } },
                ],
            }),
        };
        const productos = await this.prisma.producto.findMany({
            where,
            include: {
                marca: true,
                categoria: true,
                inventarios: filters.sucursalId
                    ? { where: { sucursalId: filters.sucursalId } }
                    : true,
            },
            orderBy: { nombre: 'asc' },
        });
        return productos.map((p) => this.serializar(p, rol));
    }
    async findOne(id, rol) {
        const producto = await this.prisma.producto.findUnique({
            where: { id },
            include: { marca: true, categoria: true, inventarios: true },
        });
        if (!producto)
            throw new common_1.NotFoundException('Producto no encontrado');
        return this.serializar(producto, rol);
    }
    async stockBajo() {
        const inventarios = await this.prisma.inventarioSucursal.findMany({
            include: { producto: true, sucursal: true },
        });
        return inventarios
            .filter((i) => i.cantidad < (i.stockMinimo ?? i.producto.stockMinimo))
            .map((i) => ({
            productoId: i.productoId,
            productoCodigo: i.producto.codigo,
            productoNombre: i.producto.nombre,
            sucursalId: i.sucursalId,
            sucursalNombre: i.sucursal.nombre,
            cantidad: i.cantidad,
            minimo: i.stockMinimo ?? i.producto.stockMinimo,
        }));
    }
    async create(dto) {
        const existente = await this.prisma.producto.findUnique({
            where: { codigo: dto.codigo },
        });
        if (existente) {
            throw new common_1.ConflictException('Ya existe un producto con ese código');
        }
        const producto = await this.prisma.producto.create({
            data: dto,
            include: { marca: true, categoria: true, inventarios: true },
        });
        return this.serializar(producto);
    }
    async update(id, dto) {
        await this.findOne(id);
        const producto = await this.prisma.producto.update({
            where: { id },
            data: dto,
            include: { marca: true, categoria: true, inventarios: true },
        });
        return this.serializar(producto);
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.producto.update({ where: { id }, data: { activo: false } });
        return { success: true };
    }
    async reportePdf(filters) {
        const productos = await this.findAll(filters);
        const html = this.buildReporteHtml(productos);
        return this.pdfService.htmlToPdf(html);
    }
    buildReporteHtml(productos) {
        const filas = productos
            .map((p) => `
          <tr>
            <td>${p.codigo}</td>
            <td>${p.nombre}</td>
            <td>${p.marca.nombre}</td>
            <td>${p.categoria.nombre}</td>
            <td style="text-align:right">${p.precioVenta.toFixed(2)}</td>
            <td style="text-align:right">${p.stockTotal}</td>
          </tr>
        `)
            .join('');
        return `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; color: #222; }
            h1 { font-size: 18px; margin-bottom: 4px; }
            .fecha { color: #666; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 6px 8px; }
            th { background: #f2f2f2; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Reporte de Inventario</h1>
          <div class="fecha">Generado: ${new Date().toLocaleString('es-EC')}</div>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Marca</th>
                <th>Categoría</th>
                <th style="text-align:right">Precio venta</th>
                <th style="text-align:right">Stock</th>
              </tr>
            </thead>
            <tbody>${filas}</tbody>
          </table>
        </body>
      </html>
    `;
    }
    serializar(producto, rol) {
        const base = {
            ...producto,
            precioCosto: Number(producto.precioCosto),
            precioVenta: Number(producto.precioVenta),
            stockTotal: producto.inventarios.reduce((sum, i) => sum + i.cantidad, 0),
        };
        if (rol === client_1.RolUsuario.VENDEDOR) {
            const { precioCosto, ...sinCosto } = base;
            return sinCosto;
        }
        return base;
    }
};
exports.ProductosService = ProductosService;
exports.ProductosService = ProductosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pdf_service_1.PdfService])
], ProductosService);
//# sourceMappingURL=productos.service.js.map