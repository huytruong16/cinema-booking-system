import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateGenreDto {

    @ApiProperty({
        description: 'Tên thể loại phim',
        example: 'Khoa học viễn tưởng'
    })
    @IsString()
    @IsNotEmpty()
    TenTheLoai: string;

}
