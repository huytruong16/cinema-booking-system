import { Optional } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { CursorPaginationDto } from 'src/libs/common/dto/cursor-pagination.dto';
import { TransactionEnum, TransactionStatusEnum } from 'src/libs/common/enums';

export class GetInvoiceDto extends CursorPaginationDto {
    @ApiPropertyOptional({ description: 'Chuỗi tìm kiểm (mã hóa đơn, email khách hàng)' })
    @IsOptional()
    @IsString({ message: 'Chuỗi tìm kiếm phải là chuỗi ký tự' })
    search?: string;

    @ApiPropertyOptional({ description: 'Trạng thái giao dịch' })
    @IsOptional()
    @IsEnum(TransactionStatusEnum, { message: 'Trạng thái giao dịch không hợp lệ' })
    status?: TransactionStatusEnum;

    @ApiPropertyOptional({ description: 'Thời gian giao dịch' })
    @IsOptional()
    @IsISO8601({}, { message: 'Thời gian không hợp lệ' })
    date?: string;

}
