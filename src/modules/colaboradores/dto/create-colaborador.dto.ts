import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { TipoSueldo } from '@prisma/client';

export class CreateColaboradorDto {
  @IsOptional()
  @IsUUID()
  usuarioId?: string;

  @IsString()
  nombres: string;

  @IsString()
  apellidos: string;

  @IsString()
  cedula: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsEnum(TipoSueldo)
  tipoSueldo: TipoSueldo;

  @IsNumber()
  @Min(0)
  montoSueldo: number;

  @IsDateString()
  fechaIngreso: string;
}
