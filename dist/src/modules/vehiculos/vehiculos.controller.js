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
exports.VehiculosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vehiculos_service_1 = require("./vehiculos.service");
const create_vehiculo_dto_1 = require("./dto/create-vehiculo.dto");
const update_vehiculo_dto_1 = require("./dto/update-vehiculo.dto");
const find_vehiculos_query_dto_1 = require("./dto/find-vehiculos.query.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let VehiculosController = class VehiculosController {
    constructor(vehiculosService) {
        this.vehiculosService = vehiculosService;
    }
    findByPlaca(placa) {
        return this.vehiculosService.findByPlaca(placa);
    }
    findAll(query) {
        return this.vehiculosService.findAll(query);
    }
    findOne(id) {
        return this.vehiculosService.findOne(id);
    }
    create(dto) {
        return this.vehiculosService.create(dto);
    }
    update(id, dto) {
        return this.vehiculosService.update(id, dto);
    }
    remove(id) {
        return this.vehiculosService.remove(id);
    }
};
exports.VehiculosController = VehiculosController;
__decorate([
    (0, common_1.Get)('placa/:placa'),
    __param(0, (0, common_1.Param)('placa')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiculosController.prototype, "findByPlaca", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_vehiculos_query_dto_1.FindVehiculosQueryDto]),
    __metadata("design:returntype", void 0)
], VehiculosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiculosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vehiculo_dto_1.CreateVehiculoDto]),
    __metadata("design:returntype", void 0)
], VehiculosController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vehiculo_dto_1.UpdateVehiculoDto]),
    __metadata("design:returntype", void 0)
], VehiculosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiculosController.prototype, "remove", null);
exports.VehiculosController = VehiculosController = __decorate([
    (0, swagger_1.ApiTags)('vehiculos'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('vehiculos'),
    __metadata("design:paramtypes", [vehiculos_service_1.VehiculosService])
], VehiculosController);
//# sourceMappingURL=vehiculos.controller.js.map