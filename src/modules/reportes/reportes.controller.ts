import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolUsuario } from '@prisma/client';
import { ReportesService } from './reportes.service';
import { ReporteVentasQueryDto } from './dto/reporte-ventas.query.dto';
import { ProductosMasVendidosQueryDto } from './dto/productos-mas-vendidos.query.dto';
import { ConsolidadoQueryDto } from './dto/consolidado.query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';

@ApiTags('reportes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN, RolUsuario.ENCARGADO)
@Controller('reportes')
export class ReportesController {
  constructor(private reportesService: ReportesService) {}

  @Get('ventas')
  ventas(@Query() query: ReporteVentasQueryDto, @CurrentUser() user: AuthenticatedUser) {
    const sucursalId =
      user.rol === RolUsuario.ADMIN ? query.sucursalId : user.sucursalId;
    return this.reportesService.reporteVentas({ ...query, sucursalId });
  }

  @Get('productos-mas-vendidos')
  productosMasVendidos(
    @Query() query: ProductosMasVendidosQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const sucursalId =
      user.rol === RolUsuario.ADMIN ? query.sucursalId : user.sucursalId;
    return this.reportesService.productosMasVendidos({ ...query, sucursalId });
  }

  @Roles(RolUsuario.ADMIN)
  @Get('consolidado')
  consolidado(@Query() query: ConsolidadoQueryDto) {
    return this.reportesService.consolidado(query);
  }
}
