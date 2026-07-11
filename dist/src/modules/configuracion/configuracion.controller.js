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
exports.ConfiguracionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const configuracion_service_1 = require("./configuracion.service");
const update_configuracion_dto_1 = require("./dto/update-configuracion.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let ConfiguracionController = class ConfiguracionController {
    constructor(configuracionService) {
        this.configuracionService = configuracionService;
    }
    get() {
        return this.configuracionService.get();
    }
    update(dto) {
        return this.configuracionService.update(dto);
    }
};
exports.ConfiguracionController = ConfiguracionController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConfiguracionController.prototype, "get", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.RolUsuario.ADMIN),
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_configuracion_dto_1.UpdateConfiguracionDto]),
    __metadata("design:returntype", void 0)
], ConfiguracionController.prototype, "update", null);
exports.ConfiguracionController = ConfiguracionController = __decorate([
    (0, swagger_1.ApiTags)('configuracion'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('configuracion'),
    __metadata("design:paramtypes", [configuracion_service_1.ConfiguracionService])
], ConfiguracionController);
//# sourceMappingURL=configuracion.controller.js.map