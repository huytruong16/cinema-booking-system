import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Post,
  Body,
  Patch,
  Delete,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { VoucherService } from './voucher.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateVoucherDto } from './dtos/create-voucher.dto';
import { UpdateVoucherDto } from './dtos/update-voucher.dto';
import { JwtAuthGuard } from 'src/libs/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/libs/common/guards/role.guard';
import { RoleEnum } from 'src/libs/common/enums/role.enum';
import { Roles } from 'src/libs/common/decorators/role.decorator';

@ApiTags('Mã giảm giá')
@Controller('vouchers')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các voucher' })
  async getAllVouchers() {
    return this.voucherService.getAllVouchers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết voucher theo mã' })
  @ApiParam({ name: 'id', description: 'Mã voucher', required: true })
  async getById(@Param('id') id: string) {
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    const voucher = await this.voucherService.getVoucherById(id);
    if (!voucher) throw new NotFoundException('Mã giảm giá không tồn tại');
    return voucher;
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Tạo voucher mới' })
  @ApiBody({ type: CreateVoucherDto })
  @ApiResponse({ status: 201, description: 'Tạo voucher thành công.' })
  async create(@Body() dto: CreateVoucherDto) {
    return this.voucherService.createVoucher(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Cập nhật voucher (có thể cập nhật một phần)' })
  @ApiParam({
    name: 'id',
    description: 'Mã voucher cần cập nhật',
    required: true,
  })
  @ApiBody({ type: UpdateVoucherDto })
  @ApiResponse({ status: 200, description: 'Cập nhật voucher thành công.' })
  @ApiResponse({ status: 404, description: 'Voucher không tồn tại.' })
  async update(@Param('id') id: string, @Body() dto: UpdateVoucherDto) {
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    return this.voucherService.updateVoucher(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Xóa mềm voucher (Cập nhật trạng thái)' })
  @ApiParam({ name: 'id', description: 'Mã voucher cần xóa', required: true })
  @ApiResponse({ status: 200, description: 'Xóa voucher thành công.' })
  @ApiResponse({ status: 404, description: 'Voucher không tồn tại.' })
  async remove(@Param('id') id: string) {
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    return this.voucherService.removeVoucher(id);
  }
}
