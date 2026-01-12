import { ApiProperty } from '@nestjs/swagger';

export class TopMovieBannerMovieDto {
  @ApiProperty()
  MaPhim: string;

  @ApiProperty()
  TenHienThi: string;

  @ApiProperty()
  TenGoc: string;

  @ApiProperty()
  PosterUrl: string;

  @ApiProperty()
  BackdropUrl: string;

  @ApiProperty()
  TomTatNoiDung: string;

  @ApiProperty()
  TrailerUrl: string;

  @ApiProperty()
  ThoiLuong: number;

  @ApiProperty()
  QuocGia: string;

  @ApiProperty()
  DiemDanhGia: number;

  @ApiProperty()
  TrangThaiPhim: string;

  @ApiProperty()
  NhanPhim: {
    TenNhanPhim: string;
  };

  @ApiProperty()
  TheLoais: string[];
}

export class TopMovieBannerDto {
  @ApiProperty()
  rank: number;

  @ApiProperty({ type: TopMovieBannerMovieDto })
  movie: TopMovieBannerMovieDto;

  @ApiProperty()
  ticketsSold: number;

  @ApiProperty()
  revenue: number;
}
