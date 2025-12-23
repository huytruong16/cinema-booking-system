import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import StaffStatusEnum from 'src/libs/common/enums/staff-status.enum';

export class UpdateEmployeeDto {
  @ApiPropertyOptional({
    example: '2024-01-15',
    description: 'Ngày vào làm của nhân viên',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày vào làm không đúng định dạng ISO' })
  NgayVaoLam?: string;

  @ApiPropertyOptional({
    example: StaffStatusEnum.DANGHI,
    enum: StaffStatusEnum,
    description: 'Trạng thái làm việc của nhân viên',
  })
  @IsOptional()
  @IsEnum(StaffStatusEnum, { message: 'Trạng thái nhân viên không hợp lệ' })
  TrangThai?: StaffStatusEnum;
}
