"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CedulaRucValidationPipe = void 0;
exports.esCedulaORucValido = esCedulaORucValido;
const common_1 = require("@nestjs/common");
function validarCedula(cedula) {
    if (!/^\d{10}$/.test(cedula))
        return false;
    const provincia = parseInt(cedula.substring(0, 2), 10);
    const tercerDigito = parseInt(cedula[2], 10);
    if (provincia < 1 || provincia > 24)
        return false;
    if (tercerDigito > 5)
        return false;
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    const suma = coeficientes.reduce((acc, coef, i) => {
        let valor = parseInt(cedula[i], 10) * coef;
        if (valor > 9)
            valor -= 9;
        return acc + valor;
    }, 0);
    const verificador = (10 - (suma % 10)) % 10;
    return verificador === parseInt(cedula[9], 10);
}
function validarRucJuridicoOPublico(ruc, coeficientes) {
    const suma = coeficientes.reduce((acc, coef, i) => acc + parseInt(ruc[i], 10) * coef, 0);
    const modulo = suma % 11;
    const verificador = modulo === 0 ? 0 : 11 - modulo;
    const posicionVerificador = coeficientes.length;
    return verificador === parseInt(ruc[posicionVerificador], 10);
}
function esCedulaORucValido(valor) {
    if (!valor)
        return false;
    if (valor.length === 10) {
        return validarCedula(valor);
    }
    if (valor.length === 13) {
        if (!/^\d{13}$/.test(valor))
            return false;
        const tercerDigito = parseInt(valor[2], 10);
        if (tercerDigito === 9) {
            return validarRucJuridicoOPublico(valor, [4, 3, 2, 7, 6, 5, 4, 3, 2]);
        }
        if (tercerDigito === 6) {
            return validarRucJuridicoOPublico(valor, [3, 2, 7, 6, 5, 4, 3, 2]);
        }
        if (!validarCedula(valor.substring(0, 10)))
            return false;
        return parseInt(valor.substring(10), 10) >= 1;
    }
    return false;
}
let CedulaRucValidationPipe = class CedulaRucValidationPipe {
    transform(value, _metadata) {
        if (!esCedulaORucValido(value)) {
            throw new common_1.BadRequestException(`"${value}" no es una cédula ni un RUC ecuatoriano válido`);
        }
        return value;
    }
};
exports.CedulaRucValidationPipe = CedulaRucValidationPipe;
exports.CedulaRucValidationPipe = CedulaRucValidationPipe = __decorate([
    (0, common_1.Injectable)()
], CedulaRucValidationPipe);
//# sourceMappingURL=cedula-ruc.validation.pipe.js.map