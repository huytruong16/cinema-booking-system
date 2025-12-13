import { Controller, Get, Param, BadRequestException, Post, Patch, Delete, Body } from '@nestjs/common';
import { GenreService } from './genre.service';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiBody
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { CreateGenreDto } from './dtos/create-genre.dto';

@ApiTags('Thể loại')
@Controller('genres')
export class GenreController {
    constructor(private readonly genreService: GenreService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách các thể loại phim' })
    @ApiResponse({ status: 200, description: 'Danh sách thể loại phim' })
    async getAllGenres() {
        return this.genreService.getAllGenres();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết thể loại theo mã' })
    @ApiParam({ name: 'id', description: 'Mã thể loại', required: true })
    @ApiResponse({ status: 200, description: 'Chi tiết thể loại' })
    @ApiResponse({ status: 404, description: 'Thể loại không tồn tại' })
    async getById(@Param('id') id: string) {
        if (!isUUID(id, '4')) throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
        return this.genreService.getGenreById(id);
    }

    @Post()
    @ApiOperation({ summary: 'Tạo thể loại mới' })
    @ApiBody({ type: CreateGenreDto })
    @ApiResponse({ status: 201, description: 'Tạo thể loại thành công.' })
    async create(@Body() dto: CreateGenreDto) {
        return this.genreService.createGenre(dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật thể loại' })
    @ApiParam({ name: 'id', description: 'Mã thể loại cần cập nhật', required: true })
    @ApiBody({ type: CreateGenreDto })
    @ApiResponse({ status: 200, description: 'Cập nhật thể loại thành công.' })
    @ApiResponse({ status: 404, description: 'thể loại không tồn tại.' })
    async update(@Param('id') id: string, @Body() dto: CreateGenreDto) {
        if (!isUUID(id, '4')) throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
        return this.genreService.updateGenre(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa mềm thể loại (Cập nhật trạng thái)' })
    @ApiParam({ name: 'id', description: 'Mã thể loại cần xóa', required: true })
    @ApiResponse({ status: 200, description: 'Xóa thể loại thành công.' })
    @ApiResponse({ status: 404, description: 'thể loại không tồn tại.' })
    async remove(@Param('id') id: string) {
        if (!isUUID(id, '4')) throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
        return this.genreService.removeGenre(id);
    }
}
