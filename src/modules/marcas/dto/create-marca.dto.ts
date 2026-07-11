import { IsString } from 'class-validator';

export class CreateMarcaDto {
  @IsString()
  nombre: string;
}
