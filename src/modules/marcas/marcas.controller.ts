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
import { MarcasService } from './marcas.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('marcas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('marcas')
export class MarcasController {
  constructor(private marcasService: MarcasService) {}

  @Get()
  findAll() {
    return this.marcasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marcasService.findOne(id);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.ENCARGADO)
  @Post()
  create(@Body() dto: CreateMarcaDto) {
    return this.marcasService.create(dto);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.ENCARGADO)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMarcaDto) {
    return this.marcasService.update(id, dto);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.ENCARGADO)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marcasService.remove(id);
  }
}
