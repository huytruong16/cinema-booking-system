import { Controller, Get, Param, Query, BadRequestException, Post, Body } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { SeatService } from './seat.service';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiQuery,
} from '@nestjs/swagger';
import { GetSeatsDto } from './dtos/get-seat.dto';
import { SeatCheckRequestDto } from './dtos/post-check-available.dto';

@ApiTags('Ghế')
@Controller('seats')
export class SeatController {
    constructor(private readonly seatService: SeatService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách các ghế được chia theo loại ghế' })
    @ApiQuery({ name: 'MaLoaiGhe', required: false, description: 'Mã loại ghế để lọc (tùy chọn)' })
    @ApiResponse({ status: 200 })
    async getAllSeats(@Query() query: GetSeatsDto) {
        return this.seatService.getAllSeats(query);
    }

    @Get('/base')
    @ApiOperation({ summary: 'Lấy danh sách các ghế chưa chia theo loại ghế (gốc)' })
    @ApiResponse({ status: 200 })
    async getAllBaseSeats() {
        return this.seatService.getAllBaseSeats();
    }

    @Get('/base/:id')
    @ApiOperation({ summary: 'Lấy chi tiết ghế chưa chia theo loại ghế (gốc)' })
    @ApiParam({ name: 'id', description: 'Mã ghế', required: true })
    @ApiResponse({ status: 200 })
    @ApiResponse({ status: 404, description: 'Ghế không tồn tại' })
    async getBaseSeatById(@Param('id') id: string) {
        if (!isUUID(id, '4')) throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
        return this.seatService.getBaseSeatById(id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết ghế đã được chia theo loại ghế' })
    @ApiParam({ name: 'id', description: 'Mã ghế - loại ghế', required: true })
    @ApiResponse({ status: 200 })
    @ApiResponse({ status: 404, description: 'Ghế - loại ghế không tồn tại' })
    async getById(@Param('id') id: string) {
        if (!isUUID(id, '4')) throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
        return this.seatService.getSeatById(id);
    }

    @Get(':id/check-available')
    @ApiOperation({ summary: 'Kiểm tra ghế phòng chiếu có còn trống không, giữ ghế', description: 'Được gọi khi khách hàng nhấn chọn vào 1 ghế trong suất chiếu để đặt vé' })
    @ApiParam({ name: 'id', description: 'Mã ghế suất chiếu', required: true })
    @ApiResponse({ status: 200 })
    async checkAvailableSeats(@Param('id') id: string) {
        if (!isUUID(id, '4')) throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
        return this.seatService.checkAvailableSeats(id);
    }
}
