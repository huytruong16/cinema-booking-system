import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { StorageService } from '../storage/storage.service';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import bcryptUtil from '../../libs/common/utils/bcrypt.util';
import { AssignEmployeeDto } from './dtos/assign-employee.dto';
import { RoleEnum, UserStatusEnum } from 'src/libs/common/enums';
import { AssignUserToGroupDto } from './dtos/assign-user-to-group.dto';
import { UpdateGroupPermissionsDto } from './dtos/update-group-permissions.dto';
import { quyen } from '@prisma/client';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async getAllUsers() {
    const users = await this.prisma.nGUOIDUNGPHANMEM.findMany({
      where: { DeletedAt: null },
      orderBy: { CreatedAt: 'desc' },
      select: {
        MaNguoiDung: true,
        HoTen: true,
        Email: true,
        SoDienThoai: true,
        AvatarUrl: true,
        VaiTro: true,
        KhachHangs: true,
        NhanViens: true,
        CreatedAt: true,
        UpdatedAt: true,
        DeletedAt: true,
      },
    });

    return users.map((u) => {
      const copy: any = { ...u };
      if (!copy.KhachHangs || copy.KhachHangs.length === 0)
        delete copy.KhachHangs;
      if (!copy.NhanViens || copy.NhanViens.length === 0) delete copy.NhanViens;
      return copy;
    });
  }

  async getUserById(id: string) {
    const user = await this.prisma.nGUOIDUNGPHANMEM.findUnique({
      where: { MaNguoiDung: id, DeletedAt: null },
      select: {
        MaNguoiDung: true,
        HoTen: true,
        Email: true,
        SoDienThoai: true,
        AvatarUrl: true,
        VaiTro: true,
        MaNhomNguoiDung: true,
        NhomNguoiDung: {
          include: {
            QuyenNhomNguoiDungs: true,
          },
        },
        KhachHangs: true,
        NhanViens: true,
        CreatedAt: true,
        UpdatedAt: true,
        DeletedAt: true,
      },
    });

    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const result: any = { ...user };
    if (!result.KhachHangs || result.KhachHangs.length === 0)
      delete result.KhachHangs;
    if (!result.NhanViens || result.NhanViens.length === 0)
      delete result.NhanViens;

    return result;
  }

  async getCurrentUser() {
    const userId = this.request?.user?.id;
    return this.getUserById(userId);
  }

  async updateProfile(dto: UpdateProfileDto, file?: Express.Multer.File) {
    const userId = this.request?.user?.id;

    const user = await this.prisma.nGUOIDUNGPHANMEM.findUnique({
      where: {
        MaNguoiDung: userId,
        DeletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const updateData: any = {
      UpdatedAt: new Date(),
    };

    if (dto.HoTen !== undefined) updateData.HoTen = dto.HoTen;
    if (dto.SoDienThoai !== undefined) updateData.SoDienThoai = dto.SoDienThoai;

    if (file) {
      if (user.AvatarUrl) {
        await this.storageService.deleteFile('users', user.AvatarUrl);
      }

      const uploaded = await this.storageService.uploadFile(file, {
        bucket: 'users',
        folder: 'avatars',
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });

      updateData.AvatarUrl = uploaded.url;
    }

    const updateProfile = await this.prisma.nGUOIDUNGPHANMEM.update({
      where: { MaNguoiDung: userId },
      data: updateData,
    });

    return {
      message: 'Cập nhật thông tin cá nhân thành công',
      user: updateProfile,
    };
  }

  async changePassword(dto: ChangePasswordDto) {
    const userId = this.request?.user?.id;
    const { MatKhauCu, MatKhauMoi } = dto;

    const user = await this.prisma.nGUOIDUNGPHANMEM.findUnique({
      where: {
        MaNguoiDung: userId,
        DeletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const isMatch = await bcryptUtil.comparePassword(MatKhauCu, user.MatKhau);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu hiện tại không chính xác');
    }

    const isSamePassword = await bcryptUtil.comparePassword(
      MatKhauMoi,
      user.MatKhau,
    );
    if (isSamePassword) {
      throw new UnauthorizedException(
        'Mật khẩu mới không được trùng mật khẩu cũ',
      );
    }

    const hashedPassword = await bcryptUtil.hashPassword(MatKhauMoi);

    await this.prisma.nGUOIDUNGPHANMEM.update({
      where: { MaNguoiDung: userId },
      data: {
        MatKhau: hashedPassword,
        UpdatedAt: new Date(),
      },
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  async assignEmployee(dto: AssignEmployeeDto) {
    const { Email, MatKhau, HoTen, NgayVaoLam } = dto;

    const existingUser = await this.prisma.nGUOIDUNGPHANMEM.findUnique({
      where: { Email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã tồn tại');
    }

    const hashedPassword = await bcryptUtil.hashPassword(MatKhau);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.nGUOIDUNGPHANMEM.create({
        data: {
          Email,
          HoTen,
          MatKhau: hashedPassword,
          VaiTro: RoleEnum.NHANVIEN,
          TrangThai: UserStatusEnum.CONHOATDONG,
        },
      });

      const employee = await tx.nHANVIEN.create({
        data: {
          MaNguoiDung: user.MaNguoiDung,
          NgayVaoLam: new Date(NgayVaoLam),
        },
      });

      return {
        message: 'Tạo tài khoản nhân viên thành công',
        user,
        employee,
      };
    });
  }

  async assignUserToGroup(dto: AssignUserToGroupDto) {
    const { userId, groupId } = dto;

    const user = await this.prisma.nGUOIDUNGPHANMEM.findFirst({
      where: {
        MaNguoiDung: userId,
        DeletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const group = await this.prisma.nHOMNGUOIDUNG.findFirst({
      where: {
        MaNhomNguoiDung: groupId,
        DeletedAt: null,
      },
    });

    if (!group) {
      throw new NotFoundException('Nhóm người dùng không tồn tại');
    }

    await this.prisma.nGUOIDUNGPHANMEM.update({
      where: { MaNguoiDung: userId },
      data: {
        MaNhomNguoiDung: groupId,
        UpdatedAt: new Date(),
      },
    });

    return {
      message: 'Gán người dùng vào nhóm thành công',
    };
  }

  async updateGroupPermissions(dto: UpdateGroupPermissionsDto) {
    const { groupId, permissions } = dto;

    const group = await this.prisma.nHOMNGUOIDUNG.findFirst({
      where: {
        MaNhomNguoiDung: groupId,
        DeletedAt: null,
      },
    });

    if (!group) {
      throw new NotFoundException('Nhóm người dùng không tồn tại');
    }

    // Map PermissionEnum -> Prisma enum quyen
    const mappedPermissions: quyen[] = permissions.map((p) => p as quyen);

    return this.prisma.$transaction(async (tx) => {
      await tx.qUYEN_NHOMNGUOIDUNG.deleteMany({
        where: {
          MaNhomNguoiDung: groupId,
        },
      });

      if (mappedPermissions.length > 0) {
        await tx.qUYEN_NHOMNGUOIDUNG.createMany({
          data: mappedPermissions.map((permission) => ({
            MaNhomNguoiDung: groupId,
            Quyen: permission,
          })),
        });
      }

      return {
        message: 'Cập nhật quyền cho nhóm người dùng thành công',
      };
    });
  }
}
