import { Controller, Get, Param } from '@nestjs/common';
import { RatingService } from './rating.service';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Nhãn phim')
@Controller('ratings')
export class RatingController {
    constructor(private readonly ratingService: RatingService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách các nhãn phim' })
    @ApiResponse({ status: 200, description: 'Danh sách nhãn phim' })
    async getAllRatings() {
        return this.ratingService.getAllRatings();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết nhãn phim theo mã' })
    @ApiParam({ name: 'id', description: 'Mã nhãn phim', required: true })
    @ApiResponse({ status: 200, description: 'Chi tiết nhãn phim' })
    @ApiResponse({ status: 404, description: 'Nhãn phim không tồn tại' })
    async getById(@Param('id') id: string) {
        return this.ratingService.getRatingById(id);
    }
}
