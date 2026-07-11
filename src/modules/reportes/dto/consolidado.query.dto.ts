import { IsDateString } from 'class-validator';

export class ConsolidadoQueryDto {
  @IsDateString()
  desde: string;

  @IsDateString()
  hasta: string;
}
