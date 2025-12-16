import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRatingDto {
    @ApiProperty({
        description: 'Tên nhãn phim',
        example: 'P13',
    })
    @IsString()
    @IsNotEmpty()
    TenNhanPhim: string;

    @ApiProperty({
        description: 'Mô tả nhãn phim',
        example: 'Phim dành cho khán giả từ 13 tuổi trở lên',
        required: false,
    })
    @IsOptional()
    @IsString()
    MoTa?: string;

    @ApiProperty({
        description: 'Độ tuổi tối thiểu',
        example: 13,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    DoTuoiToiThieu?: number;
}
