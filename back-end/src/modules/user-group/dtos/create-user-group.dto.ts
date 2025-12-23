import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import PermissionEnum from 'src/libs/common/enums/permission.enum';

export class CreateUserGroupDto {
  @ApiProperty({
    example: 'Quản trị hệ thống',
    description: 'Tên nhóm người dùng',
  })
  @IsString()
  TenNhomNguoiDung: string;

  @ApiPropertyOptional({
    example: ['BANVE', 'HOANVE', 'QLPHIM'],
    description: 'Danh sách quyền khởi tạo cho nhóm',
    isArray: true,
    enum: PermissionEnum,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PermissionEnum, { each: true })
  permissions?: PermissionEnum[];
}
