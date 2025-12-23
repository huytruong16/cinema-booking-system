import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TransactionEnum } from 'src/libs/common/enums';

export class UpdateTransactionMethodDto {
  @ApiProperty({ description: 'Phương thức giao dịch', example: 'TRUCTIEP' })
  @IsEnum(TransactionEnum, {
    message: 'Phương thức giao dịch phải là TRUCTIEP hoặc TRUCTUYEN',
  })
  PhuongThuc: TransactionEnum;
}
