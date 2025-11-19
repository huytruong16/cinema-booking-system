import { Controller, Get, Param, NotFoundException, Post, Body } from '@nestjs/common';
import { FilmService } from './film.service';
import { CreateFilmDto } from './dtos/create-film.dto';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Phim')
@Controller('films')
export class FilmController {
    constructor(private readonly filmService: FilmService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách các phim' })
    async getAllFilms() {
        return this.filmService.getAllFilms();
    }

    @Get('format')
    @ApiOperation({ summary: 'Lấy danh sách các phim theo định dạng' })
    async getAllFilmFormats() {
        return this.filmService.getAllFilmFormats();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết phim theo mã' })
    @ApiParam({ name: 'id', description: 'Mã phim', required: true })
    async getById(@Param('id') id: string) {
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
