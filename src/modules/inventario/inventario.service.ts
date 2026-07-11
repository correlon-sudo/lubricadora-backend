import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { AjusteInventarioDto } from './dto/ajuste-inventario.dto';
import { FindMovimientosQueryDto } from './dto/find-movimientos.query.dto';

@Injectable()
export class InventarioService {
  constructor(private prisma: PrismaService) {}

  async ajustar(dto: AjusteInventarioDto, usuarioId: string) {
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
        throw new BadRequestException(
          'El ajuste dejaría el stock en negativo',
        );
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

  async movimientos(filters: FindMovimientosQueryDto) {
    const where: Prisma.MovimientoInventarioWhereInput = {
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
}
