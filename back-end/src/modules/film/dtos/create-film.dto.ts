import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateFilmDto {
  @ApiProperty({ description: 'Tên gốc phim', example: 'Dune: Part Two' })
  @IsString()
  @IsNotEmpty()
  TenGoc: string;

  @ApiProperty({
    description: 'Tên hiển thị',
    example: 'Dune: Hành tinh cát - Phần 2',
  })
  @IsString()
  @IsNotEmpty()
  TenHienThi: string;

  @ApiPropertyOptional({
    description: 'Tóm tắt nội dung',
    example:
      'Paul Atreides liên minh với người Fremen và bắt đầu hành trình trả thù cho gia đình mình, đồng thời đối mặt với định mệnh của chính mình để trở thành người được tiên tri.',
  })
  @IsOptional()
  @IsString()
  TomTatNoiDung?: string;

  @ApiPropertyOptional({ description: 'Đạo diễn', example: 'Denis Villeneuve' })
  @IsOptional()
  @IsString()
  DaoDien?: string;

  @ApiPropertyOptional({
    description: 'Danh sách diễn viên',
    example:
      'Timothée Chalamet, Zendaya, Rebecca Ferguson, Javier Bardem, Austin Butler, Florence Pugh',
  })
  @IsOptional()
  @IsString()
  DanhSachDienVien?: string;

  @ApiPropertyOptional({ description: 'Quốc gia', example: 'Mỹ' })
  @IsOptional()
  @IsString()
  QuocGia?: string;

  @ApiPropertyOptional({
    description: 'Trailer URL',
    example: 'https://www.youtube.com/watch?v=Way9Dexny3w',
  })
  @IsOptional()
  @IsString()
  TrailerUrl?: string;

  @ApiPropertyOptional({
    description: 'Poster URL',
    example:
      'https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg',
  })
  @IsOptional()
  @IsString()
  PosterUrl?: string;

  @ApiPropertyOptional({
    description: 'Backdrop URL',
    example:
      'https://wallpapers.com/images/hd/dune-part-two-official-title-reveal-u5r7aul5r0emewht.jpg',
  })
  @IsOptional()
  @IsString()
  BackdropUrl?: string;

  @ApiProperty({ description: 'Thời lượng (phút)', example: 166 })
  @IsInt()
  @Type(() => Number)
  ThoiLuong: number;

  @ApiProperty({
    description: 'Ngày bắt đầu chiếu (ISO date string)',
    example: '2025-11-15T00:00:00.000Z',
  })
  @IsDateString()
  NgayBatDauChieu: string;

  @ApiProperty({
    description: 'Ngày kết thúc chiếu (ISO date string)',
    example: '2026-01-15T00:00:00.000Z',
  })
  @IsDateString()
  NgayKetThucChieu: string;

  @ApiProperty({
    description: 'Mã nhãn phim',
    example: 'c1a2b3d4-e5f6-7890-abcd-1234567890ab',
  })
  @IsString()
  @IsNotEmpty()
  MaNhanPhim: string;

  @ApiPropertyOptional({
    description: 'Mảng MaTheLoai để liên kết',
    type: [String],
    example: ['f6003de3-25d4-4704-a7ca-202c6b4af531'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map((v: string) => v.trim());
      }
    }
    return value;
  })
  TheLoais?: string[];
}
