import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';
import { RecibirTransferenciaDto } from './dto/recibir-transferencia.dto';

const INCLUDE_TRANSFERENCIA = {
  sucursalOrigen: true,
  sucursalDestino: true,
  usuarioEnvia: { select: { nombres: true, apellidos: true } },
  usuarioRecibe: { select: { nombres: true, apellidos: true } },
  detalles: { include: { producto: { select: { codigo: true, nombre: true } } } },
} satisfies Prisma.TransferenciaInclude;

@Injectable()
export class TransferenciasService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private auditoriaService: AuditoriaService,
  ) {}

  findAll(sucursalId?: string) {
    return this.prisma.transferencia.findMany({
      where: sucursalId
        ? { OR: [{ sucursalOrigenId: sucursalId }, { sucursalDestinoId: sucursalId }] }
        : undefined,
      include: INCLUDE_TRANSFERENCIA,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const transferencia = await this.prisma.transferencia.findUnique({
      where: { id },
      include: INCLUDE_TRANSFERENCIA,
    });
    if (!transferencia) throw new NotFoundException('Transferencia no encontrada');
    return transferencia;
  }

  async create(
    dto: CreateTransferenciaDto,
    sucursalOrigenId: string,
    usuarioId: string,
    ip?: string,
  ) {
    if (dto.sucursalDestinoId === sucursalOrigenId) {
      throw new BadRequestException('La sucursal destino debe ser distinta a la de origen');
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

  async enviar(id: string, usuarioId: string, ip?: string) {
    const transferencia = await this.findOne(id);
    if (transferencia.estado !== 'PENDIENTE') {
      throw new BadRequestException(
        `No se puede enviar una transferencia en estado ${transferencia.estado}`,
      );
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
          throw new BadRequestException(
            `Stock insuficiente en origen para "${detalle.producto.nombre}"`,
          );
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

  async recibir(
    id: string,
    usuarioId: string,
    dto: RecibirTransferenciaDto,
    ip?: string,
  ) {
    const transferencia = await this.findOne(id);
    if (transferencia.estado !== 'EN_TRANSITO') {
      throw new BadRequestException(
        `No se puede recibir una transferencia en estado ${transferencia.estado}`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      for (const detalle of transferencia.detalles) {
        const cantidadRecibida =
          dto.items?.find((i) => i.productoId === detalle.productoId)?.cantidadRecibida ??
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

  async anular(id: string, usuarioId: string, ip?: string) {
    const transferencia = await this.findOne(id);
    if (transferencia.estado === 'RECIBIDA' || transferencia.estado === 'ANULADA') {
      throw new BadRequestException(
        `No se puede anular una transferencia en estado ${transferencia.estado}`,
      );
    }

    if (transferencia.estado === 'EN_TRANSITO') {
      // El stock ya salió de origen — hay que devolverlo.
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
    } else {
      // PENDIENTE: nunca se descontó stock, no hay nada que revertir.
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

  async reportePdf(id: string) {
    const transferencia = await this.findOne(id);
    const html = this.buildTransferenciaHtml(transferencia);
    return this.pdfService.htmlToPdf(html);
  }

  private async generarNumero() {
    const count = await this.prisma.transferencia.count();
    return `TRF-${String(count + 1).padStart(6, '0')}`;
  }

  private buildTransferenciaHtml(t: Awaited<ReturnType<TransferenciasService['findOne']>>): string {
    const filas = t.detalles
      .map(
        (d) => `
          <tr>
            <td>${d.producto.codigo}</td>
            <td>${d.producto.nombre}</td>
            <td style="text-align:right">${d.cantidad}</td>
            <td style="text-align:right">${d.cantidadRecibida ?? '—'}</td>
          </tr>
        `,
      )
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
            ${
              t.usuarioRecibe
                ? `Recibe: ${t.usuarioRecibe.nombres} ${t.usuarioRecibe.apellidos} (${new Date(t.fechaRecepcion!).toLocaleString('es-EC')})<br />`
                : ''
            }
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
}
