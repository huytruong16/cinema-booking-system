import { Controller, Get, Param, BadRequestException, Patch, Post, Body, Delete } from '@nestjs/common';
import { LanguageService } from './language.service';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiBody
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { CreateLanguageDto } from './dtos/create-language.dto';
import { UpdateLanguageDto } from './dtos/update-language.dto';

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

    @Post()
    @ApiOperation({ summary: 'Tạo ngôn ngữ mới' })
    @ApiBody({ type: CreateLanguageDto })
    @ApiResponse({
        status: 201,
        description: 'Tạo ngôn ngữ thành công',
    })
    async create(@Body() dto: CreateLanguageDto) {
        return this.languageService.createLanguage(dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật ngôn ngữ' })
    @ApiParam({
        name: 'id',
        description: 'Mã ngôn ngữ cần cập nhật',
        required: true,
    })
    @ApiBody({ type: UpdateLanguageDto })
    @ApiResponse({
        status: 200,
        description: 'Cập nhật ngôn ngữ thành công',
    })
    @ApiResponse({
        status: 404,
        description: 'Ngôn ngữ không tồn tại',
    })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateLanguageDto,
    ) {
        if (!isUUID(id, '4')) {
            throw new BadRequestException(
                'Tham số id phải là UUID v4 hợp lệ',
            );
        }
        return this.languageService.updateLanguage(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa mềm ngôn ngữ' })
    @ApiParam({
        name: 'id',
        description: 'Mã ngôn ngữ cần xóa',
        required: true,
    })
    @ApiResponse({
        status: 200,
        description: 'Xóa ngôn ngữ thành công',
    })
    @ApiResponse({
        status: 404,
        description: 'Ngôn ngữ không tồn tại',
    })
    async remove(@Param('id') id: string) {
        if (!isUUID(id, '4')) {
            throw new BadRequestException(
                'Tham số id phải là UUID v4 hợp lệ',
            );
        }
        return this.languageService.removeLanguage(id);
    }
}
