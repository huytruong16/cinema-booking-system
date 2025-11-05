import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ComboService } from './combo.service';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('Combo')
@Controller('combos')
export class ComboController {
    constructor(private readonly comboService: ComboService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách các combo' })
    @ApiResponse({
        status: 200, example: [
            {
                "MaCombo": "0288dd73-9214-44fe-a8be-14f76bc83f30",
                "TenCombo": "Combo thường",
                "MoTa": "1 Coke 32oz + 1 Bắp 2 Ngăn 64OZ Phô Mai + Caramel",
                "GiaTien": "90000",
                "TrangThai": "HETHANG",
                "HinhAnh": "https://reviewphongtap.com/wp-content/uploads/2022/12/gia-bap-nuoc-cgv-3.png",
                "CreatedAt": "2025-11-05T15:34:59.973Z",
                "UpdatedAt": "2025-11-05T15:34:59.973Z",
                "DeletedAt": null
            },
            {
                "MaCombo": "56f3f14a-6e0a-48a9-83a2-51728c15e748",
                "TenCombo": "Combo đặc biệt ",
                "MoTa": "4 Coke 22oz + 2 Bắp 2 Ngăn 64OZ Phô Mai + Caramel",
                "GiaTien": "120000",
                "TrangThai": "CONHANG",
                "HinhAnh": "https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/165334/Originals/gia-bap-nuoc-cgv-2023-la-bao-nhieu-nhung-uu-dai-combo-moi-nhat-hien-nay-la-gi-7.jpg",
                "CreatedAt": "2025-11-05T15:32:26.963Z",
                "UpdatedAt": "2025-11-05T15:32:26.963Z",
                "DeletedAt": null
            }
        ]
    })
    async getAllCombos() {
        return this.comboService.getAllCombos();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết combo theo mã' })
    @ApiParam({ name: 'id', description: 'Mã combo', required: true })
    @ApiResponse({
        status: 200, example: {
            "MaCombo": "0288dd73-9214-44fe-a8be-14f76bc83f30",
            "TenCombo": "Combo thường",
            "MoTa": "1 Coke 32oz + 1 Bắp 2 Ngăn 64OZ Phô Mai + Caramel",
            "GiaTien": "90000",
            "TrangThai": "HETHANG",
            "HinhAnh": "https://reviewphongtap.com/wp-content/uploads/2022/12/gia-bap-nuoc-cgv-3.png",
            "CreatedAt": "2025-11-05T15:34:59.973Z",
            "UpdatedAt": "2025-11-05T15:34:59.973Z",
            "DeletedAt": null
        }
    })
    async getById(@Param('id') id: string) {
        const combo = await this.comboService.getComboById(id);
        if (!combo) throw new NotFoundException('Combo không tồn tại');
        return combo;
    }
}
