import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { FindVehiculosQueryDto } from './dto/find-vehiculos.query.dto';

@Injectable()
export class VehiculosService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: FindVehiculosQueryDto) {
    const where: Prisma.VehiculoWhereInput = {
      activo: true,
      ...(filters.search && {
        OR: [
          { placa: { contains: filters.search, mode: 'insensitive' } },
          { marca: { contains: filters.search, mode: 'insensitive' } },
          { modelo: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    return this.prisma.vehiculo.findMany({
      where,
      include: { cliente: true },
      orderBy: { placa: 'asc' },
    });
  }

  async findOne(id: string) {
    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id },
      include: { cliente: true },
    });
    if (!vehiculo) throw new NotFoundException('Vehículo no encontrado');
    return vehiculo;
  }

  async findByPlaca(placa: string) {
    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { placa: placa.toUpperCase() },
      include: { cliente: true },
    });
    if (!vehiculo) throw new NotFoundException('Vehículo no encontrado');
    // Historial de servicios: se agrega cuando exista el módulo de ventas (Fase 4).
    return { ...vehiculo, historialServicios: [] };
  }

  async create(dto: CreateVehiculoDto) {
    const placa = dto.placa.toUpperCase();
    const existente = await this.prisma.vehiculo.findUnique({ where: { placa } });
    if (existente) {
      throw new ConflictException('Ya existe un vehículo con esa placa');
    }

    return this.prisma.vehiculo.create({
      data: { ...dto, placa },
      include: { cliente: true },
    });
  }

  async update(id: string, dto: UpdateVehiculoDto) {
    await this.findOne(id);
    return this.prisma.vehiculo.update({
      where: { id },
      data: { ...dto, placa: dto.placa ? dto.placa.toUpperCase() : undefined },
      include: { cliente: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.vehiculo.update({ where: { id }, data: { activo: false } });
    return { success: true };
  }
}
