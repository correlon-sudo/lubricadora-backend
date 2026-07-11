import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolUsuario } from '@prisma/client';
import { CotizacionesService } from './cotizaciones.service';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { ConvertirCotizacionDto } from './dto/convertir-cotizacion.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';

@ApiTags('cotizaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cotizaciones')
export class CotizacionesController {
  constructor(private cotizacionesService: CotizacionesService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('sucursalId') sucursalId?: string,
  ) {
    const scopeSucursal = user.rol === RolUsuario.ADMIN ? sucursalId : user.sucursalId;
    return this.cotizacionesService.findAll(scopeSucursal);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cotizacionesService.findOne(id);
  }

  @Get(':id/pdf')
  async reportePdf(@Param('id') id: string, @Res() res: Response) {
    const pdf = await this.cotizacionesService.reportePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="cotizacion.pdf"',
    });
    res.send(pdf);
  }

  @Post()
  create(@Body() dto: CreateCotizacionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cotizacionesService.create(dto, user.sucursalId, user.id);
  }

  @Post(':id/convertir')
  convertir(
    @Param('id') id: string,
    @Body() dto: ConvertirCotizacionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cotizacionesService.convertir(id, dto, user.id);
  }
}
