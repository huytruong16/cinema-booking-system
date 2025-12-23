import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TransactionEnum } from 'src/libs/common/enums';

class ComboDto {
  @ApiProperty({
    description: 'Mã combo',
    example: 'c1d2e3f4-a5b6-7890-cdef-ab1234567890',
  })
  @IsUUID('4', { message: 'Mã combo phải là UUID v4 hợp lệ' })
  MaCombo: string;

  @ApiProperty({ description: 'Số lượng combo', example: 1 })
  SoLuong: number;
}

export class CreateInvoiceDto {
  @ApiProperty({
    description: 'Email khách hàng',
    example: 'customer@example.com',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsOptional()
  Email?: string;

  @ApiProperty({ description: 'Loại giao dịch', example: 'TRUCTIEP' })
  @IsEnum(TransactionEnum, {
    message: 'Loại giao dịch phải là TRUCTIEP hoặc TRUCTUYEN',
  })
  LoaiGiaoDich: TransactionEnum = TransactionEnum.TRUCTUYEN;

  @ApiProperty({
    description: 'Danh sách mã ghế suất chiếu',
    example: [
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      'b1c2d3e4-f5a6-7890-bcde-fa1234567890',
    ],
  })
  @IsArray({ message: 'Danh sách mã ghế suất chiếu phải là một mảng' })
  @IsUUID('4', {
    each: true,
    message: 'Mã ghế suất chiếu phải là UUID v4 hợp lệ',
  })
  MaGheSuatChieus: string[];

  @ApiProperty({
    description: 'Danh sách mã combo (nếu có)',
    example: [{ MaCombo: 'c1d2e3f4-a5b6-7890-cdef-ab1234567890', SoLuong: 1 }],
  })
  @IsArray({ message: 'Danh sách mã combo phải là một mảng' })
  @IsOptional()
  Combos?: ComboDto[];

  @ApiProperty({
    description: 'Danh sách mã giảm giá người dùng (nếu có)',
    example: ['c1a2u3c4h5e6r7-890ab-cdef-1234567890ab'],
  })
  @IsArray({ message: 'Danh sách mã giảm giá người dùng phải là một mảng' })
  @IsOptional()
  MaVouchers?: string[];
}
