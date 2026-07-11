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
exports.UsuariosService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../../config/prisma.service");
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
};
let UsuariosService = class UsuariosService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.usuario.findMany({ select: SELECT_PUBLICO });
    }
    async findOne(id) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id },
            select: SELECT_PUBLICO,
        });
        if (!usuario)
            throw new common_1.NotFoundException('Usuario no encontrado');
        return usuario;
    }
    async create(dto) {
        const existente = await this.prisma.usuario.findFirst({
            where: { OR: [{ username: dto.username }, { email: dto.email }, { cedula: dto.cedula }] },
        });
        if (existente) {
            throw new common_1.ConflictException('Ya existe un usuario con ese username, email o cédula');
        }
        const passwordHash = await bcrypt.hash(dto.password, parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10));
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
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.usuario.update({
            where: { id },
            data: dto,
            select: SELECT_PUBLICO,
        });
    }
    async updatePassword(id, password) {
        await this.findOne(id);
        const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10));
        await this.prisma.usuario.update({ where: { id }, data: { passwordHash } });
        return { success: true };
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.usuario.update({ where: { id }, data: { activo: false } });
        return { success: true };
    }
};
exports.UsuariosService = UsuariosService;
exports.UsuariosService = UsuariosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsuariosService);
//# sourceMappingURL=usuarios.service.js.map