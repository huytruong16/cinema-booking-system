import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class UpdateRefundRequestDto {
    @ApiPropertyOptional({ description: 'Lý do hoàn vé', example: 'Khách hàng có việc bận' })
    @IsOptional()
    @IsString({ message: 'Lý do hoàn vé phải là chuỗi ký tự' })
    LyDoHoan?: string;

    @ApiPropertyOptional({ description: 'Mã ngân hàng', example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsOptional()
    @IsUUID('4', { message: 'Mã ngân hàng phải là UUID v4 hợp lệ' })
    MaNganHang?: string;

    @ApiPropertyOptional({ description: 'Số tài khoản', example: '123456789' })
    @IsOptional()
    @Matches(/^[0-9]+$/, { message: 'Số tài khoản phải là chuỗi ký tự số' })
    @IsString({ message: 'Số tài khoản phải là chuỗi ký tự' })
    SoTaiKhoan?: string;

    @ApiPropertyOptional({ description: 'Tên chủ tài khoản', example: 'Nguyen Van A' })
    @IsOptional()
    @IsString({ message: 'Chủ tài khoản phải là chuỗi ký tự' })
    TenChuTaiKhoan?: string;
}
