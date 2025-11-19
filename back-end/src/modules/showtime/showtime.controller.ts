import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ShowtimeService } from './showtime.service';
import { GetShowtimeDto } from './dtos/get-showtime.dto';
import { ShowtimeStatusEnum } from '../../libs/common/enums/showtime-status.enum';

@ApiTags('Suất chiếu')
@Controller('showtimes')
export class ShowtimeController {
    constructor(private readonly showtimeService: ShowtimeService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách suất chiếu với bộ lọc' })
    @ApiQuery({ name: 'MaPhim', required: false, description: 'Lọc theo mã phim' })
    @ApiQuery({ name: 'MaPhongChieu', required: false, description: 'Lọc theo mã phòng chiếu' })
    @ApiQuery({ name: 'MaPhienBanPhim', required: false, description: 'Lọc theo mã phiên bản phim' })
    @ApiQuery({ name: 'MaDinhDang', required: false, description: 'Lọc theo mã định dạng' })
    @ApiQuery({ name: 'MaTheLoai', required: false, description: 'Lọc theo mã thể loại' })
    @ApiQuery({ name: 'TrangThai', required: false, enum: ShowtimeStatusEnum, description: 'Lọc theo trạng thái' })
    @ApiQuery({ name: 'TuNgay', required: false, description: 'Lọc từ ngày (ISO 8601)' })
    @ApiQuery({ name: 'DenNgay', required: false, description: 'Lọc đến ngày (ISO 8601)' })
    @ApiResponse({ status: 200 })
    async getShowtimes(@Query() filters: GetShowtimeDto) {
        return this.showtimeService.getShowtimes(filters);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết suất chiếu theo mã' })
    @ApiParam({ name: 'id', description: 'Mã suất chiếu', required: true })
    @ApiResponse({ status: 200 })
    @ApiResponse({ status: 404, description: 'Suất chiếu không tồn tại' })
    async getShowtimeById(@Param('id') id: string) {
        return this.showtimeService.getShowtimeById(id);
    }
}
