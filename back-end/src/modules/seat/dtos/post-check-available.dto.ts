import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class SeatCheckRequestDto {
    @ApiProperty({ description: 'Mã ghế suất chiếu', required: true, example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsUUID('4', { message: 'Mã ghế suất chiếu phải là UUID v4 hợp lệ' })
    MaGheSuatChieu: string;
}

export class SeatCheckResponseDto {
    ConTrong: boolean;
}