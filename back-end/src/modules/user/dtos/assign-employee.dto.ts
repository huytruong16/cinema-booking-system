import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsDateString } from 'class-validator';

export class AssignEmployeeDto {
    @ApiProperty({ example: 'nhanvien1@gmail.com' })
    @IsEmail()
    Email: string;

    @ApiProperty({ example: 'NhanVien@123', minLength: 6 })
    @IsNotEmpty()
    @MinLength(6)
    MatKhau: string;

    @ApiProperty({ example: 'Nguyễn Văn B' })
    @IsNotEmpty()
    HoTen: string;

    @ApiProperty({
        example: '2025-01-15',
        description: 'Ngày vào làm (ISO Date)',
    })
    @IsDateString()
    NgayVaoLam: string;
}
