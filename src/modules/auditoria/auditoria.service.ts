import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { FindAuditoriaQueryDto } from './dto/find-auditoria.query.dto';

interface RegistrarParams {
  usuarioId: string;
  accion: string;
  entidad: string;
  entidadId: string;
  detalle?: Record<string, unknown>;
  ip?: string;
}

@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(private prisma: PrismaService) {}

  // No debe romper la operación de negocio que la dispara (ej. una venta no
  // puede fallar porque el log de auditoría falle) — se loguea el error y
  // se sigue.
  async registrar(params: RegistrarParams) {
    try {
      await this.prisma.auditoria.create({
        data: {
          usuarioId: params.usuarioId,
          accion: params.accion,
          entidad: params.entidad,
          entidadId: params.entidadId,
          detalle: params.detalle as Prisma.InputJsonValue,
          ip: params.ip,
        },
      });
    } catch (err) {
      this.logger.error(
        `No se pudo registrar auditoría (${params.entidad}/${params.accion})`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  async findAll(filters: FindAuditoriaQueryDto) {
    const where: Prisma.AuditoriaWhereInput = {
      entidad: filters.entidad,
      usuarioId: filters.usuarioId,
      ...((filters.desde || filters.hasta) && {
        fecha: {
          gte: filters.desde ? new Date(filters.desde) : undefined,
          lte: filters.hasta ? new Date(filters.hasta) : undefined,
        },
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.auditoria.findMany({
        where,
        include: {
          usuario: { select: { nombres: true, apellidos: true, username: true } },
        },
        orderBy: { fecha: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.auditoria.count({ where }),
    ]);

    return { items, total, page: filters.page, limit: filters.limit };
  }
}
