import { Injectable } from '@nestjs/common';
import { Configuracion } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { UpdateConfiguracionDto } from './dto/update-configuracion.dto';

@Injectable()
export class ConfiguracionService {
  constructor(private prisma: PrismaService) {}

  async get() {
    const existente = await this.prisma.configuracion.findFirst();
    const configuracion = existente ?? (await this.prisma.configuracion.create({ data: {} }));
    return this.serializar(configuracion);
  }

  async update(dto: UpdateConfiguracionDto) {
    const actual = await this.prisma.configuracion.findFirst();
    const id = actual?.id ?? (await this.prisma.configuracion.create({ data: {} })).id;
    const actualizada = await this.prisma.configuracion.update({
      where: { id },
      data: dto,
    });
    return this.serializar(actualizada);
  }

  // Prisma serializa Decimal como string en JSON — lo normalizamos a number
  // para que el contrato de la API sea consistente con el DTO (@IsNumber).
  private serializar(configuracion: Configuracion) {
    return {
      ...configuracion,
      porcentajeIva: Number(configuracion.porcentajeIva),
    };
  }
}
