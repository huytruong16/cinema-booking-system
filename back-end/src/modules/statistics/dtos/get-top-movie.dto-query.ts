import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional } from "class-validator";

export enum TopMovieRangeEnum {
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
    YEAR = 'year',
    ALL = 'all',
}

export class GetTopMovieDto {
    @ApiPropertyOptional({ description: 'Số lượng phim' })
    @IsOptional()
    @IsNumber({}, { message: 'Số lượng phim phải là một số' })
    limit?: number = 5;

    @ApiPropertyOptional({ description: 'Khoảng thời gian thống kê: day, week, month, year, all' })
    @IsEnum(TopMovieRangeEnum, { message: 'Khoảng thời gian phải là một trong các giá trị: day, week, month, year, all' })
    range: TopMovieRangeEnum = TopMovieRangeEnum.DAY;
}