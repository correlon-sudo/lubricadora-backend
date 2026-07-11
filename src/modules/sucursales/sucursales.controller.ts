import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolUsuario } from '@prisma/client';
import { SucursalesService } from './sucursales.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('sucursales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sucursales')
export class SucursalesController {
  constructor(private sucursalesService: SucursalesService) {}

  @Get()
  findAll() {
    return this.sucursalesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sucursalesService.findOne(id);
  }

  @Roles(RolUsuario.ADMIN)
  @Post()
  create(@Body() dto: CreateSucursalDto) {
    return this.sucursalesService.create(dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSucursalDto) {
    return this.sucursalesService.update(id, dto);
  }

  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sucursalesService.remove(id);
  }
}
