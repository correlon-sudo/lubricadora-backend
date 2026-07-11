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
exports.ReportesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const reportes_service_1 = require("./reportes.service");
const reporte_ventas_query_dto_1 = require("./dto/reporte-ventas.query.dto");
const productos_mas_vendidos_query_dto_1 = require("./dto/productos-mas-vendidos.query.dto");
const consolidado_query_dto_1 = require("./dto/consolidado.query.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ReportesController = class ReportesController {
    constructor(reportesService) {
        this.reportesService = reportesService;
    }
    ventas(query, user) {
        const sucursalId = user.rol === client_1.RolUsuario.ADMIN ? query.sucursalId : user.sucursalId;
        return this.reportesService.reporteVentas({ ...query, sucursalId });
    }
    productosMasVendidos(query, user) {
        const sucursalId = user.rol === client_1.RolUsuario.ADMIN ? query.sucursalId : user.sucursalId;
        return this.reportesService.productosMasVendidos({ ...query, sucursalId });
    }
    consolidado(query) {
        return this.reportesService.consolidado(query);
    }
};
exports.ReportesController = ReportesController;
__decorate([
    (0, common_1.Get)('ventas'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reporte_ventas_query_dto_1.ReporteVentasQueryDto, Object]),
    __metadata("design:returntype", void 0)
], ReportesController.prototype, "ventas", null);
__decorate([
    (0, common_1.Get)('productos-mas-vendidos'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [productos_mas_vendidos_query_dto_1.ProductosMasVendidosQueryDto, Object]),
    __metadata("design:returntype", void 0)
], ReportesController.prototype, "productosMasVendidos", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.RolUsuario.ADMIN),
    (0, common_1.Get)('consolidado'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [consolidado_query_dto_1.ConsolidadoQueryDto]),
    __metadata("design:returntype", void 0)
], ReportesController.prototype, "consolidado", null);
exports.ReportesController = ReportesController = __decorate([
    (0, swagger_1.ApiTags)('reportes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RolUsuario.ADMIN, client_1.RolUsuario.ENCARGADO),
    (0, common_1.Controller)('reportes'),
    __metadata("design:paramtypes", [reportes_service_1.ReportesService])
], ReportesController);
//# sourceMappingURL=reportes.controller.js.map