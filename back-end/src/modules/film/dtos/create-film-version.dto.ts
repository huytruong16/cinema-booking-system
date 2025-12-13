import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateFilmVersionDto {
    @ApiProperty({ description: 'ID phim' })
    @IsNotEmpty()
    @IsString()
    MaPhim: string;

    @ApiProperty({ description: 'ID định dạng' })
    @IsNotEmpty()
    @IsString()
    MaDinhDang: string;

    @ApiProperty({ description: 'ID ngôn ngữ' })
    @IsNotEmpty()
    @IsString()
    MaNgonNgu: string;

    @ApiProperty({ description: 'Giá vé' })
    @IsNotEmpty()
    @IsNumber()
    GiaVe: number;
}
