import { Module } from '@nestjs/common';
import { ShowtimeController } from './showtime.controller';
import { ShowtimeService } from './showtime.service';
import { ShowtimeCronService } from './showtime.cron.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [ShowtimeController],
  providers: [ShowtimeService, ShowtimeCronService],
  exports: [ShowtimeService],
})
export class ShowtimeModule {}
