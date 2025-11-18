import { Module } from '@nestjs/common';
import { ScreeningRoomController } from './screening-room.controller';
import { ScreeningRoomService } from './screening-room.service';

@Module({
    controllers: [ScreeningRoomController],
    providers: [ScreeningRoomService]
})
export class ScreeningRoomModule { }
