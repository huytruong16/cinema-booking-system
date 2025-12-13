import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsArray, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested, IsNumber } from "class-validator";
import { Type } from 'class-transformer';
import { CreateFilmDto } from "./create-film.dto";

export class DinhDangDto {
    @ApiProperty({ description: 'MaDinhDang (id định dạng)', example: '298d831e-e0c4-4904-b815-24bd718a9b8f' })
    @IsString()
    @IsNotEmpty()
    MaDinhDang: string;

    @ApiPropertyOptional({ description: 'Giá vé cho định dạng (nếu muốn override giá mặc định)', example: 75000 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    GiaVe?: number;
}

export class UpdateFilmDto extends PartialType(CreateFilmDto) {
    @ApiProperty({ description: 'Tên gốc phim', example: 'Dune: Part Two' })
    @IsString()
    @IsNotEmpty()
    TenGoc: string;

    @ApiProperty({ description: 'Tên hiển thị', example: 'Dune: Hành tinh cát - Phần 2' })
    @IsString()
    @IsNotEmpty()
    TenHienThi: string;

    @ApiPropertyOptional({ description: 'Tóm tắt nội dung', example: 'Paul Atreides liên minh với người Fremen và bắt đầu hành trình trả thù cho gia đình mình, đồng thời đối mặt với định mệnh của chính mình để trở thành người được tiên tri.' })
    @IsOptional()
    @IsString()
    TomTatNoiDung?: string;

    @ApiPropertyOptional({ description: 'Đạo diễn', example: 'Denis Villeneuve' })
    @IsOptional()
    @IsString()
    DaoDien?: string;

    @ApiPropertyOptional({ description: 'Danh sách diễn viên', example: 'Timothée Chalamet, Zendaya, Rebecca Ferguson, Javier Bardem, Austin Butler, Florence Pugh' })
    @IsOptional()
    @IsString()
    DanhSachDienVien?: string;

    @ApiPropertyOptional({ description: 'Quốc gia', example: 'Mỹ' })
    @IsOptional()
    @IsString()
    QuocGia?: string;

    @ApiPropertyOptional({ description: 'Trailer URL', example: 'https://www.youtube.com/watch?v=Way9Dexny3w' })
    @IsOptional()
    @IsString()
    TrailerUrl?: string;

    @ApiPropertyOptional({ description: 'Poster URL', example: 'https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg' })
    @IsOptional()
    @IsString()
    PosterUrl?: string;

    @ApiPropertyOptional({ description: 'Backdrop URL', example: 'https://wallpapers.com/images/hd/dune-part-two-official-title-reveal-u5r7aul5r0emewht.jpg' })
    @IsOptional()
    @IsString()
    BackdropUrl?: string;

    @ApiProperty({ description: 'Thời lượng (phút)', example: 166 })
    @IsInt()
    ThoiLuong: number;

    @ApiProperty({ description: 'Ngày bắt đầu chiếu (ISO date string)', example: '2025-11-15T00:00:00.000Z' })
    @IsDateString()
    NgayBatDauChieu: string;

    @ApiProperty({ description: 'Ngày kết thúc chiếu (ISO date string)', example: '2026-01-15T00:00:00.000Z' })
    @IsDateString()
    NgayKetThucChieu: string;

    @ApiPropertyOptional({ description: 'Mảng MaDinhDang (id định dạng) để liên kết', type: [DinhDangDto], example: [{ "MaDinhDang": "298d831e-e0c4-4904-b815-24bd718a9b8f" }, { "MaDinhDang": "2ea7e036-6656-4fa5-82a1-9f937840df3e", "GiaVe": 75000 }] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DinhDangDto)
    DinhDangs?: DinhDangDto[];

    @ApiPropertyOptional({ description: 'Mảng MaTheLoai để liên kết', type: [String], example: ['f6003de3-25d4-4704-a7ca-202c6b4af531'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    TheLoais?: string[];
}
