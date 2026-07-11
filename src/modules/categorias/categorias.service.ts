import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
  }

  async findOne(id: string) {
    const categoria = await this.prisma.categoria.findUnique({ where: { id } });
    if (!categoria) throw new NotFoundException('Categoría no encontrada');
    return categoria;
  }

  create(dto: CreateCategoriaDto) {
    return this.prisma.categoria.create({ data: dto });
  }

  async update(id: string, dto: UpdateCategoriaDto) {
    await this.findOne(id);
    return this.prisma.categoria.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    const enUso = await this.prisma.producto.count({ where: { categoriaId: id } });
    if (enUso > 0) {
      throw new ConflictException(
        'No se puede eliminar: hay productos usando esta categoría',
      );
    }
    await this.prisma.categoria.delete({ where: { id } });
    return { success: true };
  }
}
