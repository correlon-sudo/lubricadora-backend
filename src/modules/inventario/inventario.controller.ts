import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolUsuario } from '@prisma/client';
import { InventarioService } from './inventario.service';
import { AjusteInventarioDto } from './dto/ajuste-inventario.dto';
import { FindMovimientosQueryDto } from './dto/find-movimientos.query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SucursalScopeGuard } from '../../common/guards/sucursal-scope.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';

@ApiTags('inventario')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SucursalScopeGuard)
@Controller('inventario')
export class InventarioController {
  constructor(private inventarioService: InventarioService) {}

  @Roles(RolUsuario.ADMIN, RolUsuario.ENCARGADO)
  @Post('ajuste')
  ajustar(
    @Body() dto: AjusteInventarioDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.inventarioService.ajustar(dto, user.id);
  }

  @Get('movimientos')
  movimientos(@Query() query: FindMovimientosQueryDto) {
    return this.inventarioService.movimientos(query);
  }
}
