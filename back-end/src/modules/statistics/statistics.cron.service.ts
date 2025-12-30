import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StatisticsService } from './statistics.service';

@Injectable()
export class StatisticsCronService {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyRevenueFill() {
    try {
      await this.statisticsService.generateMissingDailyReports();
    } catch {}
  }
}
