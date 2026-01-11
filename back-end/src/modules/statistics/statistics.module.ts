import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { StatisticsController } from './statistics.controller';
import {
  StatisticsExportService,
  StatisticsPdfService,
  StatisticsService,
} from './statistics.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StatisticsCronService } from './statistics.cron.service';
import { PdfService } from '../pdf/pdf.service';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [StatisticsController],
  providers: [
    StatisticsService,
    StatisticsCronService,
    StatisticsExportService,
    StatisticsPdfService,
    PdfService,
  ],
  exports: [StatisticsService],
})
export class StatisticsModule {}
