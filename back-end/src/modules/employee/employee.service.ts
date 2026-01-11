import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateEmployeeDto } from './dtos/update-employee.dto';
import { UserStatusEnum } from 'src/libs/common/enums';
import { FilterEmployeeDto } from './dtos/filter-employee.dto';
import { CursorUtils } from 'src/libs/common/utils/pagination.util';

@Injectable()
export class EmployeeService {
  constructor(readonly prisma: PrismaService) { }

  async getAllEmployees(filters?: FilterEmployeeDto) {
    const whereConditions: any = {
      DeletedAt: null,
    };

    if (filters?.TrangThai) {
      whereConditions.TrangThai = filters.TrangThai;
    }

    if (filters?.fromNgayVaoLam || filters?.toNgayVaoLam) {
      whereConditions.NgayVaoLam = {};

      if (filters.fromNgayVaoLam) {
        whereConditions.NgayVaoLam.gte = new Date(filters.fromNgayVaoLam);
      }

      if (filters.toNgayVaoLam) {
        whereConditions.NgayVaoLam.lte = new Date(filters.toNgayVaoLam);
      }
    }

    const [data, pagination] = await this.prisma.xprisma.nHANVIEN
      .paginate({
        where: whereConditions,
        orderBy: [
          { CreatedAt: 'desc' },
          { MaNhanVien: 'desc' },
        ],
        include: {
          NguoiDungPhanMem: {
            select: {
              MaNguoiDung: true,
              HoTen: true,
              Email: true,
              SoDienThoai: true,
              AvatarUrl: true,
              VaiTro: true,
              TrangThai: true,
              CreatedAt: true,
              UpdatedAt: true,
            },
          },
        },
      })
      .withCursor(
        CursorUtils.getPrismaOptions(filters ?? {}, 'MaNhanVien'),
      );

    return { data, pagination };
  }

  async getEmployeeById(id: string) {
    const employee = await this.prisma.nHANVIEN.findFirst({
      where: { MaNhanVien: id, DeletedAt: null },
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
      },
    });

    if (!employee) {
      throw new NotFoundException('Nhân viên không tồn tại');
    }

    return employee;
  }

  async updateEmployee(id: string, updateDto: UpdateEmployeeDto) {
    const employee = await this.prisma.nHANVIEN.findFirst({
      where: { MaNhanVien: id, DeletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException(`Nhân viên với ID ${id} không tồn tại`);
    }

    const updateData: any = {
      UpdatedAt: new Date(),
    };

    if (updateDto.NgayVaoLam !== undefined) {
      updateData.NgayVaoLam = new Date(updateDto.NgayVaoLam);
    }

    if (updateDto.TrangThai !== undefined) {
      updateData.TrangThai = updateDto.TrangThai;
    }

    const updated = await this.prisma.nHANVIEN.update({
      where: { MaNhanVien: id },
      data: updateData,
    });

    return {
      message: 'Cập nhật thông tin nhân viên thành công',
      employee: updated,
    };
  }

  async removeEmployee(id: string) {
    const employee = await this.prisma.nHANVIEN.findFirst({
      where: {
        MaNhanVien: id,
        DeletedAt: null,
      },
      include: {
        NguoiDungPhanMem: true,
      },
    });

    if (!employee) {
      throw new NotFoundException(`Nhân viên với ID ${id} không tồn tại`);
    }

    await this.prisma.$transaction([
      this.prisma.nHANVIEN.update({
        where: { MaNhanVien: id },
        data: {
          DeletedAt: new Date()
        },
      }),

      this.prisma.nGUOIDUNGPHANMEM.update({
        where: { MaNguoiDung: employee.MaNguoiDung },
        data: {
          TrangThai: UserStatusEnum.KHONGHOATDONG,
        },
      }),
    ]);

    return {
      message: 'Xóa nhân viên và vô hiệu hóa tài khoản người dùng thành công',
    };
  }
}
