import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Servicio } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Injectable()
export class ServiciosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const servicios = await this.prisma.servicio.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
    return servicios.map((s) => this.serializar(s));
  }

  async findOne(id: string) {
    const servicio = await this.prisma.servicio.findUnique({ where: { id } });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');
    return this.serializar(servicio);
  }

  async create(dto: CreateServicioDto) {
    const existente = await this.prisma.servicio.findUnique({
      where: { codigo: dto.codigo },
    });
    if (existente) {
      throw new ConflictException('Ya existe un servicio con ese código');
    }
    const servicio = await this.prisma.servicio.create({ data: dto });
    return this.serializar(servicio);
  }

  async update(id: string, dto: UpdateServicioDto) {
    await this.findOne(id);
    const servicio = await this.prisma.servicio.update({ where: { id }, data: dto });
    return this.serializar(servicio);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.servicio.update({ where: { id }, data: { activo: false } });
    return { success: true };
  }

  private serializar(servicio: Servicio) {
    return { ...servicio, precio: Number(servicio.precio) };
  }
}
