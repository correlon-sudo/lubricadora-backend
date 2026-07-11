import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolUsuario } from '@prisma/client';
import { CloudinaryService } from '../../config/cloudinary.service';
import { ColaboradoresService } from './colaboradores.service';
import { CreateColaboradorDto } from './dto/create-colaborador.dto';
import { UpdateColaboradorDto } from './dto/update-colaborador.dto';
import { CreateAdelantoDto } from './dto/create-adelanto.dto';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { FindNominaQueryDto } from './dto/find-nomina.query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';

@ApiTags('colaboradores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN, RolUsuario.ENCARGADO)
@Controller('colaboradores')
export class ColaboradoresController {
  constructor(
    private colaboradoresService: ColaboradoresService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Patch('nomina/:nominaId/pagar')
  marcarNominaPagada(@Param('nominaId') nominaId: string) {
    return this.colaboradoresService.marcarNominaPagada(nominaId);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('sucursalId') sucursalId?: string,
  ) {
    const scope = user.rol === RolUsuario.ADMIN ? sucursalId : user.sucursalId;
    return this.colaboradoresService.findAll(scope);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.colaboradoresService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateColaboradorDto, @CurrentUser() user: AuthenticatedUser) {
    return this.colaboradoresService.create(dto, user.sucursalId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateColaboradorDto) {
    return this.colaboradoresService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.colaboradoresService.remove(id);
  }

  @Post(':id/foto')
  @UseInterceptors(
    FileInterceptor('foto', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(new Error('Solo se permiten archivos de imagen'), false);
        }
        callback(null, true);
      },
    }),
  )
  async subirFoto(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    const url = await this.cloudinaryService.uploadImage(file.buffer, 'colaboradores');
    return this.colaboradoresService.actualizarFoto(id, url);
  }

  @Post(':id/adelantos')
  crearAdelanto(
    @Param('id') id: string,
    @Body() dto: CreateAdelantoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.colaboradoresService.crearAdelanto(id, dto, user.id);
  }

  @Get(':id/adelantos')
  findAdelantos(@Param('id') id: string) {
    return this.colaboradoresService.findAdelantos(id);
  }

  @Post(':id/asistencias')
  crearAsistencia(@Param('id') id: string, @Body() dto: CreateAsistenciaDto) {
    return this.colaboradoresService.crearAsistencia(id, dto);
  }

  @Get(':id/asistencias')
  findAsistencias(@Param('id') id: string) {
    return this.colaboradoresService.findAsistencias(id);
  }

  @Get(':id/nomina')
  nomina(@Param('id') id: string, @Query() query: FindNominaQueryDto) {
    return this.colaboradoresService.nomina(id, query);
  }
}
