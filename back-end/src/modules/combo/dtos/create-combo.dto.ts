import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsUrl } from 'class-validator';
import ComboStatusEnum from 'src/libs/common/enums/combo-status.enum';
import { Type } from 'class-transformer';

export class CreateComboDto {
    @ApiProperty({ example: 'Combo Solo', description: 'Tên combo' })
    @IsString({ message: 'Tên combo phải là chuỗi' })
    TenCombo: string;

    @ApiPropertyOptional({ example: '1 bắp rang bơ + 1 nước ngọt', description: 'Mô tả combo' })
    @IsOptional()
    @IsString({ message: 'Mô tả phải là chuỗi' })
    MoTa?: string;

    @ApiProperty({ example: 60000, description: 'Giá tiền combo' })
    @IsNumber({}, { message: 'Giá tiền phải là số' })
    @Type(() => Number)
    GiaTien: number;

    @ApiProperty({ example: ComboStatusEnum.CONHANG, enum: ComboStatusEnum, description: 'Trạng thái combo' })
    @IsEnum(ComboStatusEnum, { message: 'Trạng thái không hợp lệ' })
    TrangThai: ComboStatusEnum;
    @IsOptional()
    comboFile?: any;
}
