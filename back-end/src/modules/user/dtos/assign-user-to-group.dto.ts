import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignUserToGroupDto {
  @ApiProperty({
    example: 'b8c1d2e3-f456-7890-1234-56789abcdef0',
    description: 'UUID của người dùng cần gán vào nhóm',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 'a1b2c3d4-f567-8901-2345-67890abcdef1',
    description: 'UUID của nhóm người dùng',
  })
  @IsUUID()
  groupId: string;
}
