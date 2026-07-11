import { CreateUsuarioDto } from './create-usuario.dto';
declare const UpdateUsuarioDto_base: import("@nestjs/common").Type<Partial<Omit<CreateUsuarioDto, "password">>>;
export declare class UpdateUsuarioDto extends UpdateUsuarioDto_base {
}
export {};
