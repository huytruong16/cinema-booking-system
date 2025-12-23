import { ApiProperty } from '@nestjs/swagger';

export class RevenueChartDto {
  @ApiProperty({ description: 'Ngày' })
  Ngay: string;

  @ApiProperty({ description: 'Doanh thu vé' })
  DoanhThuVe: number;

  @ApiProperty({ description: 'Doanh thu combo' })
  DoanhThuCombo: number;
}
