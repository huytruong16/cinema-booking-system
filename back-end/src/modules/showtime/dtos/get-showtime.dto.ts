import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { ShowtimeStatusEnum } from '../../../libs/common/enums/showtime-status.enum';

export class GetAllShowtimeDto {
    @ApiProperty({
        description: 'Mã phim',
        required: false,
    })
    @IsOptional()
    @IsUUID()
    @IsString()
    MaPhim?: string;

    @ApiProperty({
        description: 'Mã phòng chiếu',
        required: false,
    })
    @IsOptional()
    @IsUUID()
    @IsString()
    MaPhongChieu?: string;

    @ApiProperty({
        description: 'Mã phiên bản phim',
        required: false,
    })
    @IsOptional()
    @IsUUID()
    @IsString()
    MaPhienBanPhim?: string;

    @ApiProperty({
        description: 'Mã định dạng',
        required: false,
    })
    @IsOptional()
    @IsUUID()
    @IsString()
    MaDinhDang?: string;

    @ApiProperty({
        description: 'Mã thể loại',
        required: false,
    })
    @IsOptional()
    @IsUUID()
    @IsString()
    MaTheLoai?: string;

    @ApiProperty({
        description: 'Trạng thái suất chiếu',
        required: false,
        enum: ShowtimeStatusEnum,
    })
    @IsOptional()
    @IsEnum(ShowtimeStatusEnum)
    TrangThai?: ShowtimeStatusEnum;

    @ApiProperty({
        description: 'Ngày bắt đầu lọc (ISO 8601)',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    TuNgay?: string;

    @ApiProperty({
        description: 'Ngày kết thúc lọc (ISO 8601)',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    DenNgay?: string;
}
