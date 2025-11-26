import { Controller, Get, Param } from '@nestjs/common';
import { SeatTypeService } from './seat-type.service';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Loại ghế')
@Controller('seat-types')
export class SeatTypeController {
    constructor(private readonly seatTypeService: SeatTypeService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách các loại ghế' })
    @ApiResponse({ status: 200, description: 'Danh sách loại ghế' })
    async getAllSeatTypes() {
        return this.seatTypeService.getAllSeatTypes();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết loại ghế theo mã' })
    @ApiParam({ name: 'id', description: 'Mã loại ghế', required: true })
    @ApiResponse({ status: 200, description: 'Chi tiết loại ghế' })
    @ApiResponse({ status: 404, description: 'Loại ghế không tồn tại' })
    async getById(@Param('id') id: string) {
        return this.seatTypeService.getSeatTypeById(id);
    }
}
