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
exports.ConfiguracionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
let ConfiguracionService = class ConfiguracionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async get() {
        const existente = await this.prisma.configuracion.findFirst();
        const configuracion = existente ?? (await this.prisma.configuracion.create({ data: {} }));
        return this.serializar(configuracion);
    }
    async update(dto) {
        const actual = await this.prisma.configuracion.findFirst();
        const id = actual?.id ?? (await this.prisma.configuracion.create({ data: {} })).id;
        const actualizada = await this.prisma.configuracion.update({
            where: { id },
            data: dto,
        });
        return this.serializar(actualizada);
    }
    serializar(configuracion) {
        return {
            ...configuracion,
            porcentajeIva: Number(configuracion.porcentajeIva),
        };
    }
};
exports.ConfiguracionService = ConfiguracionService;
exports.ConfiguracionService = ConfiguracionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConfiguracionService);
//# sourceMappingURL=configuracion.service.js.map