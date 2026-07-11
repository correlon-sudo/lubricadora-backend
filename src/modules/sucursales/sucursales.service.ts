import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';

@Injectable()
export class SucursalesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.sucursal.findMany({ orderBy: { nombre: 'asc' } });
  }

  async findOne(id: string) {
    const sucursal = await this.prisma.sucursal.findUnique({ where: { id } });
    if (!sucursal) throw new NotFoundException('Sucursal no encontrada');
    return sucursal;
  }

  create(dto: CreateSucursalDto) {
    return this.prisma.sucursal.create({ data: dto });
  }

  async update(id: string, dto: UpdateSucursalDto) {
    await this.findOne(id);
    return this.prisma.sucursal.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.sucursal.update({ where: { id }, data: { activo: false } });
    return { success: true };
  }
}
