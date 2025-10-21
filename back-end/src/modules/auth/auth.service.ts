import { Injectable, UnauthorizedException, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/config/redis.service';
import bcryptUtil from '../../libs/common/utils/bcrypt.util';
import { MailService } from '../mail/mail.service';

import { LoginDto, RegisterDto, ResetPasswordDto, VerifyOtpDto, VerifyResetOtpDto, ForgotPasswordDto } from './dtos';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
        private readonly mailService: MailService,
    ) { }

    async login(dto: LoginDto) {
        const { email, password } = dto;
        const user = await this.prisma.nGUOIDUNGPHANMEM.findUnique({ where: { Email: dto.email }, });

        if (!user || !(await bcryptUtil.comparePassword(password, user.MatKhau))) {
            throw new UnauthorizedException('Email hoặc mật khẩu không chính xác.');
        }

        if (user.TrangThai === 'CHUAKICHHOAT') {
            throw new ForbiddenException('Tài khoản chưa xác minh email.');
        }

        const payload = { id: user.MaNguoiDung, email: user.Email };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign({ id: user.MaNguoiDung }, { expiresIn: '7d' });

        return { accessToken, refreshToken };
    }

    async register(dto: RegisterDto) {
        const { email, password, fullName } = dto;
        const existing = await this.prisma.nGUOIDUNGPHANMEM.findUnique({ where: { Email: email } });
        const hashed = await bcryptUtil.hashPassword(password);

        let user;
        if (existing) {
            if (existing.TrangThai !== 'CHUAKICHHOAT') throw new ConflictException('Email đã tồn tại.');
            user = await this.prisma.nGUOIDUNGPHANMEM.update({
                where: { Email: email },
                data: { TenTaiKhoan: fullName, MatKhau: hashed },
            });
        } else {
            user = await this.prisma.nGUOIDUNGPHANMEM.create({
                data: { Email: email, TenTaiKhoan: fullName, MatKhau: hashed, TrangThai: 'CHUAKICHHOAT' },
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashOtp = await bcryptUtil.hashPassword(otp);

        await this.redisService.setEx(`otp:${email}`, 300, hashOtp);
        await this.redisService.setEx(`otp_attempts:${email}`, 300, '0');
        await this.mailService.sendMail(email, 'Xác minh tài khoản', `Mã OTP của bạn là: ${otp}`);

        return { message: 'Đăng ký thành công, vui lòng xác minh OTP.' };
    }

    async verifyOtp(dto: VerifyOtpDto) {
        const { email, otp } = dto;
        const hashOtp = await this.redisService.get(`otp:${email}`);
        if (!hashOtp) throw new ForbiddenException('OTP không hợp lệ hoặc đã hết hạn.');

        let attempts = parseInt((await this.redisService.get(`otp_attempts:${email}`)) ?? '0');
        if (attempts >= 5) {
            await this.redisService.del(`otp:${email}`, `otp_attempts:${email}`);
            throw new ForbiddenException('Bạn đã nhập sai OTP quá nhiều lần.');
        }

        const match = await bcryptUtil.comparePassword(otp, hashOtp);
        if (!match) {
            await this.redisService.setEx(`otp_attempts:${email}`, 300, (attempts + 1).toString());
            throw new ForbiddenException(`OTP không đúng (${attempts + 1}/5 lần).`);
        }

        await this.prisma.nGUOIDUNGPHANMEM.update({ where: { Email: email }, data: { TrangThai: 'CONHOATDONG' } });
        await this.redisService.del(`otp:${email}`, `otp_attempts:${email}`);

        return { message: 'Xác minh thành công, bạn có thể đăng nhập.' };
    }

    async forgotPassword(dto: ForgotPasswordDto) {
        const { email } = dto;
        const user = await this.prisma.nGUOIDUNGPHANMEM.findUnique({ where: { Email: email } });
        if (!user) throw new NotFoundException('Email không tồn tại.');

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashOtp = await bcryptUtil.hashPassword(otp);

        await this.redisService.setEx(`reset_otp:${email}`, 300, hashOtp);
        await this.redisService.setEx(`reset_attempts:${email}`, 300, '0');
        await this.mailService.sendMail(email, 'Đặt lại mật khẩu', `Mã OTP của bạn là: ${otp}`);

        return { message: 'OTP đặt lại mật khẩu đã được gửi qua email.' };
    }

    async resetPassword(dto: ResetPasswordDto) {
        const { email, newPassword } = dto;
        const verified = await this.redisService.get(`reset_verified:${email}`);
        if (!verified) throw new ForbiddenException('Bạn chưa xác minh OTP.');

        const hashed = await bcryptUtil.hashPassword(newPassword);
        await this.prisma.nGUOIDUNGPHANMEM.update({ where: { Email: email }, data: { MatKhau: hashed } });
        await this.redisService.del(`reset_verified:${email}`);

        return { message: 'Đặt lại mật khẩu thành công.' };
    }
}
