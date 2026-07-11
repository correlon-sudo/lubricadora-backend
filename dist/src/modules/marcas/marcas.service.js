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
exports.MarcasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
let MarcasService = class MarcasService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.marca.findMany({ orderBy: { nombre: 'asc' } });
    }
    async findOne(id) {
        const marca = await this.prisma.marca.findUnique({ where: { id } });
        if (!marca)
            throw new common_1.NotFoundException('Marca no encontrada');
        return marca;
    }
    create(dto) {
        return this.prisma.marca.create({ data: dto });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.marca.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        const enUso = await this.prisma.producto.count({ where: { marcaId: id } });
        if (enUso > 0) {
            throw new common_1.ConflictException('No se puede eliminar: hay productos usando esta marca');
        }
        await this.prisma.marca.delete({ where: { id } });
        return { success: true };
    }
};
exports.MarcasService = MarcasService;
exports.MarcasService = MarcasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MarcasService);
//# sourceMappingURL=marcas.service.js.map