import { IsEmail, IsEnum, IsString, IsUUID, MinLength } from 'class-validator';
import { RolUsuario } from '@prisma/client';

export class CreateUsuarioDto {
  @IsUUID()
  sucursalId: string;

  @IsString()
  nombres: string;

  @IsString()
  apellidos: string;

  @IsString()
  cedula: string;

  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(RolUsuario)
  rol: RolUsuario;
}
