"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVehiculoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_vehiculo_dto_1 = require("./create-vehiculo.dto");
class UpdateVehiculoDto extends (0, swagger_1.PartialType)(create_vehiculo_dto_1.CreateVehiculoDto) {
}
exports.UpdateVehiculoDto = UpdateVehiculoDto;
//# sourceMappingURL=update-vehiculo.dto.js.map