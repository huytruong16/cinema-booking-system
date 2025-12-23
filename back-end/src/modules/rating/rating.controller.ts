import {
  Controller,
  Get,
  Param,
  BadRequestException,
  Delete,
  Post,
  Patch,
  Body,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { CreateRatingDto } from './dtos/create-rating.dto';
import { UpdateRatingDto } from './dtos/update-rating.dto';

@ApiTags('Nhãn phim')
@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

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
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    return this.ratingService.getRatingById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo nhãn phim mới' })
  @ApiBody({ type: CreateRatingDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo nhãn phim thành công',
  })
  async create(@Body() dto: CreateRatingDto) {
    return this.ratingService.createRating(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật nhãn phim (partial)' })
  @ApiParam({
    name: 'id',
    description: 'Mã nhãn phim cần cập nhật',
    required: true,
  })
  @ApiBody({ type: UpdateRatingDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật nhãn phim thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Nhãn phim không tồn tại',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateRatingDto) {
    if (!isUUID(id, '4')) {
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    }
    return this.ratingService.updateRating(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa mềm nhãn phim' })
  @ApiParam({
    name: 'id',
    description: 'Mã nhãn phim cần xóa',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa nhãn phim thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Nhãn phim không tồn tại',
  })
  async remove(@Param('id') id: string) {
    if (!isUUID(id, '4')) {
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    }
    return this.ratingService.removeRating(id);
  }
}
