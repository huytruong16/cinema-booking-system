import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CursorPaginationDto } from 'src/libs/common/dto/cursor-pagination.dto';

export class FilterFilmDto extends CursorPaginationDto {
  @ApiProperty({ required: false, description: 'Mã định dạng phim' })
  @IsOptional()
  @IsUUID()
  @IsString()
  MaDinhDang?: string;

  @ApiProperty({ required: false, description: 'Mã thể loại phim' })
  @IsOptional()
  @IsUUID()
  @IsString()
  MaTheLoai?: string;

  @ApiProperty({ required: false, description: 'Mã nhãn phim' })
  @IsOptional()
  @IsUUID()
  @IsString()
  MaNhanPhim?: string;

  @ApiProperty({ required: false, description: 'Mã ngôn ngữ' })
  @IsOptional()
  @IsUUID()
  @IsString()
  MaNgonNgu?: string;
}
