import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TipoItemVenta } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { VentaItemDto } from './dto/venta-item.dto';

export interface ItemCalculado {
  tipoItem: TipoItemVenta;
  productoId: string | null;
  servicioId: string | null;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  ivaPorcentaje: number;
  subtotalLinea: number;
  ivaLinea: number;
}

export interface TotalesCalculados {
  items: ItemCalculado[];
  subtotal: number;
  descuentoTotal: number;
  iva: number;
  total: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

@Injectable()
export class VentaCalculoService {
  constructor(private prisma: PrismaService) {}

  async calcular(items: VentaItemDto[]): Promise<TotalesCalculados> {
    if (!items || items.length === 0) {
      throw new BadRequestException('La venta debe tener al menos un ítem');
    }

    const configuracion = await this.prisma.configuracion.findFirst();
    const porcentajeIva = configuracion ? Number(configuracion.porcentajeIva) : 15;

    const itemsCalculados: ItemCalculado[] = [];

    for (const item of items) {
      let precioUnitario: number;
      let ivaAplicable: boolean;
      let descripcion: string;

      if (item.tipoItem === 'PRODUCTO') {
        if (!item.productoId) {
          throw new BadRequestException('productoId es requerido para items de tipo PRODUCTO');
        }
        const producto = await this.prisma.producto.findUnique({
          where: { id: item.productoId },
        });
        if (!producto || !producto.activo) {
          throw new NotFoundException(`Producto ${item.productoId} no encontrado`);
        }
        precioUnitario = Number(producto.precioVenta);
        ivaAplicable = producto.ivaAplicable;
        descripcion = producto.nombre;
      } else {
        if (!item.servicioId) {
          throw new BadRequestException('servicioId es requerido para items de tipo SERVICIO');
        }
        const servicio = await this.prisma.servicio.findUnique({
          where: { id: item.servicioId },
        });
        if (!servicio || !servicio.activo) {
          throw new NotFoundException(`Servicio ${item.servicioId} no encontrado`);
        }
        precioUnitario = Number(servicio.precio);
        ivaAplicable = servicio.ivaAplicable;
        descripcion = servicio.nombre;
      }

      const descuento = item.descuento ?? 0;
      const subtotalLinea = round2(precioUnitario * item.cantidad - descuento);
      if (subtotalLinea < 0) {
        throw new BadRequestException(
          `El descuento no puede ser mayor al subtotal de "${descripcion}"`,
        );
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
}
