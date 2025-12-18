import { Controller, Get, Param, NotFoundException, BadRequestException, Post, Body } from '@nestjs/common';
import { ScreeningRoomService } from './screening-room.service';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { CreateScreeningRoomDto } from './dtos/create-screening-room.dto';

@ApiTags('Phòng chiếu')
@Controller('screening-rooms')
export class ScreeningRoomController {
    constructor(private readonly screeningRoomService: ScreeningRoomService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách các phòng chiếu' })
    async getAllScreeningRooms() {
        return this.screeningRoomService.getAllScreeningRooms();
    }

    @Post()
    @ApiOperation({ summary: 'Tạo phòng chiếu mới' })
    async createScreeningRoom(@Body() createScreeningRoomDto: CreateScreeningRoomDto) {
        return this.screeningRoomService.createScreeningRoom(createScreeningRoomDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết phòng chiếu theo mã' })
    @ApiParam({ name: 'id', description: 'Mã phòng chiếu', required: true })
    async getScreeningRoomById(@Param('id') id: string) {
        if (!isUUID(id, '4')) throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
        const room = await this.screeningRoomService.getScreeningRoomById(id);
        if (!room) throw new NotFoundException('Phòng chiếu không tồn tại');
        return room;
    }
}
