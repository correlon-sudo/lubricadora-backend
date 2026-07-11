import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class FindAuditoriaQueryDto extends PaginationDto {
    entidad?: string;
    usuarioId?: string;
    desde?: string;
    hasta?: string;
}
