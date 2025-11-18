import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Mã giảm giá')
@Controller('vouchers')
export class VoucherController {
    constructor(private readonly voucherService: VoucherService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách các voucher' })
    async getAllVouchers() {
        return this.voucherService.getAllVouchers();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết voucher theo mã' })
    @ApiParam({ name: 'id', description: 'Mã voucher', required: true })
    async getById(@Param('id') id: string) {
        const voucher = await this.voucherService.getVoucherById(id);
        if (!voucher) throw new NotFoundException('Mã giảm giá không tồn tại');
        return voucher;
    }
}
