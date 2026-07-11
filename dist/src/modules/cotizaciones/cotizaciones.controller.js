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
exports.CotizacionesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const cotizaciones_service_1 = require("./cotizaciones.service");
const create_cotizacion_dto_1 = require("./dto/create-cotizacion.dto");
const convertir_cotizacion_dto_1 = require("./dto/convertir-cotizacion.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let CotizacionesController = class CotizacionesController {
    constructor(cotizacionesService) {
        this.cotizacionesService = cotizacionesService;
    }
    findAll(user, sucursalId) {
        const scopeSucursal = user.rol === client_1.RolUsuario.ADMIN ? sucursalId : user.sucursalId;
        return this.cotizacionesService.findAll(scopeSucursal);
    }
    findOne(id) {
        return this.cotizacionesService.findOne(id);
    }
    async reportePdf(id, res) {
        const pdf = await this.cotizacionesService.reportePdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename="cotizacion.pdf"',
        });
        res.send(pdf);
    }
    create(dto, user) {
        return this.cotizacionesService.create(dto, user.sucursalId, user.id);
    }
    convertir(id, dto, user) {
        return this.cotizacionesService.convertir(id, dto, user.id);
    }
};
exports.CotizacionesController = CotizacionesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('sucursalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CotizacionesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CotizacionesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CotizacionesController.prototype, "reportePdf", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_cotizacion_dto_1.CreateCotizacionDto, Object]),
    __metadata("design:returntype", void 0)
], CotizacionesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/convertir'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, convertir_cotizacion_dto_1.ConvertirCotizacionDto, Object]),
    __metadata("design:returntype", void 0)
], CotizacionesController.prototype, "convertir", null);
exports.CotizacionesController = CotizacionesController = __decorate([
    (0, swagger_1.ApiTags)('cotizaciones'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('cotizaciones'),
    __metadata("design:paramtypes", [cotizaciones_service_1.CotizacionesService])
], CotizacionesController);
//# sourceMappingURL=cotizaciones.controller.js.map