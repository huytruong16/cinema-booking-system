import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVoucherDto } from './dtos/create-voucher.dto';
import DiscountStatusEnum from 'src/libs/common/enums/discount-status.enum';

@Injectable()
export class VoucherService {
    constructor(
        readonly prisma: PrismaService,
    ) { }

    async getAllVouchers() {
        return await this.prisma.kHUYENMAI.findMany({
            orderBy: { CreatedAt: 'desc' },
            where: { DeletedAt: null },
        });
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
                TrangThai: dto.TrangThai,
            },
        });
    }
    async updateVoucher(id: string, dto: Partial<CreateVoucherDto>) {

        const voucher = await this.prisma.kHUYENMAI.findUnique({ where: { MaKhuyenMai: id } });

        if (!voucher || voucher.DeletedAt) {
            throw new NotFoundException(`Voucher với id ${id} không tồn tại hoặc đã bị xóa`);
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
        const voucher = await this.prisma.kHUYENMAI.findUnique({ where: { MaKhuyenMai: id } });

        if (!voucher || voucher.DeletedAt) {
            throw new NotFoundException(`Voucher với id ${id} không tồn tại hoặc đã bị xóa`);
        }

        return await this.prisma.kHUYENMAI.update({
            where: { MaKhuyenMai: id },
            data: {
                DeletedAt: new Date(),
                TrangThai: DiscountStatusEnum.KHONGCONHOATDONG
            },
        });
    }

}
