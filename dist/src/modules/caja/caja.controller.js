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
exports.CajaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const caja_service_1 = require("./caja.service");
const abrir_caja_dto_1 = require("./dto/abrir-caja.dto");
const cerrar_caja_dto_1 = require("./dto/cerrar-caja.dto");
const movimiento_caja_dto_1 = require("./dto/movimiento-caja.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let CajaController = class CajaController {
    constructor(cajaService) {
        this.cajaService = cajaService;
    }
    abrir(dto, user, req) {
        return this.cajaService.abrir(user.sucursalId, user.id, dto, req.ip);
    }
    actual(user) {
        return this.cajaService.actual(user.sucursalId);
    }
    historial(user, sucursalId) {
        const scope = user.rol === client_1.RolUsuario.ADMIN ? sucursalId : user.sucursalId;
        return this.cajaService.historial(scope);
    }
    reporteDiario(id) {
        return this.cajaService.reporteDiario(id);
    }
    async reportePdf(id, res) {
        const pdf = await this.cajaService.reportePdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename="cierre-caja.pdf"',
        });
        res.send(pdf);
    }
    cerrar(id, dto, user, req) {
        return this.cajaService.cerrar(id, user.id, dto, req.ip);
    }
    movimiento(id, dto, user) {
        return this.cajaService.movimiento(id, user.id, dto);
    }
};
exports.CajaController = CajaController;
__decorate([
    (0, common_1.Post)('abrir'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [abrir_caja_dto_1.AbrirCajaDto, Object, Object]),
    __metadata("design:returntype", void 0)
], CajaController.prototype, "abrir", null);
__decorate([
    (0, common_1.Get)('actual'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CajaController.prototype, "actual", null);
__decorate([
    (0, common_1.Get)('historial'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('sucursalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CajaController.prototype, "historial", null);
__decorate([
    (0, common_1.Get)(':id/reporte-diario'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CajaController.prototype, "reporteDiario", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CajaController.prototype, "reportePdf", null);
__decorate([
    (0, common_1.Patch)(':id/cerrar'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cerrar_caja_dto_1.CerrarCajaDto, Object, Object]),
    __metadata("design:returntype", void 0)
], CajaController.prototype, "cerrar", null);
__decorate([
    (0, common_1.Post)(':id/movimiento'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, movimiento_caja_dto_1.MovimientoCajaDto, Object]),
    __metadata("design:returntype", void 0)
], CajaController.prototype, "movimiento", null);
exports.CajaController = CajaController = __decorate([
    (0, swagger_1.ApiTags)('caja'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('caja'),
    __metadata("design:paramtypes", [caja_service_1.CajaService])
], CajaController);
//# sourceMappingURL=caja.controller.js.map