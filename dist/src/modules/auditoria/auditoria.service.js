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
var AuditoriaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditoriaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
let AuditoriaService = AuditoriaService_1 = class AuditoriaService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AuditoriaService_1.name);
    }
    async registrar(params) {
        try {
            await this.prisma.auditoria.create({
                data: {
                    usuarioId: params.usuarioId,
                    accion: params.accion,
                    entidad: params.entidad,
                    entidadId: params.entidadId,
                    detalle: params.detalle,
                    ip: params.ip,
                },
            });
        }
        catch (err) {
            this.logger.error(`No se pudo registrar auditoría (${params.entidad}/${params.accion})`, err instanceof Error ? err.stack : String(err));
        }
    }
    async findAll(filters) {
        const where = {
            entidad: filters.entidad,
            usuarioId: filters.usuarioId,
            ...((filters.desde || filters.hasta) && {
                fecha: {
                    gte: filters.desde ? new Date(filters.desde) : undefined,
                    lte: filters.hasta ? new Date(filters.hasta) : undefined,
                },
            }),
        };
        const [items, total] = await Promise.all([
            this.prisma.auditoria.findMany({
                where,
                include: {
                    usuario: { select: { nombres: true, apellidos: true, username: true } },
                },
                orderBy: { fecha: 'desc' },
                skip: (filters.page - 1) * filters.limit,
                take: filters.limit,
            }),
            this.prisma.auditoria.count({ where }),
        ]);
        return { items, total, page: filters.page, limit: filters.limit };
    }
};
exports.AuditoriaService = AuditoriaService;
exports.AuditoriaService = AuditoriaService = AuditoriaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditoriaService);
//# sourceMappingURL=auditoria.service.js.map