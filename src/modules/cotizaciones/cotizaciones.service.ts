import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { VentaCalculoService, TotalesCalculados } from '../ventas/venta-calculo.service';
import { VentasService } from '../ventas/ventas.service';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { ConvertirCotizacionDto } from './dto/convertir-cotizacion.dto';

const INCLUDE_COTIZACION = {
  detalles: true,
  cliente: true,
  vehiculo: true,
  usuario: { select: { nombres: true, apellidos: true } },
  sucursal: true,
} satisfies Prisma.CotizacionInclude;

@Injectable()
export class CotizacionesService {
  constructor(
    private prisma: PrismaService,
    private calculoService: VentaCalculoService,
    private ventasService: VentasService,
    private pdfService: PdfService,
  ) {}

  async findAll(sucursalId?: string) {
    const cotizaciones = await this.prisma.cotizacion.findMany({
      where: sucursalId ? { sucursalId } : undefined,
      include: INCLUDE_COTIZACION,
      orderBy: { fecha: 'desc' },
    });
    return cotizaciones.map((c) => this.serializar(c));
  }

  async findOne(id: string) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id },
      include: INCLUDE_COTIZACION,
    });
    if (!cotizacion) throw new NotFoundException('Cotización no encontrada');
    return this.serializar(cotizacion);
  }

  async create(dto: CreateCotizacionDto, sucursalId: string, usuarioId: string) {
    const calculado = await this.calculoService.calcular(dto.items);
    const numero = await this.generarNumero();

    const cotizacion = await this.prisma.cotizacion.create({
      data: {
        numero,
        sucursalId,
        clienteId: dto.clienteId,
        vehiculoId: dto.vehiculoId,
        usuarioId,
        validezDias: dto.validezDias ?? 8,
        subtotal: calculado.subtotal,
        descuento: calculado.descuentoTotal,
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
      },
      include: INCLUDE_COTIZACION,
    });

    return this.serializar(cotizacion);
  }

  async convertir(id: string, dto: ConvertirCotizacionDto, usuarioId: string) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id },
      include: { detalles: true },
    });
    if (!cotizacion) throw new NotFoundException('Cotización no encontrada');
    if (cotizacion.estado !== 'VIGENTE') {
      throw new BadRequestException(
        `No se puede convertir una cotización en estado ${cotizacion.estado}`,
      );
    }

    // Se honra el precio e IVA cotizados (frozen en cotizacion_detalle), NO
    // se recalcula contra el catálogo actual — ese es el sentido de cotizar.
    const calculado: TotalesCalculados = {
      items: cotizacion.detalles.map((d) => {
        const subtotalLinea = Number(d.subtotal);
        const ivaPorcentaje = Number(d.ivaPorcentaje);
        return {
          tipoItem: d.tipoItem,
          productoId: d.productoId,
          servicioId: d.servicioId,
          descripcion: d.descripcion,
          cantidad: d.cantidad,
          precioUnitario: Number(d.precioUnitario),
          descuento: Number(d.descuento),
          ivaPorcentaje,
          subtotalLinea,
          ivaLinea: Math.round(subtotalLinea * (ivaPorcentaje / 100) * 100) / 100,
        };
      }),
      subtotal: Number(cotizacion.subtotal),
      descuentoTotal: Number(cotizacion.descuento),
      iva: Number(cotizacion.iva),
      total: Number(cotizacion.total),
    };

    const venta = await this.ventasService.persistir(calculado, {
      tipoComprobante: dto.tipoComprobante,
      clienteId: cotizacion.clienteId ?? undefined,
      vehiculoId: cotizacion.vehiculoId ?? undefined,
      cotizacionId: cotizacion.id,
      pagos: dto.pagos,
      sucursalId: cotizacion.sucursalId,
      usuarioId,
    });

    await this.prisma.cotizacion.update({
      where: { id },
      data: { estado: 'CONVERTIDA' },
    });

    return venta;
  }

  async reportePdf(id: string) {
    const cotizacion = await this.findOne(id);
    const doc = this.pdfService.crear();
    this.dibujarCotizacionPdf(doc, cotizacion);
    return this.pdfService.aBuffer(doc);
  }

  private async generarNumero() {
    const count = await this.prisma.cotizacion.count();
    return `COT-${String(count + 1).padStart(6, '0')}`;
  }

  private serializar(cotizacion: {
    subtotal: Prisma.Decimal;
    descuento: Prisma.Decimal;
    iva: Prisma.Decimal;
    total: Prisma.Decimal;
    detalles: {
      precioUnitario: Prisma.Decimal;
      descuento: Prisma.Decimal;
      ivaPorcentaje: Prisma.Decimal;
      subtotal: Prisma.Decimal;
    }[];
    [key: string]: unknown;
  }) {
    return {
      ...cotizacion,
      subtotal: Number(cotizacion.subtotal),
      descuento: Number(cotizacion.descuento),
      iva: Number(cotizacion.iva),
      total: Number(cotizacion.total),
      detalles: cotizacion.detalles.map((d) => ({
        ...d,
        precioUnitario: Number(d.precioUnitario),
        descuento: Number(d.descuento),
        ivaPorcentaje: Number(d.ivaPorcentaje),
        subtotal: Number(d.subtotal),
      })),
    };
  }

  private dibujarCotizacionPdf(doc: PDFKit.PDFDocument, cotizacion: any): void {
    doc.fontSize(16).font('Helvetica-Bold').text(`Cotización ${cotizacion.numero}`);
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica').fillColor('#444');
    doc.text(
      `Fecha: ${new Date(cotizacion.fecha).toLocaleString('es-EC')} · Válida ${cotizacion.validezDias} días`,
    );
    doc.text(`Cliente: ${cotizacion.cliente?.nombres ?? 'Consumidor Final'} ${cotizacion.cliente?.apellidos ?? ''}`);
    doc.text(`Vendedor: ${cotizacion.usuario?.nombres ?? ''} ${cotizacion.usuario?.apellidos ?? ''}`);
    doc.fillColor('#000');
    doc.moveDown(1);

    const filas = cotizacion.detalles.map((d: any) => [
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
    doc.text(`Subtotal: ${cotizacion.subtotal.toFixed(2)}`, xTotales, doc.y, { width: 150, align: 'right' });
    doc.text(`Descuento: ${cotizacion.descuento.toFixed(2)}`, xTotales, doc.y, { width: 150, align: 'right' });
    doc.text(`IVA: ${cotizacion.iva.toFixed(2)}`, xTotales, doc.y, { width: 150, align: 'right' });
    doc
      .font('Helvetica-Bold')
      .text(`Total: ${cotizacion.total.toFixed(2)}`, xTotales, doc.y, { width: 150, align: 'right' });
  }
}
