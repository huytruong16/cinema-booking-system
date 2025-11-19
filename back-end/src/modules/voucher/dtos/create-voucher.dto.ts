import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import DiscountTypeEnum from 'src/libs/common/enums/discount-type.enum';
import DiscountStatusEnum from 'src/libs/common/enums/discount-status.enum';

export class CreateVoucherDto {
    @ApiProperty({ example: 'Khuyến mãi VIP', description: 'Tên khuyến mãi' })
    @IsString({ message: 'Tên khuyến mãi phải là chuỗi' })
    TenKhuyenMai: string;

    @ApiPropertyOptional({ example: 'Giảm giá cuối năm cho khách hàng VIP', description: 'Mô tả khuyến mãi' })
    @IsOptional()
    @IsString({ message: 'Mô tả phải là chuỗi' })
    MoTa?: string;

    @ApiProperty({ example: 'VIP1K30', description: 'Mã code voucher' })
    @IsString({ message: 'Code phải là chuỗi' })
    Code: string;

    @ApiProperty({ example: DiscountTypeEnum.CODINH, enum: DiscountTypeEnum, description: 'Loại giảm giá' })
    @IsEnum(DiscountTypeEnum, { message: 'Loại giảm giá không hợp lệ' })
    LoaiGiamGia: DiscountTypeEnum;

    @ApiProperty({ example: 30000, description: 'Giá trị giảm' })
    @IsNumber({}, { message: 'Giá trị phải là số' })
    GiaTri: number;

    @ApiProperty({ example: 100, description: 'Số lượng mã voucher' })
    @IsNumber({}, { message: 'Số lượng mã phải là số' })
    SoLuongMa: number;

    @ApiProperty({ example: 0, description: 'Số lượng mã đã sử dụng' })
    @IsNumber({}, { message: 'Số lượng sử dụng phải là số' })
    SoLuongSuDung: number;

    @ApiPropertyOptional({ example: 50000, description: 'Giá trị đơn tối thiểu áp dụng voucher' })
    @IsOptional()
    @IsNumber({}, { message: 'Giá trị đơn tối thiểu phải là số' })
    GiaTriDonToiThieu?: number;

    @ApiPropertyOptional({ example: 100000, description: 'Giá trị giảm tối đa' })
    @IsOptional()
    @IsNumber({}, { message: 'Giá trị giảm tối đa phải là số' })
    GiaTriGiamToiDa?: number;

    @ApiProperty({ example: '2025-10-29T00:00:00.000Z', description: 'Ngày bắt đầu khuyến mãi (ISO string)' })
    @IsDateString({}, { message: 'Ngày bắt đầu phải là định dạng ngày hợp lệ' })
    NgayBatDau: string;

    @ApiProperty({ example: '2026-02-20T23:59:59.000Z', description: 'Ngày kết thúc khuyến mãi (ISO string)' })
    @IsDateString({}, { message: 'Ngày kết thúc phải là định dạng ngày hợp lệ' })
    NgayKetThuc: string;

    @ApiProperty({ example: DiscountStatusEnum.CONHOATDONG, enum: DiscountStatusEnum, description: 'Trạng thái voucher' })
    @IsEnum(DiscountStatusEnum, { message: 'Trạng thái không hợp lệ' })
    TrangThai: DiscountStatusEnum;
}
