import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFormatDto {
  @ApiProperty({
    description: 'Tên định dạng phim',
    example: 'IMAX 2D',
  })
  @IsString()
  @IsNotEmpty()
  TenDinhDang: string;

  @ApiProperty({
    description: 'Giá vé cho định dạng này',
    example: 120000,
  })
  @Type(() => Number)
  @IsNumber()
  GiaVe: number;
}
