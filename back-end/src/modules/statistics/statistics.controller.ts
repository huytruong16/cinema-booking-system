import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { RoomStatusDto } from './dtos/room-status.dto';
import { SummaryDto } from './dtos/summary.dto';
import { GetSummaryQueryDto, SummaryModeEnum } from './dtos/get-summary-query.dto';

@ApiTags('Thống kê')
@Controller('statistics')
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) { }

    @Get('room-status')
    @ApiOperation({
        summary: 'Lấy trạng thái tất cả phòng chiếu',
        description:
            'Trả về thông tin trạng thái mỗi phòng chiếu: đang chiếu, sắp chiếu hoặc trống. ' +
            'Nếu đang chiếu, hiển thị số ghế đã đặt và tổng ghế. ' +
            'Nếu sắp chiếu (< 30 phút), hiển thị thời gian còn lại.',
    })
    @ApiResponse({
        status: 200,
    })
    async getRoomStatus(): Promise<RoomStatusDto[]> {
        return this.statisticsService.getRoomStatus();
    }

    @Get('summary')
    @ApiOperation({
        summary: 'Tổng quan doanh thu vé / combo / tỉ lệ lấp đầy',
    })
    @ApiQuery({ name: 'date', required: false, description: 'ISO date, mặc định hôm nay' })
    @ApiQuery({ name: 'mode', required: false, enum: ['day', 'week', 'month', 'year'], description: 'Khoảng thống kê' })
    @ApiResponse({ status: 200 })
    async getSummary(
        @Query() query: GetSummaryQueryDto,
    ): Promise<SummaryDto> {
        return this.statisticsService.getSummary(query);
    }


}
