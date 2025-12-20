import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayMinSize, IsEnum } from 'class-validator';
import { TransactionEnum } from 'src/libs/common/enums';

export class CreateRefundTransactionDto {
    @ApiProperty({ description: 'Mã yêu cầu hoàn vé cần xử lý', example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsUUID('4', { message: 'Mỗi mã yêu cầu hoàn vé phải là UUID v4 hợp lệ' })
    MaYeuCau: string;

    @ApiProperty({ description: 'Phương thức giao dịch (TRUCTIEP, TRUCTUYEN)', example: TransactionEnum.TRUCTUYEN })
    @IsEnum(TransactionEnum, { message: 'Phương thức giao dịch không hợp lệ' })
    PhuongThuc: TransactionEnum;
}