import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSeatTypeDto {
    @ApiProperty({
        description: 'Tên loại ghế',
        example: 'VIP',
    })
    @IsString()
    @IsNotEmpty()
    LoaiGhe: string;

    @ApiProperty({
        description: 'Hệ số giá ghế',
        example: 1.5,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    HeSoGiaGhe?: number;

    @ApiProperty({
        description: 'Màu sắc',
        example: '#FF5733',
        required: false,
    })
    @IsOptional()
    @IsString()
    MauSac: string;
}
