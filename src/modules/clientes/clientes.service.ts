import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TipoIdentificacion } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { esCedulaORucValido } from '../../common/pipes/cedula-ruc.validation.pipe';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { FindClientesQueryDto } from './dto/find-clientes.query.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: FindClientesQueryDto) {
    const where: Prisma.ClienteWhereInput = {
      activo: true,
      ...(filters.search && {
        OR: [
          { nombres: { contains: filters.search, mode: 'insensitive' } },
          { apellidos: { contains: filters.search, mode: 'insensitive' } },
          { identificacion: { contains: filters.search, mode: 'insensitive' } },
          { telefono: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    return this.prisma.cliente.findMany({ where, orderBy: { nombres: 'asc' } });
  }

  async findOne(id: string) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  async vehiculos(id: string) {
    await this.findOne(id);
    return this.prisma.vehiculo.findMany({
      where: { clienteId: id, activo: true },
      orderBy: { placa: 'asc' },
    });
  }

  async create(dto: CreateClienteDto) {
    this.validarIdentificacion(dto.tipoIdentificacion, dto.identificacion);

    const existente = await this.prisma.cliente.findUnique({
      where: { identificacion: dto.identificacion },
    });
    if (existente) {
      throw new ConflictException('Ya existe un cliente con esa identificación');
    }

    return this.prisma.cliente.create({ data: dto });
  }

  async update(id: string, dto: UpdateClienteDto) {
    await this.findOne(id);
    if (dto.tipoIdentificacion && dto.identificacion) {
      this.validarIdentificacion(dto.tipoIdentificacion, dto.identificacion);
    }
    return this.prisma.cliente.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const cliente = await this.findOne(id);
    if (cliente.esConsumidorFinal) {
      throw new BadRequestException('No se puede desactivar a Consumidor Final');
    }
    await this.prisma.cliente.update({ where: { id }, data: { activo: false } });
    return { success: true };
  }

  private validarIdentificacion(
    tipo: TipoIdentificacion,
    identificacion: string,
  ) {
    if (tipo === 'PASAPORTE') return;
    if (!esCedulaORucValido(identificacion)) {
      throw new BadRequestException(
        `"${identificacion}" no es una cédula ni un RUC ecuatoriano válido`,
      );
    }
  }
}
