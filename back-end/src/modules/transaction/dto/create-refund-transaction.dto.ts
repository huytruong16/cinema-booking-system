import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayMinSize, IsEnum } from 'class-validator';
import { TransactionEnum } from 'src/libs/common/enums';

export class CreateRefundTransactionDto {
    @ApiProperty({ description: 'Danh sách mã yêu cầu hoàn vé cần xử lý' })
    @IsArray()
    @ArrayMinSize(1)
    @IsUUID('4', { each: true })
    MaYeuCaus: string[];

    @ApiProperty({ description: 'Phương thức giao dịch (TRUCTIEP, TRUCTUYEN)' })
    @IsEnum(TransactionEnum, { message: 'Phương thức giao dịch không hợp lệ' })
    PhuongThuc: TransactionEnum;
}