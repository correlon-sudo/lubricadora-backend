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
exports.InventarioController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const inventario_service_1 = require("./inventario.service");
const ajuste_inventario_dto_1 = require("./dto/ajuste-inventario.dto");
const find_movimientos_query_dto_1 = require("./dto/find-movimientos.query.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const sucursal_scope_guard_1 = require("../../common/guards/sucursal-scope.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let InventarioController = class InventarioController {
    constructor(inventarioService) {
        this.inventarioService = inventarioService;
    }
    ajustar(dto, user) {
        return this.inventarioService.ajustar(dto, user.id);
    }
    movimientos(query) {
        return this.inventarioService.movimientos(query);
    }
};
exports.InventarioController = InventarioController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.RolUsuario.ADMIN, client_1.RolUsuario.ENCARGADO),
    (0, common_1.Post)('ajuste'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ajuste_inventario_dto_1.AjusteInventarioDto, Object]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "ajustar", null);
__decorate([
    (0, common_1.Get)('movimientos'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_movimientos_query_dto_1.FindMovimientosQueryDto]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "movimientos", null);
exports.InventarioController = InventarioController = __decorate([
    (0, swagger_1.ApiTags)('inventario'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, sucursal_scope_guard_1.SucursalScopeGuard),
    (0, common_1.Controller)('inventario'),
    __metadata("design:paramtypes", [inventario_service_1.InventarioService])
], InventarioController);
//# sourceMappingURL=inventario.controller.js.map