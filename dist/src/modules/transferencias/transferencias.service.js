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
exports.TransferenciasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const pdf_service_1 = require("../pdf/pdf.service");
const auditoria_service_1 = require("../auditoria/auditoria.service");
const INCLUDE_TRANSFERENCIA = {
    sucursalOrigen: true,
    sucursalDestino: true,
    usuarioEnvia: { select: { nombres: true, apellidos: true } },
    usuarioRecibe: { select: { nombres: true, apellidos: true } },
    detalles: { include: { producto: { select: { codigo: true, nombre: true } } } },
};
let TransferenciasService = class TransferenciasService {
    constructor(prisma, pdfService, auditoriaService) {
        this.prisma = prisma;
        this.pdfService = pdfService;
        this.auditoriaService = auditoriaService;
    }
    findAll(sucursalId) {
        return this.prisma.transferencia.findMany({
            where: sucursalId
                ? { OR: [{ sucursalOrigenId: sucursalId }, { sucursalDestinoId: sucursalId }] }
                : undefined,
            include: INCLUDE_TRANSFERENCIA,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const transferencia = await this.prisma.transferencia.findUnique({
            where: { id },
            include: INCLUDE_TRANSFERENCIA,
        });
        if (!transferencia)
            throw new common_1.NotFoundException('Transferencia no encontrada');
        return transferencia;
    }
    async create(dto, sucursalOrigenId, usuarioId, ip) {
        if (dto.sucursalDestinoId === sucursalOrigenId) {
            throw new common_1.BadRequestException('La sucursal destino debe ser distinta a la de origen');
        }
        const numero = await this.generarNumero();
        const transferencia = await this.prisma.transferencia.create({
            data: {
                numero,
                sucursalOrigenId,
                sucursalDestinoId: dto.sucursalDestinoId,
                usuarioEnviaId: usuarioId,
                observacion: dto.observacion,
                detalles: {
                    create: dto.items.map((i) => ({
                        productoId: i.productoId,
                        cantidad: i.cantidad,
                    })),
                },
            },
            include: INCLUDE_TRANSFERENCIA,
        });
        await this.auditoriaService.registrar({
            usuarioId,
            accion: 'CREAR',
            entidad: 'transferencia',
            entidadId: transferencia.id,
            detalle: { numero: transferencia.numero, sucursalDestinoId: dto.sucursalDestinoId },
            ip,
        });
        return transferencia;
    }
    async enviar(id, usuarioId, ip) {
        const transferencia = await this.findOne(id);
        if (transferencia.estado !== 'PENDIENTE') {
            throw new common_1.BadRequestException(`No se puede enviar una transferencia en estado ${transferencia.estado}`);
        }
        await this.prisma.$transaction(async (tx) => {
            for (const detalle of transferencia.detalles) {
                const inventario = await tx.inventarioSucursal.upsert({
                    where: {
                        productoId_sucursalId: {
                            productoId: detalle.productoId,
                            sucursalId: transferencia.sucursalOrigenId,
                        },
                    },
                    update: { cantidad: { decrement: detalle.cantidad } },
                    create: {
                        productoId: detalle.productoId,
                        sucursalId: transferencia.sucursalOrigenId,
                        cantidad: -detalle.cantidad,
                    },
                });
                if (inventario.cantidad < 0) {
                    throw new common_1.BadRequestException(`Stock insuficiente en origen para "${detalle.producto.nombre}"`);
                }
                await tx.movimientoInventario.create({
                    data: {
                        productoId: detalle.productoId,
                        sucursalId: transferencia.sucursalOrigenId,
                        tipo: 'TRANSFERENCIA_SAL',
                        cantidad: -detalle.cantidad,
                        stockResultante: inventario.cantidad,
                        referenciaTipo: 'transferencia',
                        referenciaId: transferencia.id,
                        usuarioId,
                    },
                });
            }
            await tx.transferencia.update({
                where: { id },
                data: { estado: 'EN_TRANSITO', fechaEnvio: new Date() },
            });
        });
        await this.auditoriaService.registrar({
            usuarioId,
            accion: 'ENVIAR',
            entidad: 'transferencia',
            entidadId: transferencia.id,
            detalle: { numero: transferencia.numero },
            ip,
        });
        return this.findOne(id);
    }
    async recibir(id, usuarioId, dto, ip) {
        const transferencia = await this.findOne(id);
        if (transferencia.estado !== 'EN_TRANSITO') {
            throw new common_1.BadRequestException(`No se puede recibir una transferencia en estado ${transferencia.estado}`);
        }
        await this.prisma.$transaction(async (tx) => {
            for (const detalle of transferencia.detalles) {
                const cantidadRecibida = dto.items?.find((i) => i.productoId === detalle.productoId)?.cantidadRecibida ??
                    detalle.cantidad;
                const inventario = await tx.inventarioSucursal.upsert({
                    where: {
                        productoId_sucursalId: {
                            productoId: detalle.productoId,
                            sucursalId: transferencia.sucursalDestinoId,
                        },
                    },
                    update: { cantidad: { increment: cantidadRecibida } },
                    create: {
                        productoId: detalle.productoId,
                        sucursalId: transferencia.sucursalDestinoId,
                        cantidad: cantidadRecibida,
                    },
                });
                await tx.movimientoInventario.create({
                    data: {
                        productoId: detalle.productoId,
                        sucursalId: transferencia.sucursalDestinoId,
                        tipo: 'TRANSFERENCIA_ENT',
                        cantidad: cantidadRecibida,
                        stockResultante: inventario.cantidad,
                        referenciaTipo: 'transferencia',
                        referenciaId: transferencia.id,
                        usuarioId,
                    },
                });
                await tx.transferenciaDetalle.update({
                    where: { id: detalle.id },
                    data: { cantidadRecibida },
                });
            }
            await tx.transferencia.update({
                where: { id },
                data: { estado: 'RECIBIDA', fechaRecepcion: new Date(), usuarioRecibeId: usuarioId },
            });
        });
        await this.auditoriaService.registrar({
            usuarioId,
            accion: 'RECIBIR',
            entidad: 'transferencia',
            entidadId: transferencia.id,
            detalle: { numero: transferencia.numero },
            ip,
        });
        return this.findOne(id);
    }
    async anular(id, usuarioId, ip) {
        const transferencia = await this.findOne(id);
        if (transferencia.estado === 'RECIBIDA' || transferencia.estado === 'ANULADA') {
            throw new common_1.BadRequestException(`No se puede anular una transferencia en estado ${transferencia.estado}`);
        }
        if (transferencia.estado === 'EN_TRANSITO') {
            await this.prisma.$transaction(async (tx) => {
                for (const detalle of transferencia.detalles) {
                    const inventario = await tx.inventarioSucursal.update({
                        where: {
                            productoId_sucursalId: {
                                productoId: detalle.productoId,
                                sucursalId: transferencia.sucursalOrigenId,
                            },
                        },
                        data: { cantidad: { increment: detalle.cantidad } },
                    });
                    await tx.movimientoInventario.create({
                        data: {
                            productoId: detalle.productoId,
                            sucursalId: transferencia.sucursalOrigenId,
                            tipo: 'ANULACION',
                            cantidad: detalle.cantidad,
                            stockResultante: inventario.cantidad,
                            referenciaTipo: 'transferencia',
                            referenciaId: transferencia.id,
                            usuarioId,
                        },
                    });
                }
                await tx.transferencia.update({ where: { id }, data: { estado: 'ANULADA' } });
            });
        }
        else {
            await this.prisma.transferencia.update({ where: { id }, data: { estado: 'ANULADA' } });
        }
        await this.auditoriaService.registrar({
            usuarioId,
            accion: 'ANULAR',
            entidad: 'transferencia',
            entidadId: transferencia.id,
            detalle: { numero: transferencia.numero, estadoPrevio: transferencia.estado },
            ip,
        });
        return this.findOne(id);
    }
    async reportePdf(id) {
        const transferencia = await this.findOne(id);
        const html = this.buildTransferenciaHtml(transferencia);
        return this.pdfService.htmlToPdf(html);
    }
    async generarNumero() {
        const count = await this.prisma.transferencia.count();
        return `TRF-${String(count + 1).padStart(6, '0')}`;
    }
    buildTransferenciaHtml(t) {
        const filas = t.detalles
            .map((d) => `
          <tr>
            <td>${d.producto.codigo}</td>
            <td>${d.producto.nombre}</td>
            <td style="text-align:right">${d.cantidad}</td>
            <td style="text-align:right">${d.cantidadRecibida ?? '—'}</td>
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
            .meta { color: #444; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 6px 8px; }
            th { background: #f2f2f2; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Transferencia ${t.numero}</h1>
          <div class="meta">
            Origen: ${t.sucursalOrigen.nombre} → Destino: ${t.sucursalDestino.nombre}<br />
            Estado: ${t.estado}<br />
            Envía: ${t.usuarioEnvia.nombres} ${t.usuarioEnvia.apellidos}
            ${t.fechaEnvio ? ` (${new Date(t.fechaEnvio).toLocaleString('es-EC')})` : ''}<br />
            ${t.usuarioRecibe
            ? `Recibe: ${t.usuarioRecibe.nombres} ${t.usuarioRecibe.apellidos} (${new Date(t.fechaRecepcion).toLocaleString('es-EC')})<br />`
            : ''}
            ${t.observacion ? `Observación: ${t.observacion}` : ''}
          </div>
          <table>
            <thead>
              <tr><th>Código</th><th>Producto</th><th>Cant. enviada</th><th>Cant. recibida</th></tr>
            </thead>
            <tbody>${filas}</tbody>
          </table>
        </body>
      </html>
    `;
    }
};
exports.TransferenciasService = TransferenciasService;
exports.TransferenciasService = TransferenciasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pdf_service_1.PdfService,
        auditoria_service_1.AuditoriaService])
], TransferenciasService);
//# sourceMappingURL=transferencias.service.js.map