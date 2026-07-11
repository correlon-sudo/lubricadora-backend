import { IsOptional, IsString } from 'class-validator';

export class FindClientesQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}
