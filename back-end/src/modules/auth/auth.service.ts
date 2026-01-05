import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/config/redis.service';
import bcryptUtil from '../../libs/common/utils/bcrypt.util';
import { MailService } from '../mail/mail.service';

import {
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyOtpDto,
  VerifyResetOtpDto,
  ForgotPasswordDto,
} from './dtos';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
  ) {}

  async login(dto: LoginDto) {
    const { email, matkhau } = dto;
    const user = await this.prisma.nGUOIDUNGPHANMEM.findUnique({
      where: { Email: email },
      include: {
        KhachHangs: true,
      },
    });

    if (!user || !(await bcryptUtil.comparePassword(matkhau, user.MatKhau))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác.');
    }

    if (user.TrangThai === 'CHUAKICHHOAT') {
      throw new ForbiddenException('Tài khoản chưa xác minh email.');
    }

    let maKhachHang: string | null = null;

    if (user.VaiTro === 'KHACHHANG') {
      const customer = user.KhachHangs?.[0];

      if (!customer) {
        throw new ForbiddenException(
          'Tài khoản khách hàng chưa được khởi tạo đầy đủ',
        );
      }

      maKhachHang = customer.MaKhachHang;
    }

    const payload = {
      id: user.MaNguoiDung,
      email: user.Email,
      vaitro: user.VaiTro,
      customerId: maKhachHang,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { id: user.MaNguoiDung },
      { expiresIn: '7d' },
    );

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify<{ id: string }>(refreshToken);
      const user = await this.prisma.nGUOIDUNGPHANMEM.findUnique({
        where: { MaNguoiDung: decoded.id },
      });

      if (!user) throw new NotFoundException('Người dùng không tồn tại.');

      const payload = {
        id: user.MaNguoiDung,
        email: user.Email,
        vaitro: user.VaiTro,
      };
      return {
        accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      };
    } catch {
      throw new ForbiddenException('Refresh token không hợp lệ.');
    }
  }

  async register(dto: RegisterDto) {
    const { email, hoTen, matkhau } = dto;
    const existing = await this.prisma.nGUOIDUNGPHANMEM.findUnique({
      where: { Email: email },
    });
    const hashed = await bcryptUtil.hashPassword(matkhau);

    if (existing) {
      if (existing.TrangThai !== 'CHUAKICHHOAT')
        throw new ConflictException('Email đã tồn tại.');
      await this.prisma.nGUOIDUNGPHANMEM.update({
        where: { Email: email },
        data: { HoTen: hoTen, MatKhau: hashed },
      });
    } else {
      await this.prisma.nGUOIDUNGPHANMEM.create({
        data: { Email: email, HoTen: hoTen, MatKhau: hashed },
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashOtp = await bcryptUtil.hashPassword(otp);

    await this.redisService.setEx(`otp:${email}`, 300, hashOtp);
    await this.redisService.setEx(`otp_attempts:${email}`, 300, '0');
    void this.mailService.sendOTPEmail(
      email,
      'Xác minh tài khoản',
      `${otp}`,
      hoTen,
      'register',
    );

    return { message: 'Đăng ký thành công, vui lòng xác minh OTP.' };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const { email, otp } = dto;
    const hashOtp = await this.redisService.get(`otp:${email}`);
    if (!hashOtp)
      throw new ForbiddenException('OTP không hợp lệ hoặc đã hết hạn.');

    const attempts = parseInt(
      (await this.redisService.get(`otp_attempts:${email}`)) ?? '0',
    );
    if (attempts >= 5) {
      await this.redisService.del(`otp:${email}`, `otp_attempts:${email}`);
      throw new ForbiddenException('Bạn đã nhập sai OTP quá nhiều lần.');
    }

    const match = await bcryptUtil.comparePassword(otp, hashOtp);
    if (!match) {
      await this.redisService.setEx(
        `otp_attempts:${email}`,
        300,
        (attempts + 1).toString(),
      );
      throw new ForbiddenException(`OTP không đúng (${attempts + 1}/5 lần).`);
    }

    const user = await this.prisma.nGUOIDUNGPHANMEM.update({
      where: { Email: email },
      data: { TrangThai: 'CONHOATDONG' },
    });

    if (user.VaiTro === 'KHACHHANG') {
      const existedCustomer = await this.prisma.kHACHHANG.findFirst({
        where: { MaNguoiDung: user.MaNguoiDung },
      });

      if (!existedCustomer) {
        await this.prisma.kHACHHANG.create({
          data: {
            MaNguoiDung: user.MaNguoiDung,
            CreatedAt: new Date(),
          },
        });
      }
    }
    await this.redisService.del(`otp:${email}`, `otp_attempts:${email}`);

    return { message: 'Xác minh thành công, bạn có thể đăng nhập.' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto;
    const user = await this.prisma.nGUOIDUNGPHANMEM.findUnique({
      where: { Email: email },
    });
    if (!user) throw new NotFoundException('Email không tồn tại.');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashOtp = await bcryptUtil.hashPassword(otp);

    await this.redisService.setEx(`reset_otp:${email}`, 300, hashOtp);
    await this.redisService.setEx(`reset_attempts:${email}`, 300, '0');
    void this.mailService.sendOTPEmail(
      email,
      'Đặt lại mật khẩu',
      `${otp}`,
      user.HoTen,
      'forgot-password',
    );

    return { message: 'OTP đặt lại mật khẩu đã được gửi qua email.' };
  }

  async verifyResetOtp(dto: VerifyResetOtpDto) {
    const { email, otp } = dto;
    const hashOtp = await this.redisService.get(`reset_otp:${email}`);
    if (!hashOtp)
      throw new ForbiddenException('OTP không hợp lệ hoặc đã hết hạn.');

    const attempts = parseInt(
      (await this.redisService.get(`reset_attempts:${email}`)) ?? '0',
    );
    if (attempts >= 5) {
      await this.redisService.del(
        `reset_otp:${email}`,
        `reset_attempts:${email}`,
      );
      throw new ForbiddenException(
        'Bạn đã nhập sai OTP quá nhiều lần, vui lòng thử lại.',
      );
    }

    const match = await bcryptUtil.comparePassword(otp, hashOtp);
    if (!match) {
      await this.redisService.setEx(
        `reset_attempts:${email}`,
        300,
        (attempts + 1).toString(),
      );
      throw new ForbiddenException(`OTP không đúng (${attempts + 1}/5 lần).`);
    }

    await this.redisService.setEx(`reset_verified:${email}`, 600, 'true');
    await this.redisService.del(
      `reset_otp:${email}`,
      `reset_attempts:${email}`,
    );

    return { message: 'OTP hợp lệ, bạn có thể đặt lại mật khẩu.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { email, matkhauMoi } = dto;
    const verified = await this.redisService.get(`reset_verified:${email}`);
    if (!verified) throw new ForbiddenException('Bạn chưa xác minh OTP.');

    const hashed = await bcryptUtil.hashPassword(matkhauMoi);
    await this.prisma.nGUOIDUNGPHANMEM.update({
      where: { Email: email },
      data: { MatKhau: hashed },
    });
    await this.redisService.del(`reset_verified:${email}`);

    return { message: 'Đặt lại mật khẩu thành công.' };
  }
}
