import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ComboService } from './combo.service';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('Combo')
@Controller('combos')
export class ComboController {
    constructor(private readonly comboService: ComboService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách các combo' })
    async getAllCombos() {
        return this.comboService.getAllCombos();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết combo theo mã' })
    @ApiParam({ name: 'id', description: 'Mã combo', required: true })
    async getById(@Param('id') id: string) {
        const combo = await this.comboService.getComboById(id);
        if (!combo) throw new NotFoundException('Combo không tồn tại');
        return combo;
    }
}
