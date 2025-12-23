import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Post,
  Body,
  Query,
  BadRequestException,
  UseInterceptors,
  UploadedFiles,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FilmService } from './film.service';
import { CreateFilmDto } from './dtos/create-film.dto';
import { FilterFilmDto } from './dtos/filter-film.dto';
import { UpdateFilmDto } from './dtos/update-film.dto';
import { CreateFilmVersionDto } from './dtos/create-film-version.dto';
import { UpdateFilmVersionDto } from './dtos/update-film-version.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiQuery,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetFilmReviewDto } from './dtos/get-film-review.dto';
import { JwtAuthGuard } from 'src/libs/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/libs/common/guards/role.guard';
import { Roles } from 'src/libs/common/decorators/role.decorator';
import { RoleEnum } from 'src/libs/common/enums/role.enum';

@ApiTags('Phim')
@Controller('films')
export class FilmController {
  constructor(private readonly filmService: FilmService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các phim' })
  @ApiQuery({
    name: 'MaDinhDang',
    required: false,
    description: 'Lọc theo mã định dạng',
  })
  @ApiQuery({
    name: 'MaTheLoai',
    required: false,
    description: 'Lọc theo mã thể loại',
  })
  @ApiQuery({
    name: 'MaNhanPhim',
    required: false,
    description: 'Lọc theo mã nhãn phim',
  })
  @ApiQuery({
    name: 'MaNgonNgu',
    required: false,
    description: 'Lọc theo mã ngôn ngữ',
  })
  async getAllFilms(@Query() filters: FilterFilmDto) {
    return this.filmService.getAllFilms(filters);
  }

  @Get('format')
  @ApiOperation({ summary: 'Lấy danh sách các phim theo định dạng' })
  @ApiQuery({
    name: 'MaDinhDang',
    required: false,
    description: 'Lọc theo mã định dạng',
  })
  @ApiQuery({
    name: 'MaTheLoai',
    required: false,
    description: 'Lọc theo mã thể loại',
  })
  @ApiQuery({
    name: 'MaNhanPhim',
    required: false,
    description: 'Lọc theo mã nhãn phim',
  })
  @ApiQuery({
    name: 'MaNgonNgu',
    required: false,
    description: 'Lọc theo mã ngôn ngữ',
  })
  async getAllFilmFormats(@Query() filters: FilterFilmDto) {
    return this.filmService.getAllFilmFormats(filters);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Lấy danh sách đánh giá của phim theo mã phim' })
  @ApiParam({ name: 'id', description: 'Mã phim', required: true })
  @ApiResponse({ status: 200, description: 'Danh sách đánh giá của phim' })
  async getFilmReviews(
    @Param('id') id: string,
    @Query() query: GetFilmReviewDto,
  ) {
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    return this.filmService.getFilmReviews(id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết phim theo mã' })
  @ApiParam({ name: 'id', description: 'Mã phim', required: true })
  async getById(@Param('id') id: string) {
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    const film = await this.filmService.getFilmById(id);
    if (!film) throw new NotFoundException('Phim không tồn tại');
    return film;
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({ summary: 'Tạo phim mới (kèm poster & backdrop)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Thông tin phim và 2 file ảnh (POSTER + BACKDROP)',
    schema: {
      type: 'object',
      properties: {
        TenGoc: { type: 'string', example: 'Dune: Part Two' },
        TenHienThi: { type: 'string', example: 'Dune: Hành tinh cát - Phần 2' },
        TomTatNoiDung: { type: 'string', example: 'Paul Atreides...' },
        DaoDien: { type: 'string', example: 'Denis Villeneuve' },
        DanhSachDienVien: {
          type: 'string',
          example: 'Timothée Chalamet, Zendaya',
        },
        QuocGia: { type: 'string', example: 'Mỹ' },
        TrailerUrl: { type: 'string', example: 'https://youtube.com/...' },
        ThoiLuong: { type: 'number', example: 166 },
        NgayBatDauChieu: { type: 'string', format: 'date-time' },
        NgayKetThucChieu: { type: 'string', format: 'date-time' },
        MaNhanPhim: {
          type: 'string',
          example: '3392dce5-2bf4-4d4e-8427-b47e4519cc61',
        },

        TheLoais: {
          type: 'string',
          description: 'JSON string của mảng MaTheLoai',
          example: '["644d0fe5-be9f-4660-8b31-25b47d0e4e8a"]',
        },

        posterFile: {
          type: 'string',
          format: 'binary',
          description: 'Poster phim (jpg, jpeg, png, webp)',
        },

        backdropFile: {
          type: 'string',
          format: 'binary',
          description: 'Backdrop phim (jpg, jpeg, png, webp)',
        },
      },
      required: [
        'TenGoc',
        'TenHienThi',
        'ThoiLuong',
        'NgayBatDauChieu',
        'NgayKetThucChieu',
      ],
    },
  })
  @ApiResponse({ status: 201, description: 'Tạo phim thành công' })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc thiếu ảnh',
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'posterFile', maxCount: 1 },
      { name: 'backdropFile', maxCount: 1 },
    ]),
  )
  async createFilm(
    @Body() dto: CreateFilmDto,
    @UploadedFiles()
    files: {
      posterFile?: Express.Multer.File[];
      backdropFile?: Express.Multer.File[];
    },
  ) {
    const poster = files?.posterFile?.[0];
    const backdrop = files?.backdropFile?.[0];

    return this.filmService.createFilm(dto, poster, backdrop);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({ summary: 'Cập nhật thông tin phim (partial)' })
  @ApiParam({ name: 'id', description: 'Mã phim (UUID v4)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Cập nhật thông tin phim',
    schema: {
      type: 'object',
      properties: {
        TenGoc: { type: 'string' },
        TenHienThi: { type: 'string' },
        TomTatNoiDung: { type: 'string' },
        DaoDien: { type: 'string' },
        DanhSachDienVien: { type: 'string' },
        QuocGia: { type: 'string' },
        TrailerUrl: { type: 'string' },
        ThoiLuong: { type: 'number' },
        NgayBatDauChieu: { type: 'string', format: 'date-time' },
        NgayKetThucChieu: { type: 'string', format: 'date-time' },
        MaNhanPhim: { type: 'string' },

        TheLoais: {
          type: 'string',
          description: 'JSON string của mảng MaTheLoai',
          example: '["id1","id2"]',
        },

        posterFile: {
          type: 'string',
          format: 'binary',
        },
        backdropFile: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Cập nhật phim thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Phim không tồn tại' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'posterFile', maxCount: 1 },
      { name: 'backdropFile', maxCount: 1 },
    ]),
  )
  async updateFilm(
    @Param('id') id: string,
    @Body() dto: UpdateFilmDto,
    @UploadedFiles()
    files: {
      posterFile?: Express.Multer.File[];
      backdropFile?: Express.Multer.File[];
    },
  ) {
    if (!isUUID(id, '4')) {
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    }

    const poster = files?.posterFile?.[0];
    const backdrop = files?.backdropFile?.[0];

    return this.filmService.updateFilm(id, dto, poster, backdrop);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({ summary: 'Xóa phim (soft delete)' })
  @ApiParam({ name: 'id', description: 'Mã phim (UUID v4)' })
  @ApiResponse({ status: 200, description: 'Xóa phim thành công' })
  @ApiResponse({ status: 404, description: 'Phim không tồn tại' })
  async removeFilm(@Param('id') id: string) {
    if (!isUUID(id, '4')) {
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    }

    return this.filmService.removeFilm(id);
  }

  @Post('/version')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({ summary: 'Tạo mới phiên bản phim' })
  @ApiBody({ type: CreateFilmVersionDto })
  @ApiResponse({ status: 201, description: 'Tạo phiên bản phim thành công' })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc phiên bản đã tồn tại',
  })
  async create(@Body() dto: CreateFilmVersionDto) {
    return this.filmService.createFilmVersion(dto);
  }

  @Patch('/version/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({ summary: 'Cập nhật phiên bản phim (partial)' })
  @ApiParam({ name: 'id', description: 'Mã phiên bản phim (UUID v4)' })
  @ApiBody({ type: UpdateFilmVersionDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật phiên bản phim thành công',
  })
  @ApiResponse({ status: 404, description: 'Phiên bản phim không tồn tại' })
  async update(@Param('id') id: string, @Body() dto: UpdateFilmVersionDto) {
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    return this.filmService.updateFilmVersion(id, dto);
  }

  @Delete('/version/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({ summary: 'Xóa phiên bản phim (soft delete)' })
  @ApiParam({ name: 'id', description: 'Mã phiên bản phim (UUID v4)' })
  @ApiResponse({ status: 200, description: 'Xóa phiên bản phim thành công' })
  @ApiResponse({ status: 404, description: 'Phiên bản phim không tồn tại' })
  async remove(@Param('id') id: string) {
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    return this.filmService.removeFilmVersion(id);
  }
}
