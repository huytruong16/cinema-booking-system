import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateScreeningRoomDto } from './create-screening-room.dto';
import { ScreeningRoomStatusEnum } from 'src/libs/common/enums';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateScreeningRoomDto extends PartialType(
  CreateScreeningRoomDto,
) {
  @ApiPropertyOptional({
    description: 'Trạng thái phòng chiếu',
    enum: ScreeningRoomStatusEnum,
    example: ScreeningRoomStatusEnum.DANGCHIEU,
  })
  @IsOptional()
  @IsEnum(ScreeningRoomStatusEnum)
  TrangThai: ScreeningRoomStatusEnum;
}
