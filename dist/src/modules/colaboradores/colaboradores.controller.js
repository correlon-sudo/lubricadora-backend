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
exports.ColaboradoresController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const colaboradores_service_1 = require("./colaboradores.service");
const create_colaborador_dto_1 = require("./dto/create-colaborador.dto");
const update_colaborador_dto_1 = require("./dto/update-colaborador.dto");
const create_adelanto_dto_1 = require("./dto/create-adelanto.dto");
const create_asistencia_dto_1 = require("./dto/create-asistencia.dto");
const find_nomina_query_dto_1 = require("./dto/find-nomina.query.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ColaboradoresController = class ColaboradoresController {
    constructor(colaboradoresService) {
        this.colaboradoresService = colaboradoresService;
    }
    marcarNominaPagada(nominaId) {
        return this.colaboradoresService.marcarNominaPagada(nominaId);
    }
    findAll(user, sucursalId) {
        const scope = user.rol === client_1.RolUsuario.ADMIN ? sucursalId : user.sucursalId;
        return this.colaboradoresService.findAll(scope);
    }
    findOne(id) {
        return this.colaboradoresService.findOne(id);
    }
    create(dto, user) {
        return this.colaboradoresService.create(dto, user.sucursalId);
    }
    update(id, dto) {
        return this.colaboradoresService.update(id, dto);
    }
    remove(id) {
        return this.colaboradoresService.remove(id);
    }
    subirFoto(id, file) {
        return this.colaboradoresService.actualizarFoto(id, `/uploads/colaboradores/${file.filename}`);
    }
    crearAdelanto(id, dto, user) {
        return this.colaboradoresService.crearAdelanto(id, dto, user.id);
    }
    findAdelantos(id) {
        return this.colaboradoresService.findAdelantos(id);
    }
    crearAsistencia(id, dto) {
        return this.colaboradoresService.crearAsistencia(id, dto);
    }
    findAsistencias(id) {
        return this.colaboradoresService.findAsistencias(id);
    }
    nomina(id, query) {
        return this.colaboradoresService.nomina(id, query);
    }
};
exports.ColaboradoresController = ColaboradoresController;
__decorate([
    (0, common_1.Patch)('nomina/:nominaId/pagar'),
    __param(0, (0, common_1.Param)('nominaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ColaboradoresController.prototype, "marcarNominaPagada", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('sucursalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ColaboradoresController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ColaboradoresController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_colaborador_dto_1.CreateColaboradorDto, Object]),
    __metadata("design:returntype", void 0)
], ColaboradoresController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_colaborador_dto_1.UpdateColaboradorDto]),
    __metadata("design:returntype", void 0)
], ColaboradoresController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ColaboradoresController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/foto'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('foto', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/colaboradores',
            filename: (_req, file, callback) => {
                const nombreUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}${(0, path_1.extname)(file.originalname)}`;
                callback(null, nombreUnico);
            },
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (_req, file, callback) => {
            if (!file.mimetype.startsWith('image/')) {
                return callback(new Error('Solo se permiten archivos de imagen'), false);
            }
            callback(null, true);
        },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ColaboradoresController.prototype, "subirFoto", null);
__decorate([
    (0, common_1.Post)(':id/adelantos'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_adelanto_dto_1.CreateAdelantoDto, Object]),
    __metadata("design:returntype", void 0)
], ColaboradoresController.prototype, "crearAdelanto", null);
__decorate([
    (0, common_1.Get)(':id/adelantos'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ColaboradoresController.prototype, "findAdelantos", null);
__decorate([
    (0, common_1.Post)(':id/asistencias'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_asistencia_dto_1.CreateAsistenciaDto]),
    __metadata("design:returntype", void 0)
], ColaboradoresController.prototype, "crearAsistencia", null);
__decorate([
    (0, common_1.Get)(':id/asistencias'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ColaboradoresController.prototype, "findAsistencias", null);
__decorate([
    (0, common_1.Get)(':id/nomina'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, find_nomina_query_dto_1.FindNominaQueryDto]),
    __metadata("design:returntype", void 0)
], ColaboradoresController.prototype, "nomina", null);
exports.ColaboradoresController = ColaboradoresController = __decorate([
    (0, swagger_1.ApiTags)('colaboradores'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RolUsuario.ADMIN, client_1.RolUsuario.ENCARGADO),
    (0, common_1.Controller)('colaboradores'),
    __metadata("design:paramtypes", [colaboradores_service_1.ColaboradoresService])
], ColaboradoresController);
//# sourceMappingURL=colaboradores.controller.js.map