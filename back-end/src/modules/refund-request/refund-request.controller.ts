import { Controller, Get, Param, BadRequestException, Post, Body } from '@nestjs/common';
import { RefundRequestService } from './refund-request.service';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { CreateRefundRequestDto } from './dto/create-refund-request.dto';

@ApiTags('Yêu cầu hoàn vé')
@Controller('refund-requests')
export class RefundRequestController {
    constructor(private readonly refundRequestService: RefundRequestService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách yêu cầu hoàn vé' })
    @ApiResponse({ status: 200, description: 'Danh sách yêu cầu hoàn vé' })
    async getAllRefundRequests() {
        return this.refundRequestService.getAllRefundRequests();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết yêu cầu hoàn vé theo mã' })
    @ApiParam({ name: 'id', description: 'Mã yêu cầu hoàn vé', required: true })
    @ApiResponse({ status: 200, description: 'Chi tiết yêu cầu hoàn vé' })
    @ApiResponse({ status: 404, description: 'Yêu cầu hoàn vé không tồn tại' })
    async getById(@Param('id') id: string) {
        if (!isUUID(id, '4')) throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
        return this.refundRequestService.getRefundRequestById(id);
    }

    @Post()
    @ApiOperation({ summary: 'Tạo yêu cầu hoàn vé' })
    async createRefundRequest(@Body() createRefundRequestDto: CreateRefundRequestDto) {
        return this.refundRequestService.createNewRefundRequest(createRefundRequestDto);
    }
}
