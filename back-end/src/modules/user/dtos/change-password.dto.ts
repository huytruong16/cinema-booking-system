import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
    @ApiProperty({
        description: 'Mật khẩu hiện tại của người dùng',
        example: 'OldPassword@123',
    })
    @IsNotEmpty()
    MatKhauCu: string;

    @ApiProperty({
        description: 'Mật khẩu mới (tối thiểu 6 ký tự)',
        example: 'NewPassword@123',
        minLength: 6,
    })
    @IsNotEmpty()
    @MinLength(6)
    MatKhauMoi: string;
}
