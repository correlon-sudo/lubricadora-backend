import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TipoIdentificacion } from '@prisma/client';

export class CreateClienteDto {
  @IsEnum(TipoIdentificacion)
  tipoIdentificacion: TipoIdentificacion;

  @IsString()
  @IsNotEmpty()
  identificacion: string;

  @IsString()
  nombres: string;

  @IsOptional()
  @IsString()
  apellidos?: string;

  @IsOptional()
  @IsString()
  razonSocial?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;
}
