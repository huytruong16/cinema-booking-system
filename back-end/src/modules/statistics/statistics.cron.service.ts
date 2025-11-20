import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StatisticsService } from './statistics.service';

@Injectable()
export class StatisticsCronService {
    private readonly logger = new Logger(StatisticsCronService.name);

    constructor(private readonly statisticsService: StatisticsService) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleUpdateShowtimeStatus() {
        try {
            await this.statisticsService.updateShowtimeStatuses();
        } catch (error) {

        }
    }
}
