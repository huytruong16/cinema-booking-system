import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { RefundRequestStatusEnum } from 'src/libs/common/enums';

export class UpdateRefundRequestStatusDto {
  @ApiProperty({
    description: 'Trạng thái mới của yêu cầu hoàn vé',
    example: 'DAHOAN',
  })
  @IsEnum(RefundRequestStatusEnum, {
    message: 'Trạng thái yêu cầu hoàn vé không hợp lệ',
  })
  TrangThai: RefundRequestStatusEnum;
}
