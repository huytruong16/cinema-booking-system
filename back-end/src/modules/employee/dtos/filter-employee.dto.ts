import { StaffStatusEnum, UserStatusEnum } from 'src/libs/common/enums';
import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterEmployeeDto {
  @IsOptional()
  @IsString()
  fromNgayVaoLam?: string;

  @IsOptional()
  @IsString()
  toNgayVaoLam?: string;

  @IsOptional()
  @IsEnum(StaffStatusEnum)
  TrangThai?: StaffStatusEnum;

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
