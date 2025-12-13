import { Controller, Get, Param, BadRequestException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { isUUID } from 'class-validator';
import { JwtAuthGuard } from 'src/libs/common/guards/jwt-auth.guard';

@ApiTags('Người dùng')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng (NguoiDungPhanMem)' })
    async getAllUsers() {
        return this.userService.getAllUsers();
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
    async getCurrentUser() {
        return this.userService.getCurrentUser();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết người dùng theo mã' })
    @ApiParam({ name: 'id', description: 'Mã người dùng', required: true })
    async getUserById(@Param('id') id: string) {
        if (!isUUID(id, '4')) throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
        return this.userService.getUserById(id);
    }
}