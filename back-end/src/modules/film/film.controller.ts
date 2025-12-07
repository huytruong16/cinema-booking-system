import { Controller, Get, Param, NotFoundException, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { FilmService } from './film.service';
import { CreateFilmDto } from './dtos/create-film.dto';
import { FilterFilmDto } from './dtos/filter-film.dto';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Phim')
@Controller('films')
export class FilmController {
    constructor(private readonly filmService: FilmService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách các phim' })
    @ApiQuery({ name: 'MaDinhDang', required: false, description: 'Lọc theo mã định dạng' })
    @ApiQuery({ name: 'MaTheLoai', required: false, description: 'Lọc theo mã thể loại' })
    @ApiQuery({ name: 'MaNhanPhim', required: false, description: 'Lọc theo mã nhãn phim' })
    @ApiQuery({ name: 'MaNgonNgu', required: false, description: 'Lọc theo mã ngôn ngữ' })
    async getAllFilms(@Query() filters: FilterFilmDto) {
        return this.filmService.getAllFilms(filters);
    }

    @Get('format')
    @ApiOperation({ summary: 'Lấy danh sách các phim theo định dạng' })
    @ApiQuery({ name: 'MaDinhDang', required: false, description: 'Lọc theo mã định dạng' })
    @ApiQuery({ name: 'MaTheLoai', required: false, description: 'Lọc theo mã thể loại' })
    @ApiQuery({ name: 'MaNhanPhim', required: false, description: 'Lọc theo mã nhãn phim' })
    @ApiQuery({ name: 'MaNgonNgu', required: false, description: 'Lọc theo mã ngôn ngữ' })
    async getAllFilmFormats(@Query() filters: FilterFilmDto) {
        return this.filmService.getAllFilmFormats(filters);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết phim theo mã' })
    @ApiParam({ name: 'id', description: 'Mã phim', required: true })
    async getById(@Param('id') id: string) {
        if (!isUUID(id, '4')) throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
        const film = await this.filmService.getFilmById(id);
        if (!film) throw new NotFoundException('Phim không tồn tại');
        return film;
    }

    @Post()
    @ApiOperation({ summary: 'Tạo phim mới' })
    async createFilm(@Body() payload: CreateFilmDto) {
        return this.filmService.createFilm(payload);
    }
}
