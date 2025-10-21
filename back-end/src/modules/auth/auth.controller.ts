import { Body, Controller, Post, Res, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoginDto, RegisterDto, VerifyOtpDto, ForgotPasswordDto, ResetPasswordDto } from './dtos';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'Đăng nhập người dùng' })
    async login(@Body() dto: LoginDto, @Res() res: Response) {
        const { accessToken, refreshToken } = await this.authService.login(dto);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        return res.json({ accessToken });
    }

    // @Get('refresh')
    // @ApiOperation({ summary: 'Làm mới access token' })
    // async refresh(@Req() req: Request) {
    //     const refreshToken = req.cookies?.refreshToken;
    //     return this.authService.refreshAccessToken(refreshToken);
    // }

    @Post('register')
    @ApiOperation({ summary: 'Đăng ký người dùng mới' })
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('verify-otp')
    @ApiOperation({ summary: 'Xác minh OTP đăng ký' })
    async verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.authService.verifyOtp(dto);
    }

    @Post('forgot-password')
    @ApiOperation({ summary: 'Gửi OTP quên mật khẩu' })
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto);
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Đặt lại mật khẩu mới' })
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }
}
