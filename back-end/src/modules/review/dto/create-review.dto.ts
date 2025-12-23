import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Mã phim cần đánh giá',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'Mã phim không được để trống' })
  @IsUUID('4', { message: 'Mã phim phải là UUID v4 hợp lệ' })
  MaPhim: string;

  @ApiProperty({
    description: 'Nội dung đánh giá',
    example: 'Phim rất hay và đáng xem!',
  })
  @IsNotEmpty({ message: 'Nội dung đánh giá không được để trống' })
  @IsString({ message: 'Nội dung đánh giá phải là chuỗi ký tự' })
  NoiDung: string;

  @ApiProperty({ description: 'Điểm đánh giá (1-10)', example: 8 })
  @IsNotEmpty({ message: 'Điểm đánh giá không được để trống' })
  @IsNumber({}, { message: 'Điểm đánh giá phải là một số' })
  @Min(1, { message: 'Điểm đánh giá phải lớn hơn hoặc bằng 1' })
  @Max(10, { message: 'Điểm đánh giá phải nhỏ hơn hoặc bằng 10' })
  Diem: number;
}
