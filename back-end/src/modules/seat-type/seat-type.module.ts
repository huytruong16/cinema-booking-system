import { Module } from '@nestjs/common';
import { SeatTypeController } from './seat-type.controller';
import { SeatTypeService } from './seat-type.service';

@Module({
  controllers: [SeatTypeController],
  providers: [SeatTypeService],
})
export class SeatTypeModule {}
