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
import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('servicios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('servicios')
export class ServiciosController {
  constructor(private serviciosService: ServiciosService) {}

  @Get()
  findAll() {
    return this.serviciosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviciosService.findOne(id);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.ENCARGADO)
  @Post()
  create(@Body() dto: CreateServicioDto) {
    return this.serviciosService.create(dto);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.ENCARGADO)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServicioDto) {
    return this.serviciosService.update(id, dto);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.ENCARGADO)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviciosService.remove(id);
  }
}
