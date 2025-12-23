import {
  Controller,
  Get,
  Param,
  BadRequestException,
  Body,
  Patch,
  Delete,
  Post,
} from '@nestjs/common';
import { FormatService } from './format.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { CreateFormatDto } from './dtos/create-format.dto';

@ApiTags('Định dạng')
@Controller('formats')
export class FormatController {
  constructor(private readonly formatService: FormatService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các định dạng phim' })
  @ApiResponse({ status: 200, description: 'Danh sách định dạng phim' })
  async getAllFormats() {
    return this.formatService.getAllFormats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết định dạng theo mã' })
  @ApiParam({ name: 'id', description: 'Mã định dạng', required: true })
  @ApiResponse({ status: 200, description: 'Chi tiết định dạng' })
  @ApiResponse({ status: 404, description: 'Định dạng không tồn tại' })
  async getById(@Param('id') id: string) {
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    return this.formatService.getFormatById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo thể loại mới' })
  @ApiBody({ type: CreateFormatDto })
  @ApiResponse({ status: 201, description: 'Tạo thể loại thành công.' })
  async create(@Body() dto: CreateFormatDto) {
    return this.formatService.createFormat(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật định dạng (partial)' })
  @ApiParam({
    name: 'id',
    description: 'Mã định dạng cần cập nhật',
    required: true,
  })
  @ApiBody({ type: CreateFormatDto })
  @ApiResponse({ status: 200, description: 'Cập nhật định dạng thành công.' })
  @ApiResponse({ status: 404, description: 'định dạng không tồn tại.' })
  async update(@Param('id') id: string, @Body() dto: CreateFormatDto) {
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    return this.formatService.updateFormat(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa mềm định dạng' })
  @ApiParam({ name: 'id', description: 'Mã định dạng cần xóa', required: true })
  @ApiResponse({ status: 200, description: 'Xóa định dạng thành công.' })
  @ApiResponse({ status: 404, description: 'định dạng không tồn tại.' })
  async remove(@Param('id') id: string) {
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    return this.formatService.removeFormat(id);
  }
}
