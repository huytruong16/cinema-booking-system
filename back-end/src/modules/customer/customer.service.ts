import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatusEnum } from 'src/libs/common/enums';
import { FilterCustomerDto } from './dtos/filter-customer.dto';
import { CursorUtils } from 'src/libs/common/utils/pagination.util';

@Injectable()
export class CustomerService {
  constructor(readonly prisma: PrismaService) { }

  async getAllCustomers(filters?: FilterCustomerDto) {
    const whereConditions: any = {
      DeletedAt: null,
    };

    if (filters?.fromCreatedAt || filters?.toCreatedAt) {
      whereConditions.CreatedAt = {};

      if (filters.fromCreatedAt) {
        whereConditions.CreatedAt.gte = new Date(filters.fromCreatedAt);
      }

      if (filters.toCreatedAt) {
        whereConditions.CreatedAt.lte = new Date(filters.toCreatedAt);
      }
    }

    if (filters?.TrangThaiNguoiDung) {
      whereConditions.NguoiDungPhanMem = {
        TrangThai: filters.TrangThaiNguoiDung,
      };
    }

    const [data, pagination] =
      await this.prisma.xprisma.kHACHHANG
        .paginate({
          where: whereConditions,
          orderBy: [
            { CreatedAt: 'desc' },
            { MaKhachHang: 'desc' },
          ],
          include: {
            NguoiDungPhanMem: {
              select: {
                MaNguoiDung: true,
                HoTen: true,
                Email: true,
                SoDienThoai: true,
                VaiTro: true,
                AvatarUrl: true,
                TrangThai: true,
                CreatedAt: true,
                UpdatedAt: true,
              },
            },
          },
        })
        .withCursor(
          CursorUtils.getPrismaOptions(filters ?? {}, 'MaKhachHang'),
        );

    return { data, pagination };
  }

  async getCustomerById(id: string) {
    const customer = await this.prisma.kHACHHANG.findFirst({
      where: { MaKhachHang: id, DeletedAt: null },
      include: {
        NguoiDungPhanMem: {
          select: {
            MaNguoiDung: true,
            HoTen: true,
            Email: true,
            SoDienThoai: true,
            VaiTro: true,
            AvatarUrl: true,
            MaNhomNguoiDung: true,
            NhomNguoiDung: {
              include: {
                QuyenNhomNguoiDungs: true,
              },
            },
            CreatedAt: true,
            UpdatedAt: true,
            DeletedAt: true,
          },
        },
        HoaDons: true,
        KhuyenMaiKhachHangs: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Khách hàng không tồn tại');
    }

    return customer;
  }

  async removeCustomer(id: string) {
    const customer = await this.prisma.kHACHHANG.findFirst({
      where: {
        MaKhachHang: id,
        DeletedAt: null,
      },
      include: {
        NguoiDungPhanMem: true,
      },
    });

    if (!customer) {
      throw new NotFoundException(`Khách hàng với ID ${id} không tồn tại`);
    }

    await this.prisma.$transaction([
      this.prisma.kHACHHANG.update({
        where: { MaKhachHang: id },
        data: {
          DeletedAt: new Date()
        },
      }),

      this.prisma.nGUOIDUNGPHANMEM.update({
        where: { MaNguoiDung: customer.MaNguoiDung },
        data: {
          TrangThai: UserStatusEnum.KHONGHOATDONG
        },
      }),
    ]);

    return {
      message: 'Xóa khách hàng và vô hiệu hóa tài khoản người dùng thành công',
    };
  }
}
