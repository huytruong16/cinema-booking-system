import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional } from 'class-validator';

export enum SummaryRangeEnum {
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
        enum: SummaryRangeEnum,
        default: SummaryRangeEnum.day,
    })
    @IsOptional()
    @IsEnum(SummaryRangeEnum, { message: 'range phải là một trong các giá trị: day, week, month, year' })
    range: SummaryRangeEnum = SummaryRangeEnum.day;
}
