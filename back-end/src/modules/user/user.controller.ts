import { Controller, Get, Param, BadRequestException, UseGuards, Patch, Body, UseInterceptors, UploadedFile, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { isUUID } from 'class-validator';
import { JwtAuthGuard } from 'src/libs/common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';

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

    @Patch('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cập nhật thông tin cá nhân (có thể cập nhật một phần)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Thông tin người dùng cập nhật và avatar mới (tùy chọn)',
        schema: {
            type: 'object',
            properties: {
                HoTen: {
                    type: 'string',
                    example: 'Nguyễn Văn A',
                    description: 'Họ tên người dùng',
                },
                SoDienThoai: {
                    type: 'string',
                    example: '0909123456',
                    description: 'Số điện thoại',
                },
                avatarFile: {
                    type: 'string',
                    format: 'binary',
                    description: 'Ảnh đại diện mới (jpg, jpeg, png, webp)',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('avatarFile'))
    @ApiResponse({ status: 200, description: 'Cập nhật thông tin cá nhân thành công.' })
    @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc token không hợp lệ.' })
    @ApiResponse({ status: 404, description: 'Người dùng không tồn tại.' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
    async updateProfile(
        @Body() dto: UpdateProfileDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.userService.updateProfile(dto, file);
    }

    @Post('change-password')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Đổi mật khẩu người dùng hiện tại' })
    @ApiBody({
        description: 'Nhập mật khẩu hiện tại và mật khẩu mới',
        type: ChangePasswordDto,
    })
    @ApiResponse({ status: 200, description: 'Đổi mật khẩu thành công' })
    @ApiResponse({ status: 401, description: 'Mật khẩu hiện tại không đúng hoặc chưa đăng nhập' })
    @ApiResponse({ status: 404, description: 'Người dùng không tồn tại' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    async changePassword(@Body() dto: ChangePasswordDto) {
        return this.userService.changePassword(dto);
    }
}