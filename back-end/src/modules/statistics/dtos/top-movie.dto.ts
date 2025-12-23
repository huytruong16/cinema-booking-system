import { ApiProperty } from '@nestjs/swagger';

export enum TopMovieRangeEnum {
  day = 'day',
  week = 'week',
  month = 'month',
  year = 'year',
  all = 'all',
}

export class TopMovieDto {
  @ApiProperty({ description: 'Phim' })
  Phim: any;

  @ApiProperty({ description: 'Doanh thu' })
  DoanhThu: number;

  @ApiProperty({ description: 'Số vé đã bán' })
  SoVeDaBan: number;
}
