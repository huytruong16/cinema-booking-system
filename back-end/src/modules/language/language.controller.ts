import { Controller, Get, Param, BadRequestException } from '@nestjs/common';
import { LanguageService } from './language.service';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';

@ApiTags('Ngôn ngữ')
@Controller('languages')
export class LanguageController {
    constructor(private readonly languageService: LanguageService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách các ngôn ngữ' })
    @ApiResponse({ status: 200, description: 'Danh sách ngôn ngữ' })
    async getAllLanguages() {
        return this.languageService.getAllLanguages();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết ngôn ngữ theo mã' })
    @ApiParam({ name: 'id', description: 'Mã ngôn ngữ', required: true })
    @ApiResponse({ status: 200, description: 'Chi tiết ngôn ngữ' })
    @ApiResponse({ status: 404, description: 'Ngôn ngữ không tồn tại' })
    async getById(@Param('id') id: string) {
        if (!isUUID(id, '4')) throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
        return this.languageService.getLanguageById(id);
    }
}
