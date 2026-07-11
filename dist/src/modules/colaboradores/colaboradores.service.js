"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColaboradoresService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
let ColaboradoresService = class ColaboradoresService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(sucursalId) {
        const colaboradores = await this.prisma.colaborador.findMany({
            where: { activo: true, ...(sucursalId ? { sucursalId } : {}) },
            include: { sucursal: true },
            orderBy: { nombres: 'asc' },
        });
        return colaboradores.map((c) => this.serializar(c));
    }
    async findOne(id) {
        const colaborador = await this.prisma.colaborador.findUnique({
            where: { id },
            include: { sucursal: true },
        });
        if (!colaborador)
            throw new common_1.NotFoundException('Colaborador no encontrado');
        return this.serializar(colaborador);
    }
    async create(dto, sucursalId) {
        const existente = await this.prisma.colaborador.findUnique({
            where: { cedula: dto.cedula },
        });
        if (existente) {
            throw new common_1.ConflictException('Ya existe un colaborador con esa cédula');
        }
        const colaborador = await this.prisma.colaborador.create({
            data: { ...dto, sucursalId, fechaIngreso: new Date(dto.fechaIngreso) },
            include: { sucursal: true },
        });
        return this.serializar(colaborador);
    }
    async update(id, dto) {
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
    async remove(id) {
        await this.findOne(id);
        await this.prisma.colaborador.update({ where: { id }, data: { activo: false } });
        return { success: true };
    }
    async actualizarFoto(id, fotoUrl) {
        await this.findOne(id);
        const colaborador = await this.prisma.colaborador.update({
            where: { id },
            data: { fotoUrl },
            include: { sucursal: true },
        });
        return this.serializar(colaborador);
    }
    async crearAdelanto(colaboradorId, dto, usuarioRegistraId) {
        await this.findOne(colaboradorId);
        const adelanto = await this.prisma.adelantoSueldo.create({
            data: { colaboradorId, monto: dto.monto, motivo: dto.motivo, usuarioRegistraId },
        });
        return { ...adelanto, monto: Number(adelanto.monto) };
    }
    async findAdelantos(colaboradorId) {
        await this.findOne(colaboradorId);
        const adelantos = await this.prisma.adelantoSueldo.findMany({
            where: { colaboradorId },
            orderBy: { fecha: 'desc' },
        });
        return adelantos.map((a) => ({ ...a, monto: Number(a.monto) }));
    }
    async crearAsistencia(colaboradorId, dto) {
        await this.findOne(colaboradorId);
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
    async findAsistencias(colaboradorId) {
        await this.findOne(colaboradorId);
        return this.prisma.asistencia.findMany({
            where: { colaboradorId },
            orderBy: { fecha: 'desc' },
        });
    }
    async nomina(colaboradorId, query) {
        const colaborador = await this.prisma.colaborador.findUnique({
            where: { id: colaboradorId },
        });
        if (!colaborador)
            throw new common_1.NotFoundException('Colaborador no encontrado');
        const periodoInicio = new Date(query.periodoInicio);
        const periodoFin = new Date(query.periodoFin);
        if (periodoFin < periodoInicio) {
            throw new common_1.BadRequestException('periodoFin no puede ser anterior a periodoInicio');
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
        if (existente)
            return this.serializarNomina(existente);
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
    async marcarNominaPagada(nominaId) {
        const nomina = await this.prisma.nomina.findUnique({ where: { id: nominaId } });
        if (!nomina)
            throw new common_1.NotFoundException('Nómina no encontrada');
        if (nomina.estado === 'PAGADO') {
            throw new common_1.BadRequestException('Esta nómina ya está pagada');
        }
        const actualizada = await this.prisma.nomina.update({
            where: { id: nominaId },
            data: { estado: 'PAGADO', fechaPago: new Date() },
        });
        return this.serializarNomina(actualizada);
    }
    serializar(colaborador) {
        return { ...colaborador, montoSueldo: Number(colaborador.montoSueldo) };
    }
    serializarNomina(nomina) {
        return {
            ...nomina,
            sueldoBase: Number(nomina.sueldoBase),
            totalAdelantos: Number(nomina.totalAdelantos),
            totalDescuentos: Number(nomina.totalDescuentos),
            netoPagar: Number(nomina.netoPagar),
        };
    }
};
exports.ColaboradoresService = ColaboradoresService;
exports.ColaboradoresService = ColaboradoresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ColaboradoresService);
//# sourceMappingURL=colaboradores.service.js.map