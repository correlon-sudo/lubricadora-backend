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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferenciasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const transferencias_service_1 = require("./transferencias.service");
const create_transferencia_dto_1 = require("./dto/create-transferencia.dto");
const recibir_transferencia_dto_1 = require("./dto/recibir-transferencia.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let TransferenciasController = class TransferenciasController {
    constructor(transferenciasService) {
        this.transferenciasService = transferenciasService;
    }
    findAll(user, sucursalId) {
        const scope = user.rol === client_1.RolUsuario.ADMIN ? sucursalId : user.sucursalId;
        return this.transferenciasService.findAll(scope);
    }
    findOne(id) {
        return this.transferenciasService.findOne(id);
    }
    async reportePdf(id, res) {
        const pdf = await this.transferenciasService.reportePdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename="transferencia.pdf"',
        });
        res.send(pdf);
    }
    create(dto, user, req) {
        return this.transferenciasService.create(dto, user.sucursalId, user.id, req.ip);
    }
    enviar(id, user, req) {
        return this.transferenciasService.enviar(id, user.id, req.ip);
    }
    recibir(id, dto, user, req) {
        return this.transferenciasService.recibir(id, user.id, dto, req.ip);
    }
    anular(id, user, req) {
        return this.transferenciasService.anular(id, user.id, req.ip);
    }
};
exports.TransferenciasController = TransferenciasController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('sucursalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TransferenciasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransferenciasController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TransferenciasController.prototype, "reportePdf", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.RolUsuario.ADMIN, client_1.RolUsuario.ENCARGADO),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transferencia_dto_1.CreateTransferenciaDto, Object, Object]),
    __metadata("design:returntype", void 0)
], TransferenciasController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.RolUsuario.ADMIN, client_1.RolUsuario.ENCARGADO),
    (0, common_1.Patch)(':id/enviar'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TransferenciasController.prototype, "enviar", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.RolUsuario.ADMIN, client_1.RolUsuario.ENCARGADO),
    (0, common_1.Patch)(':id/recibir'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, recibir_transferencia_dto_1.RecibirTransferenciaDto, Object, Object]),
    __metadata("design:returntype", void 0)
], TransferenciasController.prototype, "recibir", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.RolUsuario.ADMIN, client_1.RolUsuario.ENCARGADO),
    (0, common_1.Patch)(':id/anular'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TransferenciasController.prototype, "anular", null);
exports.TransferenciasController = TransferenciasController = __decorate([
    (0, swagger_1.ApiTags)('transferencias'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('transferencias'),
    __metadata("design:paramtypes", [transferencias_service_1.TransferenciasService])
], TransferenciasController);
//# sourceMappingURL=transferencias.controller.js.map