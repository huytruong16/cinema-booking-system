import { ApiProperty } from '@nestjs/swagger';

export class TopStaffDto {
    @ApiProperty({ description: 'Thông tin nhân viên' })
    NhanVien: any;

    @ApiProperty({ description: 'Tổng doanh thu nhân viên đạt được' })
    DoanhThu: number;

    @ApiProperty({ description: 'Số lượng giao dịch nhân viên thực hiện' })
    SoLuotGiaoDich: number;
}
