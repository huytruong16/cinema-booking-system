import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional } from 'class-validator';

export enum SummaryModeEnum {
    day = 'day',
    week = 'week',
    month = 'month',
    year = 'year',
}

export class GetSummaryQueryDto {
    @ApiPropertyOptional({
        description: 'ISO date string, mặc định hôm nay',
        example: '2025-01-31',
    })
    @IsOptional()
    @IsISO8601({}, { message: 'date phải là chuỗi ISO8601 hợp lệ' })
    date?: string;

    @ApiPropertyOptional({
        description: 'Khoảng thống kê',
        enum: SummaryModeEnum,
        default: SummaryModeEnum.day,
    })
    @IsOptional()
    @IsEnum(SummaryModeEnum, { message: 'mode phải là một trong các giá trị: day, week, month, year' })
    mode: SummaryModeEnum = SummaryModeEnum.day;
}
