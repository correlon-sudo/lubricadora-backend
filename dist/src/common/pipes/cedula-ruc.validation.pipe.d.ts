import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
export declare function esCedulaORucValido(valor: string): boolean;
export declare class CedulaRucValidationPipe implements PipeTransform {
    transform(value: string, _metadata: ArgumentMetadata): string;
}
