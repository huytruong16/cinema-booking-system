import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { RoomStatusDto } from './dtos/room-status.dto';

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
}
