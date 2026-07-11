import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../config/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

const SELECT_PUBLICO = {
  id: true,
  sucursalId: true,
  nombres: true,
  apellidos: true,
  cedula: true,
  email: true,
  username: true,
  rol: true,
  activo: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.usuario.findMany({ select: SELECT_PUBLICO });
  }

  async findOne(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: SELECT_PUBLICO,
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async create(dto: CreateUsuarioDto) {
    const existente = await this.prisma.usuario.findFirst({
      where: { OR: [{ username: dto.username }, { email: dto.email }, { cedula: dto.cedula }] },
    });
    if (existente) {
      throw new ConflictException('Ya existe un usuario con ese username, email o cédula');
    }

    const passwordHash = await bcrypt.hash(
      dto.password,
      parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),
    );

    return this.prisma.usuario.create({
      data: {
        sucursalId: dto.sucursalId,
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        cedula: dto.cedula,
        email: dto.email,
        username: dto.username,
        passwordHash,
        rol: dto.rol,
      },
      select: SELECT_PUBLICO,
    });
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    await this.findOne(id);
    return this.prisma.usuario.update({
      where: { id },
      data: dto,
      select: SELECT_PUBLICO,
    });
  }

  async updatePassword(id: string, password: string) {
    await this.findOne(id);
    const passwordHash = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),
    );
    await this.prisma.usuario.update({ where: { id }, data: { passwordHash } });
    return { success: true };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.usuario.update({ where: { id }, data: { activo: false } });
    return { success: true };
  }
}
