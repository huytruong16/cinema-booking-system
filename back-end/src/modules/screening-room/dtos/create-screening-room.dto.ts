import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsObject, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class CreateSeatScreeningRoomDto {
    @ApiProperty({ description: "Hàng ghế", example: "A" })
    @IsString({ message: "Hàng ghế phải là chuỗi ký tự" })
    Hang: string;

    @ApiProperty({ description: "Cột ghế", example: "01" })
    @IsString({ message: "Cột ghế phải là chuỗi ký tự" })
    Cot: string;

    @ApiProperty({ description: "Mã loại ghế", example: "TRONG" })
    @IsUUID("4", { message: "Mã loại ghế phải là UUID v4 hợp lệ" })
    MaLoaiGhe: string;
}

export class CreateScreeningRoomDto {
    @ApiProperty({ description: "Tên phòng chiếu", example: "Phòng chiếu 1" })
    @IsString({ message: "Tên phòng chiếu phải là chuỗi ký tự" })
    TenPhongChieu: string;

    @ApiProperty({
        description: "Sơ đồ phòng chiếu", example: {
            "A": ["01", "02", "03", "04", "", "", "05", "06", "07", "", "08", "", "", "09", "10"],
            "B": ["01", "02", "03", "04", "", "", "05", "06", "07", "08", "", "09", "10", "", ""],
            "C": ["01", "02", "03", "", "", "04", "05", "06", "07", "", "08", "09", "10", "", ""],
            "D": ["01", "02", "03", "04", "", "", "", "05", "06", "07", "", "08", "09", "10", ""],
            "E": ["01", "02", "03", "04", "", "", "05", "06", "07", "08", "", "09", "10", "", ""],
            "F": ["01", "02", "03", "04", "", "", "05", "06", "07", "08", "", "09", "10", "", ""],
            "G": ["01", "01", "", "", "02", "02", "", "", "03", "03", "", "", "", "04", "04"]
        }
    })
    @IsObject({ message: "Sơ đồ phòng chiếu phải là một đối tượng JSON" })
    SoDoPhongChieu: object;

    @ApiProperty({ description: "Danh sách ghế trong phòng chiếu", type: [CreateSeatScreeningRoomDto], example: [{ Hang: "A", Cot: "01", MaLoaiGhe: "550e8400-e29b-41d4-a716-446655440000" }, { Hang: "A", Cot: "02", MaLoaiGhe: "550e8400-e29b-41d4-a716-446655440000" }] })
    @IsArray({ message: "Danh sách ghế phải là một mảng" })
    @ValidateNested({ each: true })
    @Type(() => CreateSeatScreeningRoomDto)
    DanhSachGhe: CreateSeatScreeningRoomDto[];
}