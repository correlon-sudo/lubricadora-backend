import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolUsuario } from '@prisma/client';
import { AuditoriaService } from './auditoria.service';
import { FindAuditoriaQueryDto } from './dto/find-auditoria.query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('auditoria')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN)
@Controller('auditoria')
export class AuditoriaController {
  constructor(private auditoriaService: AuditoriaService) {}

  @Get()
  findAll(@Query() query: FindAuditoriaQueryDto) {
    return this.auditoriaService.findAll(query);
  }
}
