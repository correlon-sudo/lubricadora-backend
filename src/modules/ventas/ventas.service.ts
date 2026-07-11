import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TipoComprobante } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { VentaCalculoService, TotalesCalculados } from './venta-calculo.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { CreatePagoDto } from './dto/venta-item.dto';

const PREFIJOS_COMPROBANTE: Record<TipoComprobante, string> = {
  FACTURA: 'FAC',
  NOTA_VENTA: 'NV',
  NOTA_PEDIDO: 'NP',
  NOTA_ENTREGA: 'NE',
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

interface PersistirParams {
  tipoComprobante: TipoComprobante;
  clienteId?: string;
  vehiculoId?: string;
  cotizacionId?: string;
  pagos: CreatePagoDto[];
  sucursalId: string;
  usuarioId: string;
  ip?: string;
}

const INCLUDE_VENTA = {
  detalles: true,
  pagos: true,
  cliente: true,
  vehiculo: true,
  usuario: { select: { nombres: true, apellidos: true } },
  sucursal: true,
} satisfies Prisma.VentaInclude;

@Injectable()
export class VentasService {
  constructor(
    private prisma: PrismaService,
    private calculoService: VentaCalculoService,
    private pdfService: PdfService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll(sucursalId?: string) {
    const ventas = await this.prisma.venta.findMany({
      where: sucursalId ? { sucursalId } : undefined,
      include: INCLUDE_VENTA,
      orderBy: { fecha: 'desc' },
    });
    return ventas.map((v) => this.serializar(v));
  }

  async findOne(id: string) {
    const venta = await this.prisma.venta.findUnique({
      where: { id },
      include: INCLUDE_VENTA,
    });
    if (!venta) throw new NotFoundException('Venta no encontrada');
    return this.serializar(venta);
  }

  async create(dto: CreateVentaDto, sucursalId: string, usuarioId: string, ip?: string) {
    const calculado = await this.calculoService.calcular(dto.items);
    return this.persistir(calculado, {
      tipoComprobante: dto.tipoComprobante,
      clienteId: dto.clienteId,
      vehiculoId: dto.vehiculoId,
      pagos: dto.pagos,
      sucursalId,
      usuarioId,
      ip,
    });
  }

  async persistir(calculado: TotalesCalculados, params: PersistirParams) {
    const sumaPagos = round2(params.pagos.reduce((s, p) => s + p.monto, 0));
    if (Math.abs(sumaPagos - calculado.total) > 0.01) {
      throw new BadRequestException(
        `La suma de pagos (${sumaPagos}) no coincide con el total (${calculado.total})`,
      );
    }

    // Fase 5: toda venta ocurre dentro de una sesión de caja abierta. Se
    // busca server-side (nunca del cliente) y se adjunta automáticamente.
    const cajaAbierta = await this.prisma.caja.findFirst({
      where: { sucursalId: params.sucursalId, estado: 'ABIERTA' },
    });
    if (!cajaAbierta) {
      throw new BadRequestException(
        'No hay una caja abierta en esta sucursal. Abrí caja antes de vender.',
      );
    }

    const clienteId = params.clienteId ?? (await this.consumidorFinalId());

    const venta = await this.prisma.$transaction(async (tx) => {
      const numero = await this.generarNumero(tx, params.tipoComprobante);

      const ventaCreada = await tx.venta.create({
        data: {
          numero,
          tipoComprobante: params.tipoComprobante,
          sucursalId: params.sucursalId,
          cajaId: cajaAbierta.id,
          clienteId,
          vehiculoId: params.vehiculoId,
          usuarioId: params.usuarioId,
          cotizacionId: params.cotizacionId,
          subtotal: calculado.subtotal,
          descuentoTotal: calculado.descuentoTotal,
          iva: calculado.iva,
          total: calculado.total,
          detalles: {
            create: calculado.items.map((i) => ({
              tipoItem: i.tipoItem,
              productoId: i.productoId,
              servicioId: i.servicioId,
              descripcion: i.descripcion,
              cantidad: i.cantidad,
              precioUnitario: i.precioUnitario,
              descuento: i.descuento,
              ivaPorcentaje: i.ivaPorcentaje,
              subtotal: i.subtotalLinea,
            })),
          },
          pagos: {
            create: params.pagos.map((p) => ({
              formaPago: p.formaPago,
              monto: p.monto,
              referencia: p.referencia,
            })),
          },
        },
        include: INCLUDE_VENTA,
      });

      for (const item of calculado.items.filter((i) => i.tipoItem === 'PRODUCTO')) {
        const inventario = await tx.inventarioSucursal.upsert({
          where: {
            productoId_sucursalId: {
              productoId: item.productoId!,
              sucursalId: params.sucursalId,
            },
          },
          update: { cantidad: { decrement: item.cantidad } },
          create: {
            productoId: item.productoId!,
            sucursalId: params.sucursalId,
            cantidad: -item.cantidad,
          },
        });

        if (inventario.cantidad < 0) {
          throw new BadRequestException(
            `Stock insuficiente para "${item.descripcion}"`,
          );
        }

        await tx.movimientoInventario.create({
          data: {
            productoId: item.productoId!,
            sucursalId: params.sucursalId,
            tipo: 'VENTA',
            cantidad: -item.cantidad,
            stockResultante: inventario.cantidad,
            referenciaTipo: 'venta',
            referenciaId: ventaCreada.id,
            usuarioId: params.usuarioId,
          },
        });
      }

      return ventaCreada;
    });

    await this.auditoriaService.registrar({
      usuarioId: params.usuarioId,
      accion: 'CREAR',
      entidad: 'venta',
      entidadId: venta.id,
      detalle: { numero: venta.numero, total: calculado.total, tipoComprobante: params.tipoComprobante },
      ip: params.ip,
    });

    return this.serializar(venta);
  }

  async anular(id: string, usuarioIdQueAnula: string, ip?: string) {
    const venta = await this.prisma.venta.findUnique({
      where: { id },
      include: { detalles: true },
    });
    if (!venta) throw new NotFoundException('Venta no encontrada');
    if (venta.estado === 'ANULADA') {
      throw new BadRequestException('La venta ya está anulada');
    }

    await this.prisma.$transaction(async (tx) => {
      for (const detalle of venta.detalles.filter((d) => d.tipoItem === 'PRODUCTO')) {
        const inventario = await tx.inventarioSucursal.update({
          where: {
            productoId_sucursalId: {
              productoId: detalle.productoId!,
              sucursalId: venta.sucursalId,
            },
          },
          data: { cantidad: { increment: detalle.cantidad } },
        });

        await tx.movimientoInventario.create({
          data: {
            productoId: detalle.productoId!,
            sucursalId: venta.sucursalId,
            tipo: 'ANULACION',
            cantidad: detalle.cantidad,
            stockResultante: inventario.cantidad,
            referenciaTipo: 'venta',
            referenciaId: venta.id,
            usuarioId: usuarioIdQueAnula,
          },
        });
      }

      await tx.venta.update({ where: { id }, data: { estado: 'ANULADA' } });
    });

    await this.auditoriaService.registrar({
      usuarioId: usuarioIdQueAnula,
      accion: 'ANULAR',
      entidad: 'venta',
      entidadId: venta.id,
      detalle: { numero: venta.numero },
      ip,
    });

    return this.findOne(id);
  }

  async reportePdf(id: string) {
    const venta = await this.findOne(id);
    const doc = this.pdfService.crear();
    this.dibujarVentaPdf(doc, venta);
    return this.pdfService.aBuffer(doc);
  }

  private async generarNumero(tx: Prisma.TransactionClient, tipo: TipoComprobante) {
    const count = await tx.venta.count({ where: { tipoComprobante: tipo } });
    return `${PREFIJOS_COMPROBANTE[tipo]}-${String(count + 1).padStart(6, '0')}`;
  }

  private async consumidorFinalId(): Promise<string> {
    const consumidorFinal = await this.prisma.cliente.findFirst({
      where: { esConsumidorFinal: true },
    });
    if (!consumidorFinal) {
      throw new NotFoundException('No existe un cliente "Consumidor Final" configurado');
    }
    return consumidorFinal.id;
  }

  private serializar(venta: {
    subtotal: Prisma.Decimal;
    descuentoTotal: Prisma.Decimal;
    iva: Prisma.Decimal;
    total: Prisma.Decimal;
    detalles: { precioUnitario: Prisma.Decimal; descuento: Prisma.Decimal; ivaPorcentaje: Prisma.Decimal; subtotal: Prisma.Decimal }[];
    pagos: { monto: Prisma.Decimal }[];
    [key: string]: unknown;
  }) {
    return {
      ...venta,
      subtotal: Number(venta.subtotal),
      descuentoTotal: Number(venta.descuentoTotal),
      iva: Number(venta.iva),
      total: Number(venta.total),
      detalles: venta.detalles.map((d) => ({
        ...d,
        precioUnitario: Number(d.precioUnitario),
        descuento: Number(d.descuento),
        ivaPorcentaje: Number(d.ivaPorcentaje),
        subtotal: Number(d.subtotal),
      })),
      pagos: venta.pagos.map((p) => ({ ...p, monto: Number(p.monto) })),
    };
  }

  private dibujarVentaPdf(doc: PDFKit.PDFDocument, venta: any): void {
    doc.fontSize(16).font('Helvetica-Bold').text(`${venta.tipoComprobante} ${venta.numero}`);
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica').fillColor('#444');
    doc.text(`Fecha: ${new Date(venta.fecha).toLocaleString('es-EC')}`);
    doc.text(
      `Cliente: ${venta.cliente?.nombres ?? ''} ${venta.cliente?.apellidos ?? ''} (${venta.cliente?.identificacion ?? '—'})`,
    );
    if (venta.vehiculo) {
      doc.text(`Vehículo: ${venta.vehiculo.placa} — ${venta.vehiculo.marca} ${venta.vehiculo.modelo}`);
    }
    doc.text(`Vendedor: ${venta.usuario?.nombres ?? ''} ${venta.usuario?.apellidos ?? ''}`);
    doc.fillColor('#000');
    doc.moveDown(1);

    const filas = venta.detalles.map((d: any) => [
      d.descripcion,
      String(d.cantidad),
      d.precioUnitario.toFixed(2),
      d.subtotal.toFixed(2),
    ]);
    doc.y = this.pdfService.dibujarTabla(
      doc,
      40,
      doc.y,
      [
        { titulo: 'Descripción', ancho: 250 },
        { titulo: 'Cant.', ancho: 60, align: 'right' },
        { titulo: 'P. unitario', ancho: 90, align: 'right' },
        { titulo: 'Subtotal', ancho: 90, align: 'right' },
      ],
      filas,
    );
    doc.moveDown(1);

    const xTotales = 350;
    doc.fontSize(9).font('Helvetica');
    doc.text(`Subtotal: ${venta.subtotal.toFixed(2)}`, xTotales, doc.y, { width: 150, align: 'right' });
    doc.text(`Descuento: ${venta.descuentoTotal.toFixed(2)}`, xTotales, doc.y, { width: 150, align: 'right' });
    doc.text(`IVA: ${venta.iva.toFixed(2)}`, xTotales, doc.y, { width: 150, align: 'right' });
    doc
      .font('Helvetica-Bold')
      .text(`Total: ${venta.total.toFixed(2)}`, xTotales, doc.y, { width: 150, align: 'right' });
  }
}
