import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateShowtimeDto {
    @ApiProperty({ example: 'uuid-phien-ban-phim' })
    @IsUUID()
    @IsNotEmpty()
    MaPhienBanPhim: string;

    @ApiProperty({ example: 'uuid-phong-chieu' })
    @IsUUID()
    @IsNotEmpty()
    MaPhongChieu: string;

    @ApiProperty({ example: '2025-12-20T09:00:00Z' })
    @IsDateString()
    ThoiGianBatDau: string;

    @ApiProperty({ example: '2025-12-20T11:00:00Z' })
    @IsDateString()
    ThoiGianKetThuc: string;
}
