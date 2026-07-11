import { IsDateString } from 'class-validator';

export class FindNominaQueryDto {
  @IsDateString()
  periodoInicio: string;

  @IsDateString()
  periodoFin: string;
}
