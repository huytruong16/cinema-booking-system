import {
  Controller,
  Get,
  Param,
  NotFoundException,
  BadRequestException,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ScreeningRoomService } from './screening-room.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { CreateScreeningRoomDto } from './dtos/create-screening-room.dto';
import { UpdateScreeningRoomDto } from './dtos/update-screening-room.dto';
import { JwtAuthGuard } from 'src/libs/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/libs/common/guards/role.guard';
import { Roles } from 'src/libs/common/decorators/role.decorator';
import { RoleEnum } from 'src/libs/common/enums';

@ApiTags('Phòng chiếu')
@Controller('screening-rooms')
export class ScreeningRoomController {
  constructor(private readonly screeningRoomService: ScreeningRoomService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các phòng chiếu' })
  async getAllScreeningRooms() {
    return this.screeningRoomService.getAllScreeningRooms();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({ summary: 'Tạo phòng chiếu mới' })
  async createScreeningRoom(
    @Body() createScreeningRoomDto: CreateScreeningRoomDto,
  ) {
    return this.screeningRoomService.createScreeningRoom(
      createScreeningRoomDto,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết phòng chiếu theo mã' })
  @ApiParam({ name: 'id', description: 'Mã phòng chiếu', required: true })
  async getScreeningRoomById(@Param('id') id: string) {
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    const room = await this.screeningRoomService.getScreeningRoomById(id);
    if (!room) throw new NotFoundException('Phòng chiếu không tồn tại');
    return room;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({ summary: 'Cập nhật phòng chiếu (partial)' })
  @ApiParam({ name: 'id', description: 'Mã phòng chiếu', required: true })
  async updateScreeningRoom(
    @Param('id') id: string,
    @Body() updateScreeningRoomDto: UpdateScreeningRoomDto,
  ) {
    if (!isUUID(id, '4')) {
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    }

    return this.screeningRoomService.updateScreeningRoom(
      id,
      updateScreeningRoomDto,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({ summary: 'Xóa mềm phòng chiếu' })
  @ApiParam({ name: 'id', description: 'Mã phòng chiếu', required: true })
  async removeScreeningRoom(@Param('id') id: string) {
    if (!isUUID(id, '4')) {
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    }

    return this.screeningRoomService.removeScreeningRoom(id);
  }
}
