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
exports.ServiciosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
let ServiciosService = class ServiciosService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const servicios = await this.prisma.servicio.findMany({
            where: { activo: true },
            orderBy: { nombre: 'asc' },
        });
        return servicios.map((s) => this.serializar(s));
    }
    async findOne(id) {
        const servicio = await this.prisma.servicio.findUnique({ where: { id } });
        if (!servicio)
            throw new common_1.NotFoundException('Servicio no encontrado');
        return this.serializar(servicio);
    }
    async create(dto) {
        const existente = await this.prisma.servicio.findUnique({
            where: { codigo: dto.codigo },
        });
        if (existente) {
            throw new common_1.ConflictException('Ya existe un servicio con ese código');
        }
        const servicio = await this.prisma.servicio.create({ data: dto });
        return this.serializar(servicio);
    }
    async update(id, dto) {
        await this.findOne(id);
        const servicio = await this.prisma.servicio.update({ where: { id }, data: dto });
        return this.serializar(servicio);
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.servicio.update({ where: { id }, data: { activo: false } });
        return { success: true };
    }
    serializar(servicio) {
        return { ...servicio, precio: Number(servicio.precio) };
    }
};
exports.ServiciosService = ServiciosService;
exports.ServiciosService = ServiciosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServiciosService);
//# sourceMappingURL=servicios.service.js.map