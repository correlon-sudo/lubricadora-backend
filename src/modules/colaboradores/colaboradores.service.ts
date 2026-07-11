import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Colaborador, Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { CreateColaboradorDto } from './dto/create-colaborador.dto';
import { UpdateColaboradorDto } from './dto/update-colaborador.dto';
import { CreateAdelantoDto } from './dto/create-adelanto.dto';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { FindNominaQueryDto } from './dto/find-nomina.query.dto';

@Injectable()
export class ColaboradoresService {
  constructor(private prisma: PrismaService) {}

  async findAll(sucursalId?: string) {
    const colaboradores = await this.prisma.colaborador.findMany({
      where: { activo: true, ...(sucursalId ? { sucursalId } : {}) },
      include: { sucursal: true },
      orderBy: { nombres: 'asc' },
    });
    return colaboradores.map((c) => this.serializar(c));
  }

  async findOne(id: string) {
    const colaborador = await this.prisma.colaborador.findUnique({
      where: { id },
      include: { sucursal: true },
    });
    if (!colaborador) throw new NotFoundException('Colaborador no encontrado');
    return this.serializar(colaborador);
  }

  async create(dto: CreateColaboradorDto, sucursalId: string) {
    const existente = await this.prisma.colaborador.findUnique({
      where: { cedula: dto.cedula },
    });
    if (existente) {
      throw new ConflictException('Ya existe un colaborador con esa cédula');
    }

    const colaborador = await this.prisma.colaborador.create({
      data: { ...dto, sucursalId, fechaIngreso: new Date(dto.fechaIngreso) },
      include: { sucursal: true },
    });
    return this.serializar(colaborador);
  }

  async update(id: string, dto: UpdateColaboradorDto) {
    await this.findOne(id);
    const colaborador = await this.prisma.colaborador.update({
      where: { id },
      data: {
        ...dto,
        fechaIngreso: dto.fechaIngreso ? new Date(dto.fechaIngreso) : undefined,
      },
      include: { sucursal: true },
    });
    return this.serializar(colaborador);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.colaborador.update({ where: { id }, data: { activo: false } });
    return { success: true };
  }

  async actualizarFoto(id: string, fotoUrl: string) {
    await this.findOne(id);
    const colaborador = await this.prisma.colaborador.update({
      where: { id },
      data: { fotoUrl },
      include: { sucursal: true },
    });
    return this.serializar(colaborador);
  }

  async crearAdelanto(colaboradorId: string, dto: CreateAdelantoDto, usuarioRegistraId: string) {
    await this.findOne(colaboradorId);
    const adelanto = await this.prisma.adelantoSueldo.create({
      data: { colaboradorId, monto: dto.monto, motivo: dto.motivo, usuarioRegistraId },
    });
    return { ...adelanto, monto: Number(adelanto.monto) };
  }

  async findAdelantos(colaboradorId: string) {
    await this.findOne(colaboradorId);
    const adelantos = await this.prisma.adelantoSueldo.findMany({
      where: { colaboradorId },
      orderBy: { fecha: 'desc' },
    });
    return adelantos.map((a) => ({ ...a, monto: Number(a.monto) }));
  }

  async crearAsistencia(colaboradorId: string, dto: CreateAsistenciaDto) {
    await this.findOne(colaboradorId);
    // Único por (colaborador, fecha): upsert para permitir corregir el
    // registro del día sin fallar por la constraint de unicidad.
    return this.prisma.asistencia.upsert({
      where: {
        colaboradorId_fecha: { colaboradorId, fecha: new Date(dto.fecha) },
      },
      update: { estado: dto.estado, observacion: dto.observacion },
      create: {
        colaboradorId,
        fecha: new Date(dto.fecha),
        estado: dto.estado,
        observacion: dto.observacion,
      },
    });
  }

  async findAsistencias(colaboradorId: string) {
    await this.findOne(colaboradorId);
    return this.prisma.asistencia.findMany({
      where: { colaboradorId },
      orderBy: { fecha: 'desc' },
    });
  }

  async nomina(colaboradorId: string, query: FindNominaQueryDto) {
    const colaborador = await this.prisma.colaborador.findUnique({
      where: { id: colaboradorId },
    });
    if (!colaborador) throw new NotFoundException('Colaborador no encontrado');

    const periodoInicio = new Date(query.periodoInicio);
    const periodoFin = new Date(query.periodoFin);
    if (periodoFin < periodoInicio) {
      throw new BadRequestException('periodoFin no puede ser anterior a periodoInicio');
    }

    const existente = await this.prisma.nomina.findUnique({
      where: {
        colaboradorId_periodoInicio_periodoFin: {
          colaboradorId,
          periodoInicio,
          periodoFin,
        },
      },
    });
    if (existente) return this.serializarNomina(existente);

    // Reporte informativo (decisión confirmada): sueldo base − adelantos del
    // período. Sin cálculo de aportes de ley / descuentos por inasistencia.
    const adelantos = await this.prisma.adelantoSueldo.findMany({
      where: { colaboradorId, fecha: { gte: periodoInicio, lte: periodoFin } },
    });
    const totalAdelantos = adelantos.reduce((s, a) => s + Number(a.monto), 0);
    const sueldoBase = Number(colaborador.montoSueldo);
    const totalDescuentos = 0;
    const netoPagar = sueldoBase - totalAdelantos - totalDescuentos;

    const creada = await this.prisma.nomina.create({
      data: {
        colaboradorId,
        periodoInicio,
        periodoFin,
        sueldoBase,
        totalAdelantos,
        totalDescuentos,
        netoPagar,
      },
    });
    return this.serializarNomina(creada);
  }

  async marcarNominaPagada(nominaId: string) {
    const nomina = await this.prisma.nomina.findUnique({ where: { id: nominaId } });
    if (!nomina) throw new NotFoundException('Nómina no encontrada');
    if (nomina.estado === 'PAGADO') {
      throw new BadRequestException('Esta nómina ya está pagada');
    }
    const actualizada = await this.prisma.nomina.update({
      where: { id: nominaId },
      data: { estado: 'PAGADO', fechaPago: new Date() },
    });
    return this.serializarNomina(actualizada);
  }

  private serializar(colaborador: Colaborador & { [key: string]: unknown }) {
    return { ...colaborador, montoSueldo: Number(colaborador.montoSueldo) };
  }

  private serializarNomina(nomina: {
    sueldoBase: Prisma.Decimal;
    totalAdelantos: Prisma.Decimal;
    totalDescuentos: Prisma.Decimal;
    netoPagar: Prisma.Decimal;
    [key: string]: unknown;
  }) {
    return {
      ...nomina,
      sueldoBase: Number(nomina.sueldoBase),
      totalAdelantos: Number(nomina.totalAdelantos),
      totalDescuentos: Number(nomina.totalDescuentos),
      netoPagar: Number(nomina.netoPagar),
    };
  }
}
