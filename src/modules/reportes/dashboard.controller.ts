import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolUsuario } from '@prisma/client';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private reportesService: ReportesService) {}

  @Get('resumen')
  resumen(
    @CurrentUser() user: AuthenticatedUser,
    @Query('sucursalId') sucursalId?: string,
  ) {
    const scope = user.rol === RolUsuario.ADMIN && sucursalId ? sucursalId : user.sucursalId;
    return this.reportesService.dashboardResumen(scope);
  }
}
