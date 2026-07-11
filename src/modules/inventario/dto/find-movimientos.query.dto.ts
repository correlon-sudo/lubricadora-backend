import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TipoMovimientoInventario } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FindMovimientosQueryDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  productoId?: string;

  @IsOptional()
  @IsUUID()
  sucursalId?: string;

  @IsOptional()
  @IsEnum(TipoMovimientoInventario)
  tipo?: TipoMovimientoInventario;

  @IsOptional()
  @IsDateString()
  desde?: string;

  @IsOptional()
  @IsDateString()
  hasta?: string;
}
