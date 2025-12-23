import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { RoomStatusDto } from './dtos/room-status.dto';
import { SummaryDto } from './dtos/summary.dto';
import { GetSummaryQueryDto } from './dtos/get-summary-query.dto';
import { GetRevenueChartQueryDto } from './dtos/get-revenue-chart-query.dto';
import { GetTopMovieDto } from './dtos/get-top-movie.dto-query';
import { TopMovieDto } from './dtos/top-movie.dto';
import { GetTopStaffQueryDto } from './dtos/get-top-staff-query.dto';
import { TopStaffDto } from './dtos/top-staff.dto';

@ApiTags('Thống kê')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

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
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'ISO date, mặc định hôm nay',
  })
  @ApiQuery({
    name: 'mode',
    required: false,
    enum: ['day', 'week', 'month', 'year'],
    description: 'Khoảng thống kê',
  })
  @ApiResponse({ status: 200 })
  async getSummary(@Query() query: GetSummaryQueryDto): Promise<SummaryDto> {
    return this.statisticsService.getSummary(query);
  }

  @Get('revenue-chart')
  @ApiOperation({ summary: 'Doanh thu vé / combo dạng biểu đồ cột theo ngày' })
  @ApiQuery({
    name: 'range',
    required: true,
    enum: ['week', 'month'],
    description: 'Khoảng thời gian',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description:
      'Ngày bất kỳ nằm trong tuần / tháng cần thống kê (ISO), mặc định hôm nay',
  })
  async getRevenueChart(@Query() query: GetRevenueChartQueryDto) {
    return this.statisticsService.getRevenueChart(query);
  }

  @Get('top-movies')
  @ApiOperation({ summary: 'Top phim ăn khách theo doanh thu' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Số lượng phim trả về (mặc định 5, tối đa 50)',
  })
  @ApiQuery({
    name: 'range',
    required: false,
    enum: ['day', 'week', 'month', 'year', 'all'],
    description: 'Khoảng thời gian (mặc định day)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách phim theo doanh thu giảm dần',
  })
  async getTopMovies(@Query() query: GetTopMovieDto): Promise<TopMovieDto[]> {
    return this.statisticsService.getTopMovies(query);
  }

  @Get('top-staff')
  @ApiOperation({ summary: 'Hiệu suất nhân viên' })
  @ApiQuery({
    name: 'range',
    required: true,
    enum: ['day', 'week', 'month', 'year'],
    description: 'Khoảng thời gian',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description:
      'Một ngày trong khoảng thời gian lập báo cáo (ISO), mặc định hôm nay',
  })
  @ApiResponse({ status: 200 })
  async getTopStaff(
    @Query() query: GetTopStaffQueryDto,
  ): Promise<TopStaffDto[]> {
    return this.statisticsService.getTopStaff(query);
  }
}
