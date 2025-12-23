import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TransactionStatusEnum } from 'src/libs/common/enums';

export class UpdateRefundTransactionStatusDto {
  @ApiProperty({
    description: 'Trạng thái mới của giao dịch',
    example: 'THANHCONG',
  })
  @IsEnum(TransactionStatusEnum, {
    message: 'Trạng thái giao dịch không hợp lệ',
  })
  TrangThai: TransactionStatusEnum;
}
