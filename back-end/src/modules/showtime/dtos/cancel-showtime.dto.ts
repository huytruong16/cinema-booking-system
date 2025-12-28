import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CancelShowtimeDto {
  @ApiProperty({
    description: 'Lý do hủy suất chiếu',
    example: 'Phòng chiếu bị hỏng',
  })
  @IsOptional()
  @IsString()
  LyDo?: string;
}
