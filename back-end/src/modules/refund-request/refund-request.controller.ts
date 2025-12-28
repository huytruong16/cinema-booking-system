import {
  Controller,
  Get,
  Param,
  BadRequestException,
  Post,
  Body,
  Patch,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { RefundRequestService } from './refund-request.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { CreateRefundRequestDto } from './dto/create-refund-request.dto';
import { GetRefundRequestDto } from './dto/get-refund-request.dto';
import { UpdateRefundRequestStatusDto } from './dto/update-refund-request-status.dto';
import { UpdateRefundRequestDto } from './dto/update-refund-request.dto';
import { JwtAuthGuard } from 'src/libs/common/guards/jwt-auth.guard';
import { RoleEnum } from 'src/libs/common/enums';

@ApiTags('Yêu cầu hoàn vé')
@Controller('refund-requests')
export class RefundRequestController {
  constructor(private readonly refundRequestService: RefundRequestService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu hoàn vé' })
  @ApiResponse({ status: 200, description: 'Danh sách yêu cầu hoàn vé' })
  async getAllRefundRequests(@Query() filters: GetRefundRequestDto) {
    return this.refundRequestService.getAllRefundRequests(filters);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo yêu cầu hoàn vé' })
  async createRefundRequest(
    @Req() req,
    @Body() createRefundRequestDto: CreateRefundRequestDto,
  ) {
    if (
      req.user.vaitro === RoleEnum.KHACHHANG &&
      (!createRefundRequestDto.MaNganHang ||
        !createRefundRequestDto.SoTaiKhoan ||
        !createRefundRequestDto.ChuTaiKhoan)
    ) {
      throw new BadRequestException(
        'Khách hàng phải cung cấp thông tin ngân hàng để hoàn vé',
      );
    }
    return this.refundRequestService.createNewRefundRequest(
      req.user.id,
      req.user.vaitro,
      createRefundRequestDto,
    );
  }

  @Patch('status/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật trạng thái yêu cầu hoàn vé' })
  @ApiParam({ name: 'id', description: 'Mã yêu cầu hoàn vé', required: true })
  async updateRefundRequestStatus(
    @Param('id') id: string,
    @Body() body: UpdateRefundRequestStatusDto,
  ) {
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    return this.refundRequestService.updateRefundRequestStatus(id, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin yêu cầu hoàn vé' })
  @ApiParam({ name: 'id', description: 'Mã yêu cầu hoàn vé', required: true })
  async updateRefundRequest(
    @Param('id') id: string,
    @Body() body: UpdateRefundRequestDto,
  ) {
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    return this.refundRequestService.updateRefundRequestInfo(id, body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết yêu cầu hoàn vé theo mã' })
  @ApiParam({ name: 'id', description: 'Mã yêu cầu hoàn vé', required: true })
  @ApiResponse({ status: 200, description: 'Chi tiết yêu cầu hoàn vé' })
  @ApiResponse({ status: 404, description: 'Yêu cầu hoàn vé không tồn tại' })
  async getById(@Param('id') id: string) {
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    return this.refundRequestService.getRefundRequestById(id);
  }
}
