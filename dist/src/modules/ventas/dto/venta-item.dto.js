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
exports.CreatePagoDto = exports.VentaItemDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class VentaItemDto {
}
exports.VentaItemDto = VentaItemDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.TipoItemVenta),
    __metadata("design:type", String)
], VentaItemDto.prototype, "tipoItem", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.tipoItem === 'PRODUCTO'),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], VentaItemDto.prototype, "productoId", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.tipoItem === 'SERVICIO'),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], VentaItemDto.prototype, "servicioId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], VentaItemDto.prototype, "cantidad", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], VentaItemDto.prototype, "descuento", void 0);
class CreatePagoDto {
}
exports.CreatePagoDto = CreatePagoDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.FormaPago),
    __metadata("design:type", String)
], CreatePagoDto.prototype, "formaPago", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreatePagoDto.prototype, "monto", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePagoDto.prototype, "referencia", void 0);
//# sourceMappingURL=venta-item.dto.js.map