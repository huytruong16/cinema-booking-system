import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional } from 'class-validator';

export enum TopStaffRangeEnum {
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
    YEAR = 'year'
}

export class GetTopStaffQueryDto {
    @ApiProperty({ enum: TopStaffRangeEnum })
    @IsEnum(TopStaffRangeEnum, { message: 'range phải là một trong các giá trị: day, week, month, year' })
    range: TopStaffRangeEnum = TopStaffRangeEnum.DAY;

    @ApiPropertyOptional({ description: 'Một ngày trong khoảng thời gian lập báo cáo' })
    @IsOptional()
    @IsISO8601({}, { message: 'date phải là chuỗi ISO8601 hợp lệ' })
    date?: string;
}
