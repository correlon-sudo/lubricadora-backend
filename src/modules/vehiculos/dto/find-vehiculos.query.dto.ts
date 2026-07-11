import { IsOptional, IsString } from 'class-validator';

export class FindVehiculosQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}
