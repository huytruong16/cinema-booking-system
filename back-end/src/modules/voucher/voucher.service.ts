import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVoucherDto } from './dtos/create-voucher.dto';
import DiscountStatusEnum from 'src/libs/common/enums/discount-status.enum';

@Injectable()
export class VoucherService {
  constructor(readonly prisma: PrismaService) {}

  async getAllVouchers() {
    return await this.prisma.kHUYENMAI.findMany({
      orderBy: { CreatedAt: 'desc' },
      where: { DeletedAt: null },
    });
  }

  async getVoucherForUser(userId: string) {
    const now = new Date();

    return await this.prisma.kHUYENMAI_KHACHHANG.findMany({
      where: {
        MaKhachHang: userId,
        DaSuDung: false,
        DeletedAt: null,
        KhuyenMai: {
          DeletedAt: null,
          TrangThai: DiscountStatusEnum.CONHOATDONG,
          NgayBatDau: {
            lte: now,
          },
          NgayKetThuc: {
            gte: now,
          },
        },
      },
      include: {
        KhuyenMai: true,
      },
      orderBy: {
        CreatedAt: 'desc',
      },
    });
  }

  async saveVoucherForUser(userId: string, voucherId: string) {
    const now = new Date();

    const voucher = await this.prisma.kHUYENMAI.findFirst({
      where: {
        MaKhuyenMai: voucherId,
        DeletedAt: null,
        TrangThai: DiscountStatusEnum.CONHOATDONG,
        NgayBatDau: { lte: now },
        NgayKetThuc: { gte: now },
      },
    });

    if (!voucher) {
      throw new NotFoundException(
        'Khuyến mãi không tồn tại hoặc không còn hiệu lực',
      );
    }

    const existed = await this.prisma.kHUYENMAI_KHACHHANG.findFirst({
      where: {
        MaKhachHang: userId,
        MaKhuyenMai: voucherId,
        DeletedAt: null,
      },
    });

    if (existed) {
      throw new NotFoundException('Bạn đã lưu khuyến mãi này rồi');
    }

    await this.prisma.kHUYENMAI_KHACHHANG.create({
      data: {
        MaKhachHang: userId,
        MaKhuyenMai: voucherId,
        DaSuDung: false,
        CreatedAt: now,
      },
    });

    return { message: 'Lưu khuyến mãi thành công' };
  }

  async getVoucherById(id: string) {
    return await this.prisma.kHUYENMAI.findUnique({
      where: { MaKhuyenMai: id, DeletedAt: null },
    });
  }
  async createVoucher(dto: CreateVoucherDto) {
    return await this.prisma.kHUYENMAI.create({
      data: {
        TenKhuyenMai: dto.TenKhuyenMai,
        MoTa: dto.MoTa,
        Code: dto.Code,
        LoaiGiamGia: dto.LoaiGiamGia,
        GiaTri: dto.GiaTri,
        SoLuongMa: dto.SoLuongMa,
        SoLuongSuDung: dto.SoLuongSuDung ?? 0,
        GiaTriDonToiThieu: dto.GiaTriDonToiThieu ?? 0,
        GiaTriGiamToiDa: dto.GiaTriGiamToiDa ?? 0,
        NgayBatDau: new Date(dto.NgayBatDau),
        NgayKetThuc: new Date(dto.NgayKetThuc),
        DoiTuongApDung: dto.DoiTuongApDung,
        TrangThai: dto.TrangThai,
        CreatedAt: new Date(),
      },
    });
  }
  async updateVoucher(id: string, dto: Partial<CreateVoucherDto>) {
    const voucher = await this.prisma.kHUYENMAI.findUnique({
      where: { MaKhuyenMai: id },
    });

    if (!voucher || voucher.DeletedAt) {
      throw new NotFoundException(
        `Voucher với id ${id} không tồn tại hoặc đã bị xóa`,
      );
    }

    return await this.prisma.kHUYENMAI.update({
      where: { MaKhuyenMai: id },
      data: {
        TenKhuyenMai: dto.TenKhuyenMai,
        MoTa: dto.MoTa,
        Code: dto.Code,
        LoaiGiamGia: dto.LoaiGiamGia,
        GiaTri: dto.GiaTri,
        SoLuongMa: dto.SoLuongMa,
        SoLuongSuDung: dto.SoLuongSuDung,
        GiaTriDonToiThieu: dto.GiaTriDonToiThieu,
        GiaTriGiamToiDa: dto.GiaTriGiamToiDa,
        NgayBatDau: dto.NgayBatDau ? new Date(dto.NgayBatDau) : undefined,
        NgayKetThuc: dto.NgayKetThuc ? new Date(dto.NgayKetThuc) : undefined,
        TrangThai: dto.TrangThai,
        UpdatedAt: new Date(),
      },
    });
  }

  async removeVoucher(id: string) {
    const voucher = await this.prisma.kHUYENMAI.findUnique({
      where: { MaKhuyenMai: id },
    });

    if (!voucher || voucher.DeletedAt) {
      throw new NotFoundException(
        `Voucher với id ${id} không tồn tại hoặc đã bị xóa`,
      );
    }

    return await this.prisma.kHUYENMAI.update({
      where: { MaKhuyenMai: id },
      data: {
        DeletedAt: new Date(),
        TrangThai: DiscountStatusEnum.KHONGCONHOATDONG,
      },
    });
  }
}
