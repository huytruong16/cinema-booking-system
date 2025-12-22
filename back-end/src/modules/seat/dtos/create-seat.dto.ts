import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches } from "class-validator";

export class CreateSeatDto {
    @ApiProperty({ description: "Hàng", example: "D" })
    @IsString({ message: 'Hàng phải là chuỗi ký tự' })
    Hang: string;

    @ApiProperty({ description: "Cột", example: "05" })
    @IsString({ message: 'Cột phải là chuỗi ký tự' })
    @Matches(/^\d{2}$/, {
        message: 'Cột phải gồm đúng 2 ký tự số (ví dụ: 05, 12)',
    })
    Cot: string;
}