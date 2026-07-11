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
    const html = this.buildCotizacionHtml(cotizacion);
    return this.pdfService.htmlToPdf(html);
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

  private buildCotizacionHtml(cotizacion: any): string {
    const filas = cotizacion.detalles
      .map(
        (d: any) => `
          <tr>
            <td>${d.descripcion}</td>
            <td style="text-align:right">${d.cantidad}</td>
            <td style="text-align:right">${d.precioUnitario.toFixed(2)}</td>
            <td style="text-align:right">${d.subtotal.toFixed(2)}</td>
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
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            th, td { border: 1px solid #ccc; padding: 6px 8px; }
            th { background: #f2f2f2; text-align: left; }
            .totales td { border: none; padding: 2px 8px; }
          </style>
        </head>
        <body>
          <h1>Cotización ${cotizacion.numero}</h1>
          <div class="meta">
            Fecha: ${new Date(cotizacion.fecha).toLocaleString('es-EC')} · Válida ${cotizacion.validezDias} días<br />
            Cliente: ${cotizacion.cliente?.nombres ?? 'Consumidor Final'} ${cotizacion.cliente?.apellidos ?? ''}<br />
            Vendedor: ${cotizacion.usuario?.nombres ?? ''} ${cotizacion.usuario?.apellidos ?? ''}
          </div>
          <table>
            <thead>
              <tr><th>Descripción</th><th>Cant.</th><th>P. unitario</th><th>Subtotal</th></tr>
            </thead>
            <tbody>${filas}</tbody>
          </table>
          <table class="totales" style="width:auto; margin-left:auto;">
            <tr><td>Subtotal</td><td style="text-align:right">${cotizacion.subtotal.toFixed(2)}</td></tr>
            <tr><td>Descuento</td><td style="text-align:right">${cotizacion.descuento.toFixed(2)}</td></tr>
            <tr><td>IVA</td><td style="text-align:right">${cotizacion.iva.toFixed(2)}</td></tr>
            <tr><td><strong>Total</strong></td><td style="text-align:right"><strong>${cotizacion.total.toFixed(2)}</strong></td></tr>
          </table>
        </body>
      </html>
    `;
  }
}
