import { Controller, Get, Param, NotFoundException, Post, Body, Patch, Delete } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiBody
} from '@nestjs/swagger';
import { CreateVoucherDto } from './dtos/create-voucher.dto';
import { UpdateVoucherDto } from './dtos/update-voucher.dto';

@ApiTags('Mã giảm giá')
@Controller('vouchers')
export class VoucherController {
    constructor(private readonly voucherService: VoucherService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách các voucher' })

    @ApiResponse({
        status: 200, example: [
            {
                "MaKhuyenMai": "dfe49d23-65df-4848-9b1e-8a4760f9ee45",
                "TenKhuyenMai": "Khuyến mãi VIP ",
                "MoTa": "Giảm giá dành cho khách hàng cuối năm",
                "Code": "VIP1K30",
                "LoaiGiamGia": "CODINH",
                "GiaTri": "30000",
                "NgayBatDau": "2025-10-29T21:35:02.000Z",
                "NgayKetThuc": "2026-02-20T21:35:06.000Z",
                "SoLuongMa": 100,
                "SoLuongSuDung": 0,
                "GiaTriDonToiThieu": "0",
                "GiaTriGiamToiDa": "30000",
                "TrangThai": "CONHOATDONG",
                "CreatedAt": "2025-11-05T14:36:39.568Z",
                "UpdatedAt": "2025-11-05T14:36:39.568Z",
                "DeletedAt": null
            }
        ]
    })
    async getAllVouchers() {
        return this.voucherService.getAllVouchers();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết voucher theo mã' })
    @ApiParam({ name: 'id', description: 'Mã voucher', required: true })
    @ApiResponse({
        status: 200, example: {
            "MaKhuyenMai": "dfe49d23-65df-4848-9b1e-8a4760f9ee45",
            "TenKhuyenMai": "Khuyến mãi VIP ",
            "MoTa": "Giảm giá dành cho khách hàng cuối năm",
            "Code": "VIP1K30",
            "LoaiGiamGia": "CODINH",
            "GiaTri": "30000",
            "NgayBatDau": "2025-10-29T21:35:02.000Z",
            "NgayKetThuc": "2026-02-20T21:35:06.000Z",
            "SoLuongMa": 100,
            "SoLuongSuDung": 0,
            "GiaTriDonToiThieu": "0",
            "GiaTriGiamToiDa": "30000",
            "TrangThai": "CONHOATDONG",
            "CreatedAt": "2025-11-05T14:36:39.568Z",
            "UpdatedAt": "2025-11-05T14:36:39.568Z",
            "DeletedAt": null
        }
    })
    async getById(@Param('id') id: string) {
        const voucher = await this.voucherService.getVoucherById(id);
        if (!voucher) throw new NotFoundException('Mã giảm giá không tồn tại');
        return voucher;
    }

    @Post()
    @ApiOperation({ summary: 'Tạo voucher mới' })
    @ApiBody({ type: CreateVoucherDto })
    @ApiResponse({ status: 201, description: 'Tạo voucher thành công.' })
    async create(@Body() dto: CreateVoucherDto) {
        return this.voucherService.createVoucher(dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật voucher (có thể cập nhật một phần)' })
    @ApiParam({ name: 'id', description: 'Mã voucher cần cập nhật', required: true })
    @ApiBody({ type: UpdateVoucherDto })
    @ApiResponse({ status: 200, description: 'Cập nhật voucher thành công.' })
    @ApiResponse({ status: 404, description: 'Voucher không tồn tại.' })
    async update(@Param('id') id: string, @Body() dto: UpdateVoucherDto) {
        return this.voucherService.updateVoucher(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa mềm voucher (Cập nhật trạng thái)' })
    @ApiParam({ name: 'id', description: 'Mã voucher cần xóa', required: true })
    @ApiResponse({ status: 200, description: 'Xóa voucher thành công.' })
    @ApiResponse({ status: 404, description: 'Voucher không tồn tại.' })
    async remove(@Param('id') id: string) {
        return this.voucherService.removeVoucher(id);
    }
}

