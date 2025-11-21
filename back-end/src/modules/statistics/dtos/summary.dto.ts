import { ApiProperty } from '@nestjs/swagger';

export class SummaryComparisonDto {
    @ApiProperty({ description: 'Phần trăm tăng/giảm doanh thu so với kỳ trước' })
    DoanhThuVe: number;

    @ApiProperty({ description: 'Chênh lệch số vé bán so với kỳ trước' })
    SoVeDaBan: number;
}

export class SummaryDto {
    @ApiProperty({ description: 'Loại thống kê: ngày/ tuần/ tháng/ năm' })
    LoaiThongKe: string;

    @ApiProperty({ description: 'Ngày bắt đầu thống kê (ISO string)' })
    NgayBatDau: string;

    @ApiProperty({ description: 'Ngày kết thúc thống kê (ISO string)' })
    NgayKetThuc: string;

    @ApiProperty({ description: 'Tổng doanh thu trong khoảng thời gian' })
    TongDoanhThu: number;

    @ApiProperty({ description: 'Tổng doanh thu trong khoảng thời gian' })
    DoanhThuVe: number;

    @ApiProperty({ description: 'Tổng số vé đã bán trong khoảng thời gian' })
    SoVeDaBan: number;

    @ApiProperty({ description: 'Tỉ lệ lấp đầy (%) của các suất chiếu đã diễn ra' })
    TiLeLapDay: number;

    @ApiProperty({ description: 'Tổng doanh thu từ combo' })
    DoanhThuCombo: number;

    @ApiProperty({ type: SummaryComparisonDto })
    SoSanh: SummaryComparisonDto;
}
