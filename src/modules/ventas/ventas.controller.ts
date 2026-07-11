import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolUsuario } from '@prisma/client';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';

@ApiTags('ventas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ventas')
export class VentasController {
  constructor(private ventasService: VentasService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('sucursalId') sucursalId?: string,
  ) {
    const scopeSucursal = user.rol === RolUsuario.ADMIN ? sucursalId : user.sucursalId;
    return this.ventasService.findAll(scopeSucursal);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ventasService.findOne(id);
  }

  @Get(':id/pdf')
  async reportePdf(@Param('id') id: string, @Res() res: Response) {
    const pdf = await this.ventasService.reportePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="venta.pdf"',
    });
    res.send(pdf);
  }

  @Post()
  create(
    @Body() dto: CreateVentaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.ventasService.create(dto, user.sucursalId, user.id, req.ip);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.ENCARGADO)
  @Patch(':id/anular')
  anular(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.ventasService.anular(id, user.id, req.ip);
  }
}
