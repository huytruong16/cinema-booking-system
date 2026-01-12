import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  StatisticsService,
  StatisticsExportService,
  StatisticsPdfService,
} from './statistics.service';
import { RoomStatusDto } from './dtos/room-status.dto';
import { SummaryDto } from './dtos/summary.dto';
import { GetSummaryQueryDto } from './dtos/get-summary-query.dto';
import { GetRevenueChartQueryDto } from './dtos/get-revenue-chart-query.dto';
import { GetTopMovieDto } from './dtos/get-top-movie.dto-query';
import { TopMovieDto } from './dtos/top-movie.dto';
import { GetTopStaffQueryDto } from './dtos/get-top-staff-query.dto';
import { TopMovieBannerDto } from './dtos/top-movie-banner.dto';
import { TopStaffDto } from './dtos/top-staff.dto';
import { JwtAuthGuard } from 'src/libs/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/libs/common/guards/role.guard';
import { Roles } from 'src/libs/common/decorators/role.decorator';
import { RoleEnum } from 'src/libs/common/enums';

@ApiTags('Thống kê')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
@Controller('statistics')
export class StatisticsController {
  constructor(
    private readonly statisticsService: StatisticsService,
    private readonly statisticsExportService: StatisticsExportService,
    private readonly statisticsPdfService: StatisticsPdfService,
  ) {}

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

  @Get('top-movies-for-banner')
  @ApiOperation({ summary: 'Top phim ăn khách dành cho banner' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Số lượng phim trả về (mặc định 5)',
  })
  @ApiQuery({
    name: 'range',
    required: false,
    enum: ['day', 'week', 'month', 'year', 'all'],
    description: 'Khoảng thời gian (mặc định day)',
  })
  async getTopMoviesForBanner(
    @Query() query: GetTopMovieDto,
  ): Promise<TopMovieBannerDto[]> {
    return this.statisticsService.getTopMoviesForBanner(query);
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

  @Get('/export/room-status')
  @ApiOperation({ summary: 'Xuất Excel trạng thái phòng chiếu' })
  async exportRoomStatus(@Res() res: any) {
    const buffer = await this.statisticsExportService.exportRoomStatus();

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=room-status.xlsx',
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.send(buffer);
  }

  @Get('/export/summary')
  @ApiOperation({ summary: 'Xuất Excel tổng quan doanh thu' })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({
    name: 'mode',
    required: false,
    enum: ['day', 'week', 'month', 'year'],
  })
  async exportSummary(@Query() query: GetSummaryQueryDto, @Res() res: any) {
    const buffer = await this.statisticsExportService.exportSummary(query);

    res.setHeader('Content-Disposition', 'attachment; filename=summary.xlsx');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.send(buffer);
  }

  @Get('/export/revenue-chart')
  @ApiOperation({ summary: 'Xuất Excel doanh thu theo ngày' })
  @ApiQuery({
    name: 'range',
    required: true,
    enum: ['week', 'month'],
  })
  @ApiQuery({ name: 'date', required: false })
  async exportRevenueChart(
    @Query() query: GetRevenueChartQueryDto,
    @Res() res: any,
  ) {
    const buffer = await this.statisticsExportService.exportRevenueChart(query);

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=revenue-chart.xlsx',
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.send(buffer);
  }

  @Get('/export/top-movies')
  @ApiOperation({ summary: 'Xuất Excel top phim doanh thu cao' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({
    name: 'range',
    required: false,
    enum: ['day', 'week', 'month', 'year', 'all'],
  })
  async exportTopMovies(@Query() query: GetTopMovieDto, @Res() res: any) {
    const buffer = await this.statisticsExportService.exportTopMovies(query);

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=top-movies.xlsx',
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.send(buffer);
  }

  @Get('/export/top-staff')
  @ApiOperation({ summary: 'Xuất Excel hiệu suất nhân viên' })
  @ApiQuery({
    name: 'range',
    required: true,
    enum: ['day', 'week', 'month', 'year'],
  })
  @ApiQuery({ name: 'date', required: false })
  async exportTopStaff(@Query() query: GetTopStaffQueryDto, @Res() res: any) {
    const buffer = await this.statisticsExportService.exportTopStaff(query);

    res.setHeader('Content-Disposition', 'attachment; filename=top-staff.xlsx');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.send(buffer);
  }

  @Get('/export/pdf/room-status')
  @ApiOperation({ summary: 'Xuất PDF trạng thái phòng chiếu' })
  async exportRoomStatusPdf(@Res() res: any) {
    const buffer = await this.statisticsPdfService.generateRoomStatusPdf();

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=room-status.pdf',
    );
    res.setHeader('Content-Type', 'application/pdf');

    res.send(buffer);
  }

  @Get('/export/pdf/summary')
  @ApiOperation({ summary: 'Xuất PDF tổng quan doanh thu' })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({
    name: 'mode',
    required: false,
    enum: ['day', 'week', 'month', 'year'],
  })
  async exportSummaryPdf(@Query() query: GetSummaryQueryDto, @Res() res: any) {
    const buffer = await this.statisticsPdfService.generateSummaryPdf(query);

    res.setHeader('Content-Disposition', 'attachment; filename=summary.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    res.send(buffer);
  }

  @Get('/export/pdf/revenue-chart')
  @ApiOperation({ summary: 'Xuất PDF doanh thu theo ngày' })
  @ApiQuery({
    name: 'range',
    required: true,
    enum: ['week', 'month'],
  })
  @ApiQuery({ name: 'date', required: false })
  async exportRevenueChartPdf(
    @Query() query: GetRevenueChartQueryDto,
    @Res() res: any,
  ) {
    const buffer =
      await this.statisticsPdfService.generateRevenueChartPdf(query);

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=revenue-chart.pdf',
    );
    res.setHeader('Content-Type', 'application/pdf');

    res.send(buffer);
  }

  @Get('/export/pdf/top-movies')
  @ApiOperation({ summary: 'Xuất PDF top phim doanh thu cao' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({
    name: 'range',
    required: false,
    enum: ['day', 'week', 'month', 'year', 'all'],
  })
  async exportTopMoviesPdf(@Query() query: GetTopMovieDto, @Res() res: any) {
    const buffer = await this.statisticsPdfService.generateTopMoviesPdf(query);

    res.setHeader('Content-Disposition', 'attachment; filename=top-movies.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    res.send(buffer);
  }

  @Get('/export/pdf/top-staff')
  @ApiOperation({ summary: 'Xuất PDF hiệu suất nhân viên' })
  @ApiQuery({
    name: 'range',
    required: true,
    enum: ['day', 'week', 'month', 'year'],
  })
  @ApiQuery({ name: 'date', required: false })
  async exportTopStaffPdf(
    @Query() query: GetTopStaffQueryDto,
    @Res() res: any,
  ) {
    const buffer = await this.statisticsPdfService.generateTopStaffPdf(query);

    res.setHeader('Content-Disposition', 'attachment; filename=top-staff.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    res.send(buffer);
  }
}
