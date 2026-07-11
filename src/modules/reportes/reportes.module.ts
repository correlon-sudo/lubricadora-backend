import { Module } from '@nestjs/common';
import { ReportesController } from './reportes.controller';
import { DashboardController } from './dashboard.controller';
import { ReportesService } from './reportes.service';

@Module({
  controllers: [ReportesController, DashboardController],
  providers: [ReportesService],
})
export class ReportesModule {}
