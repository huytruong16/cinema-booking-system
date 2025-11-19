import { Controller, Get, Param } from '@nestjs/common';
import { FormatService } from './format.service';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Định dạng')
@Controller('formats')
export class FormatController {
    constructor(private readonly formatService: FormatService) { }

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
        return this.formatService.getFormatById(id);
    }
}
