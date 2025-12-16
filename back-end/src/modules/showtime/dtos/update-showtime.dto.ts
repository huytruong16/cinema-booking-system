import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { ShowtimeStatusEnum } from '../../../libs/common/enums/showtime-status.enum';
import { CreateShowtimeDto } from './create-showtime.dto';

export class UpdateShowtimeDto extends PartialType(CreateShowtimeDto) {
    @ApiProperty({
        enum: ShowtimeStatusEnum,
        example: ShowtimeStatusEnum.DANGCHIEU,
    })
    @IsOptional()
    @IsEnum(ShowtimeStatusEnum)
    TrangThai: ShowtimeStatusEnum;
}

