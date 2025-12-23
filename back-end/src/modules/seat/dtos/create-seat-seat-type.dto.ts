import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateSeatSeatTypeDto {
  @ApiProperty({
    description: 'Mã ghế',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'Mã ghế phải là UUID v4 hợp lệ' })
  MaGhe: string;

  @ApiProperty({
    description: 'Mã loại ghế',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'Mã loại ghế phải là UUID v4 hợp lệ' })
  MaLoaiGhe: string;
}
