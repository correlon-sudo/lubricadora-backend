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
import { CajaService } from './caja.service';
import { AbrirCajaDto } from './dto/abrir-caja.dto';
import { CerrarCajaDto } from './dto/cerrar-caja.dto';
import { MovimientoCajaDto } from './dto/movimiento-caja.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';

@ApiTags('caja')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('caja')
export class CajaController {
  constructor(private cajaService: CajaService) {}

  @Post('abrir')
  abrir(
    @Body() dto: AbrirCajaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.cajaService.abrir(user.sucursalId, user.id, dto, req.ip);
  }

  @Get('actual')
  actual(@CurrentUser() user: AuthenticatedUser) {
    return this.cajaService.actual(user.sucursalId);
  }

  @Get('historial')
  historial(
    @CurrentUser() user: AuthenticatedUser,
    @Query('sucursalId') sucursalId?: string,
  ) {
    const scope = user.rol === RolUsuario.ADMIN ? sucursalId : user.sucursalId;
    return this.cajaService.historial(scope);
  }

  @Get(':id/reporte-diario')
  reporteDiario(@Param('id') id: string) {
    return this.cajaService.reporteDiario(id);
  }

  @Get(':id/pdf')
  async reportePdf(@Param('id') id: string, @Res() res: Response) {
    const pdf = await this.cajaService.reportePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="cierre-caja.pdf"',
    });
    res.send(pdf);
  }

  @Patch(':id/cerrar')
  cerrar(
    @Param('id') id: string,
    @Body() dto: CerrarCajaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.cajaService.cerrar(id, user.id, dto, req.ip);
  }

  @Post(':id/movimiento')
  movimiento(
    @Param('id') id: string,
    @Body() dto: MovimientoCajaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.cajaService.movimiento(id, user.id, dto, req.ip);
  }
}
