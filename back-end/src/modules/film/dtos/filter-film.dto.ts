import { IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FilterFilmDto {
    @ApiProperty({ required: false, description: 'Mã định dạng phim' })
    @IsOptional()
    @IsString()
    MaDinhDang?: string;

    @ApiProperty({ required: false, description: 'Mã thể loại phim' })
    @IsOptional()
    @IsString()
    MaTheLoai?: string;

    @ApiProperty({ required: false, description: 'Mã nhãn phim' })
    @IsOptional()
    @IsString()
    MaNhanPhim?: string;

    @ApiProperty({ required: false, description: 'Mã ngôn ngữ' })
    @IsOptional()
    @IsString()
    MaNgonNgu?: string;
}
