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
exports.VehiculosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
let VehiculosService = class VehiculosService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {
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
    async findOne(id) {
        const vehiculo = await this.prisma.vehiculo.findUnique({
            where: { id },
            include: { cliente: true },
        });
        if (!vehiculo)
            throw new common_1.NotFoundException('Vehículo no encontrado');
        return vehiculo;
    }
    async findByPlaca(placa) {
        const vehiculo = await this.prisma.vehiculo.findUnique({
            where: { placa: placa.toUpperCase() },
            include: { cliente: true },
        });
        if (!vehiculo)
            throw new common_1.NotFoundException('Vehículo no encontrado');
        return { ...vehiculo, historialServicios: [] };
    }
    async create(dto) {
        const placa = dto.placa.toUpperCase();
        const existente = await this.prisma.vehiculo.findUnique({ where: { placa } });
        if (existente) {
            throw new common_1.ConflictException('Ya existe un vehículo con esa placa');
        }
        return this.prisma.vehiculo.create({
            data: { ...dto, placa },
            include: { cliente: true },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.vehiculo.update({
            where: { id },
            data: { ...dto, placa: dto.placa ? dto.placa.toUpperCase() : undefined },
            include: { cliente: true },
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.vehiculo.update({ where: { id }, data: { activo: false } });
        return { success: true };
    }
};
exports.VehiculosService = VehiculosService;
exports.VehiculosService = VehiculosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VehiculosService);
//# sourceMappingURL=vehiculos.service.js.map