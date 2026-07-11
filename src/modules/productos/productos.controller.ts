import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolUsuario } from '@prisma/client';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { FindProductosQueryDto } from './dto/find-productos.query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';

@ApiTags('productos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('productos')
export class ProductosController {
  constructor(private productosService: ProductosService) {}

  @Get('stock-bajo')
  stockBajo() {
    return this.productosService.stockBajo();
  }

  // @Res() sin passthrough: desactiva el manejo automático de respuesta de
  // Nest para esta ruta, así el TransformInterceptor global no envuelve el
  // PDF binario en el envelope {success,data} (que lo corrompería).
  @Get('reporte/pdf')
  async reportePdf(
    @Query() query: FindProductosQueryDto,
    @Res() res: Response,
  ) {
    const pdf = await this.productosService.reportePdf(query);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="inventario.pdf"',
    });
    res.send(pdf);
  }

  @Get()
  findAll(
    @Query() query: FindProductosQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.productosService.findAll(query, user.rol);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.productosService.findOne(id, user.rol);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.ENCARGADO)
  @Post()
  create(@Body() dto: CreateProductoDto) {
    return this.productosService.create(dto);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.ENCARGADO)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductoDto) {
    return this.productosService.update(id, dto);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.ENCARGADO)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosService.remove(id);
  }
}
