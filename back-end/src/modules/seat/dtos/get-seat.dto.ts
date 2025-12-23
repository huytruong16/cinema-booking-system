import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetSeatsDto {
  @ApiPropertyOptional({ description: 'Mã loại ghế để lọc (tùy chọn)' })
  @IsOptional()
  @IsUUID()
  MaLoaiGhe?: string;
}
