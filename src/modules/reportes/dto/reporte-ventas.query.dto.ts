import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class ReporteVentasQueryDto {
  @IsDateString()
  desde: string;

  @IsDateString()
  hasta: string;

  @IsOptional()
  @IsUUID()
  sucursalId?: string;

  @IsOptional()
  @IsUUID()
  usuarioId?: string;
}
