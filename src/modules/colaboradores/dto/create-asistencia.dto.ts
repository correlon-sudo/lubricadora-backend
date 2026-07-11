import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoAsistencia } from '@prisma/client';

export class CreateAsistenciaDto {
  @IsDateString()
  fecha: string;

  @IsEnum(EstadoAsistencia)
  estado: EstadoAsistencia;

  @IsOptional()
  @IsString()
  observacion?: string;
}
