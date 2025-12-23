import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  BadRequestException,
  Delete,
  Body,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ShowtimeService } from './showtime.service';
import { GetAllShowtimeDto } from './dtos/get-showtime.dto';
import { ShowtimeStatusEnum } from '../../libs/common/enums/showtime-status.enum';
import { isUUID } from 'class-validator';
import { GetShowtimeByMovieDto } from './dtos/get-showtime-by-movie.dto';
import { CreateShowtimeDto } from './dtos/create-showtime.dto';
import { UpdateShowtimeDto } from './dtos/update-showtime.dto';
import { RoleEnum } from 'src/libs/common/enums';
import { Roles } from 'src/libs/common/decorators/role.decorator';
import { JwtAuthGuard } from 'src/libs/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/libs/common/guards/role.guard';

@ApiTags('Suất chiếu')
@Controller('showtimes')
export class ShowtimeController {
  constructor(private readonly showtimeService: ShowtimeService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách suất chiếu với bộ lọc' })
  @ApiQuery({
    name: 'MaPhim',
    required: false,
    description: 'Lọc theo mã phim',
  })
  @ApiQuery({
    name: 'MaPhongChieu',
    required: false,
    description: 'Lọc theo mã phòng chiếu',
  })
  @ApiQuery({
    name: 'MaPhienBanPhim',
    required: false,
    description: 'Lọc theo mã phiên bản phim',
  })
  @ApiQuery({
    name: 'MaDinhDang',
    required: false,
    description: 'Lọc theo mã định dạng',
  })
  @ApiQuery({
    name: 'MaTheLoai',
    required: false,
    description: 'Lọc theo mã thể loại',
  })
  @ApiQuery({
    name: 'TrangThai',
    required: false,
    enum: ShowtimeStatusEnum,
    description: 'Lọc theo trạng thái',
  })
  @ApiQuery({
    name: 'TuNgay',
    required: false,
    description: 'Lọc từ ngày (ISO 8601)',
  })
  @ApiQuery({
    name: 'DenNgay',
    required: false,
    description: 'Lọc đến ngày (ISO 8601)',
  })
  @ApiResponse({ status: 200 })
  async getShowtimes(@Query() filters: GetAllShowtimeDto) {
    return this.showtimeService.getAllShowtimes(filters);
  }

  @Get('movie/:movieId')
  @ApiOperation({ summary: 'Lấy chi tiết suất chiếu theo phim' })
  @ApiParam({ name: 'movieId', description: 'Mã phim', required: true })
  async getShowtimeByMovieId(
    @Query() filters: GetShowtimeByMovieDto,
    @Param('movieId') movieId: string,
  ) {
    if (!isUUID(movieId, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    return this.showtimeService.getShowtimesByMovieId(movieId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết suất chiếu theo mã' })
  @ApiParam({ name: 'id', description: 'Mã suất chiếu', required: true })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Suất chiếu không tồn tại' })
  async getShowtimeById(@Param('id') id: string) {
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    const showtime = await this.showtimeService.getShowtimeById(id);
    if (!showtime) {
      throw new NotFoundException('Suất chiếu không tồn tại');
    }
    return showtime;
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({ summary: 'Tạo suất chiếu mới' })
  @ApiBody({ type: CreateShowtimeDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo suất chiếu thành công',
  })
  async create(@Body() dto: CreateShowtimeDto) {
    return this.showtimeService.createShowtime(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({ summary: 'Cập nhật suất chiếu (partial)' })
  @ApiParam({ name: 'id', description: 'Mã suất chiếu' })
  @ApiBody({ type: UpdateShowtimeDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật suất chiếu thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Suất chiếu không tồn tại',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateShowtimeDto) {
    if (!isUUID(id, '4')) {
      throw new BadRequestException('id phải là UUID v4 hợp lệ');
    }
    return this.showtimeService.updateShowtime(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({ summary: 'Xóa mềm suất chiếu' })
  @ApiParam({ name: 'id', description: 'Mã suất chiếu' })
  @ApiResponse({
    status: 200,
    description: 'Xóa suất chiếu thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Suất chiếu không tồn tại',
  })
  async remove(@Param('id') id: string) {
    if (!isUUID(id, '4')) {
      throw new BadRequestException('id phải là UUID v4 hợp lệ');
    }
    return this.showtimeService.removeShowtime(id);
  }
}
