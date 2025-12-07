import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';

export enum RevenueChartRangeEnum {
    WEEK = 'week',
    MONTH = 'month',
    YEAR = 'year'
}

export class GetRevenueChartQueryDto {
    @ApiProperty({
        enum: RevenueChartRangeEnum,
        description: 'Khoảng thời gian'
    })
    @IsEnum(RevenueChartRangeEnum, { message: 'range phải là một trong các giá trị: week, month, year' })
    range: RevenueChartRangeEnum;

    @ApiPropertyOptional({
        description: 'Ngày bất kỳ nằm trong tuần / tháng cần thống kê (ISO), mặc định hôm nay'
    })
    @IsOptional()
    @IsISO8601({}, { message: 'date phải là chuỗi ISO8601 hợp lệ' })
    date?: string;
}
