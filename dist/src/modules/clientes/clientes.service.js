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
exports.ClientesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const cedula_ruc_validation_pipe_1 = require("../../common/pipes/cedula-ruc.validation.pipe");
let ClientesService = class ClientesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {
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
    async findOne(id) {
        const cliente = await this.prisma.cliente.findUnique({ where: { id } });
        if (!cliente)
            throw new common_1.NotFoundException('Cliente no encontrado');
        return cliente;
    }
    async vehiculos(id) {
        await this.findOne(id);
        return this.prisma.vehiculo.findMany({
            where: { clienteId: id, activo: true },
            orderBy: { placa: 'asc' },
        });
    }
    async create(dto) {
        this.validarIdentificacion(dto.tipoIdentificacion, dto.identificacion);
        const existente = await this.prisma.cliente.findUnique({
            where: { identificacion: dto.identificacion },
        });
        if (existente) {
            throw new common_1.ConflictException('Ya existe un cliente con esa identificación');
        }
        return this.prisma.cliente.create({ data: dto });
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.tipoIdentificacion && dto.identificacion) {
            this.validarIdentificacion(dto.tipoIdentificacion, dto.identificacion);
        }
        return this.prisma.cliente.update({ where: { id }, data: dto });
    }
    async remove(id) {
        const cliente = await this.findOne(id);
        if (cliente.esConsumidorFinal) {
            throw new common_1.BadRequestException('No se puede desactivar a Consumidor Final');
        }
        await this.prisma.cliente.update({ where: { id }, data: { activo: false } });
        return { success: true };
    }
    validarIdentificacion(tipo, identificacion) {
        if (tipo === 'PASAPORTE')
            return;
        if (!(0, cedula_ruc_validation_pipe_1.esCedulaORucValido)(identificacion)) {
            throw new common_1.BadRequestException(`"${identificacion}" no es una cédula ni un RUC ecuatoriano válido`);
        }
    }
};
exports.ClientesService = ClientesService;
exports.ClientesService = ClientesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientesService);
//# sourceMappingURL=clientes.service.js.map