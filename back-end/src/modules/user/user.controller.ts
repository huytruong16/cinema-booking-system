import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserService } from './user.service';
import { IsUUID } from 'class-validator';

@ApiTags('Người dùng')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng (NguoiDungPhanMem)' })
    async getAllUsers() {
        return this.userService.getAllUsers();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết người dùng theo mã' })
    @ApiParam({ name: 'id', description: 'Mã người dùng', required: true })
    async getUserById(@Param('id') id: string,) {
        return this.userService.getUserById(id);
    }
}