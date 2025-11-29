import { IsOptional, IsString, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FilterFilmDto {
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
