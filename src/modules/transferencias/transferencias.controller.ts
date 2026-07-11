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
import { TransferenciasService } from './transferencias.service';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';
import { RecibirTransferenciaDto } from './dto/recibir-transferencia.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';

@ApiTags('transferencias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transferencias')
export class TransferenciasController {
  constructor(private transferenciasService: TransferenciasService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('sucursalId') sucursalId?: string,
  ) {
    const scope = user.rol === RolUsuario.ADMIN ? sucursalId : user.sucursalId;
    return this.transferenciasService.findAll(scope);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transferenciasService.findOne(id);
  }

  @Get(':id/pdf')
  async reportePdf(@Param('id') id: string, @Res() res: Response) {
    const pdf = await this.transferenciasService.reportePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="transferencia.pdf"',
    });
    res.send(pdf);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.ENCARGADO)
  @Post()
  create(
    @Body() dto: CreateTransferenciaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.transferenciasService.create(dto, user.sucursalId, user.id, req.ip);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.ENCARGADO)
  @Patch(':id/enviar')
  enviar(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.transferenciasService.enviar(id, user.id, req.ip);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.ENCARGADO)
  @Patch(':id/recibir')
  recibir(
    @Param('id') id: string,
    @Body() dto: RecibirTransferenciaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.transferenciasService.recibir(id, user.id, dto, req.ip);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.ENCARGADO)
  @Patch(':id/anular')
  anular(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.transferenciasService.anular(id, user.id, req.ip);
  }
}
