import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';

@Injectable()
export class MarcasService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.marca.findMany({ orderBy: { nombre: 'asc' } });
  }

  async findOne(id: string) {
    const marca = await this.prisma.marca.findUnique({ where: { id } });
    if (!marca) throw new NotFoundException('Marca no encontrada');
    return marca;
  }

  create(dto: CreateMarcaDto) {
    return this.prisma.marca.create({ data: dto });
  }

  async update(id: string, dto: UpdateMarcaDto) {
    await this.findOne(id);
    return this.prisma.marca.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    const enUso = await this.prisma.producto.count({ where: { marcaId: id } });
    if (enUso > 0) {
      throw new ConflictException(
        'No se puede eliminar: hay productos usando esta marca',
      );
    }
    await this.prisma.marca.delete({ where: { id } });
    return { success: true };
  }
}
