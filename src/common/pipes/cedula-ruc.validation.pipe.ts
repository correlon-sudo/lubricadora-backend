import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

/**
 * Valida cédula (10 dígitos, módulo 10) o RUC (13 dígitos) ecuatorianos.
 * RUC natural: cédula válida + sufijo "001".
 * RUC jurídico (tercer dígito 9) y público (tercer dígito 6): módulo 11.
 */
function validarCedula(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false;
  const provincia = parseInt(cedula.substring(0, 2), 10);
  const tercerDigito = parseInt(cedula[2], 10);
  if (provincia < 1 || provincia > 24) return false;
  if (tercerDigito > 5) return false;

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const suma = coeficientes.reduce((acc, coef, i) => {
    let valor = parseInt(cedula[i], 10) * coef;
    if (valor > 9) valor -= 9;
    return acc + valor;
  }, 0);

  const verificador = (10 - (suma % 10)) % 10;
  return verificador === parseInt(cedula[9], 10);
}

function validarRucJuridicoOPublico(ruc: string, coeficientes: number[]): boolean {
  const suma = coeficientes.reduce(
    (acc, coef, i) => acc + parseInt(ruc[i], 10) * coef,
    0,
  );
  const modulo = suma % 11;
  const verificador = modulo === 0 ? 0 : 11 - modulo;
  const posicionVerificador = coeficientes.length;
  return verificador === parseInt(ruc[posicionVerificador], 10);
}

export function esCedulaORucValido(valor: string): boolean {
  if (!valor) return false;

  if (valor.length === 10) {
    return validarCedula(valor);
  }

  if (valor.length === 13) {
    if (!/^\d{13}$/.test(valor)) return false;
    const tercerDigito = parseInt(valor[2], 10);

    if (tercerDigito === 9) {
      // jurídico: 9 dígitos base + verificador en posición 9
      return validarRucJuridicoOPublico(valor, [4, 3, 2, 7, 6, 5, 4, 3, 2]);
    }

    if (tercerDigito === 6) {
      // público: 8 dígitos base + verificador en posición 8
      return validarRucJuridicoOPublico(valor, [3, 2, 7, 6, 5, 4, 3, 2]);
    }

    // natural: cédula válida + sufijo de establecimiento (>= 001)
    if (!validarCedula(valor.substring(0, 10))) return false;
    return parseInt(valor.substring(10), 10) >= 1;
  }

  return false;
}

@Injectable()
export class CedulaRucValidationPipe implements PipeTransform {
  transform(value: string, _metadata: ArgumentMetadata) {
    if (!esCedulaORucValido(value)) {
      throw new BadRequestException(
        `"${value}" no es una cédula ni un RUC ecuatoriano válido`,
      );
    }
    return value;
  }
}
