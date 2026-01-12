import {
  Controller,
  Get,
  Param,
  BadRequestException,
  Post,
  Patch,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SeatTypeService } from './seat-type.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { CreateSeatTypeDto } from './dtos/create-seat-type.dto';
import { UpdateSeatTypeDto } from './dtos/update-seat-type.dto';
import { RoleEnum } from 'src/libs/common/enums/role.enum';
import { JwtAuthGuard } from 'src/libs/common/guards/jwt-auth.guard';
import { Roles } from 'src/libs/common/decorators/role.decorator';
import { RolesGuard } from 'src/libs/common/guards/role.guard';

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
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    return this.seatTypeService.getSeatTypeById(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({ summary: 'Tạo loại ghế mới' })
  @ApiBody({ type: CreateSeatTypeDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo loại ghế thành công',
  })
  async create(@Body() dto: CreateSeatTypeDto) {
    return this.seatTypeService.createSeatType(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({ summary: 'Cập nhật loại ghế (partial)' })
  @ApiParam({
    name: 'id',
    description: 'Mã loại ghế cần cập nhật',
    required: true,
  })
  @ApiBody({ type: UpdateSeatTypeDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật loại ghế thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Loại ghế không tồn tại',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateSeatTypeDto) {
    if (!isUUID(id, '4')) {
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    }
    return this.seatTypeService.updateSeatType(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({ summary: 'Xóa mềm loại ghế' })
  @ApiParam({
    name: 'id',
    description: 'Mã loại ghế cần xóa',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa loại ghế thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Loại ghế không tồn tại',
  })
  async remove(@Param('id') id: string) {
    if (!isUUID(id, '4')) {
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    }
    return this.seatTypeService.removeSeatType(id);
  }
}
