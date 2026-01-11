import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { UserStatusEnum } from 'src/libs/common/enums';

export class FilterCustomerDto {
    @IsOptional()
    @IsString()
    fromCreatedAt?: string;

    @IsOptional()
    @IsString()
    toCreatedAt?: string;

    @IsOptional()
    @IsEnum(UserStatusEnum)
    TrangThaiNguoiDung?: UserStatusEnum;

    @IsOptional()
    @IsString()
    cursor?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;
}
