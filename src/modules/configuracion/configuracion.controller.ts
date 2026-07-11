import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolUsuario } from '@prisma/client';
import { ConfiguracionService } from './configuracion.service';
import { UpdateConfiguracionDto } from './dto/update-configuracion.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('configuracion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('configuracion')
export class ConfiguracionController {
  constructor(private configuracionService: ConfiguracionService) {}

  @Get()
  get() {
    return this.configuracionService.get();
  }

  @Roles(RolUsuario.ADMIN)
  @Patch()
  update(@Body() dto: UpdateConfiguracionDto) {
    return this.configuracionService.update(dto);
  }
}
