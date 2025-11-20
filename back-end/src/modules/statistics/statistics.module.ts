import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StatisticsCronService } from './statistics.cron.service';

@Module({
    imports: [PrismaModule, ScheduleModule.forRoot()],
    controllers: [StatisticsController],
    providers: [StatisticsService, StatisticsCronService],
    exports: [StatisticsService],
})
export class StatisticsModule { }
