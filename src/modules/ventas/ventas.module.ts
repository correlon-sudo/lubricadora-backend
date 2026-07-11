import { Module } from '@nestjs/common';
import { VentasController } from './ventas.controller';
import { VentasService } from './ventas.service';
import { VentaCalculoService } from './venta-calculo.service';

@Module({
  controllers: [VentasController],
  providers: [VentasService, VentaCalculoService],
  exports: [VentasService, VentaCalculoService],
})
export class VentasModule {}
