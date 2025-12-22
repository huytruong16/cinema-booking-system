import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsUUID } from 'class-validator';
import PermissionEnum from 'src/libs/common/enums/permission.enum';

export class UpdateGroupPermissionsDto {
    @ApiProperty({ example: 'a1b2c3d4-f567-8901-2345-67890abcdef1', description: 'UUID của nhóm người dùng' })
    @IsUUID()
    groupId: string;

    @ApiProperty({
        example: ['BANVE', 'HOANVE', 'QLPHIM'],
        description: 'Danh sách quyền áp dụng cho nhóm',
        isArray: true,
        enum: PermissionEnum,
    })
    @IsArray()
    @IsEnum(PermissionEnum, { each: true })
    permissions: PermissionEnum[];
}
