import { Module } from '@nestjs/common';
import { ShowtimeController } from './showtime.controller';
import { ShowtimeService } from './showtime.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ShowtimeController],
    providers: [ShowtimeService],
    exports: [ShowtimeService]
})
export class ShowtimeModule { }
