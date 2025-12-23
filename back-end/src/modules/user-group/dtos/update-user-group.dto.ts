import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserGroupDto {
    @ApiPropertyOptional({
        example: 'Nhân viên bán vé',
        description: 'Tên nhóm người dùng mới',
    })
    @IsOptional()
    @IsString()
    TenNhomNguoiDung?: string;
}
