import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { ShowtimeStatusEnum } from "src/libs/common/enums";
import { Transform } from "class-transformer";
import { BadRequestException } from "@nestjs/common/exceptions/bad-request.exception";

export class GetShowtimeByMovieDto {
    @ApiProperty({
        description: 'Trạng thái suất chiếu (DANGCHIEU, DACHIEU, SAPCHIEU, DAHUY, CHUACHIEU) — phải gửi chuỗi phân tách dấu phẩy (ví dụ "DANGCHIEU, CHUACHIEU"), mặc định CHUACHIEU',
        required: false,
    })
    @IsOptional()
    @Transform(({ value }) => {
        const valueList = String(value).split(',').map((v) => v.trim());
        const validValues = Object.values(ShowtimeStatusEnum).map(v => String(v));
        const filtered = valueList.every((v) => validValues.includes(v));
        if (!filtered) {
            throw new BadRequestException({ message: 'Trạng thái suất chiếu không hợp lệ' });
        }
        return valueList.map(v => ShowtimeStatusEnum[v.trim()]) as ShowtimeStatusEnum[];
    })
    @IsEnum(ShowtimeStatusEnum, { each: true, message: 'Trạng thái suất chiếu không hợp lệ' })
    TrangThai?: ShowtimeStatusEnum[] = [ShowtimeStatusEnum.CHUACHIEU];

    @ApiProperty({
        description: 'Ngày chiếu (ISO 8601)',
        required: false,
    })
    @IsOptional()
    @IsDateString({}, { message: 'Ngày chiếu phải có định dạng ISO 8601' })
    NgayChieu?: string;
}