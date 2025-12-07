import { Controller, Get, Param, BadRequestException } from '@nestjs/common';
import { GenreService } from './genre.service';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';

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
}
