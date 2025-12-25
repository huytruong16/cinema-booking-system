import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Matches } from 'class-validator';

export class CreateRefundRequestDto {
  @ApiProperty({
    description: 'Mã hóa đơn',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'Mỗi mã hóa đơn phải là UUID v4 hợp lệ' })
  MaHoaDon: string;

  @ApiProperty({
    description: 'Lý do hoàn vé',
    example: 'Khách hàng có việc bận',
  })
  @IsString({ message: 'Lý do hoàn vé phải là chuỗi ký tự' })
  LyDo: string;

  @ApiProperty({
    description: 'Mã ngân hàng',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'Mã ngân hàng phải là UUID v4 hợp lệ' })
  MaNganHang?: string;

  @ApiProperty({ description: 'Số tài khoản', example: '123456789' })
  @Matches(/^\d+$/, { message: 'Số tài khoản phải là chuỗi ký tự số' })
  @IsString({ message: 'Số tài khoản phải là chuỗi ký tự' })
  SoTaiKhoan?: string;

  @ApiProperty({ description: 'Tên chủ tài khoản', example: 'Nguyen Van A' })
  @IsString({ message: 'Chủ tài khoản phải là chuỗi ký tự' })
  ChuTaiKhoan?: string;
}
