import { Inject, Injectable, NotFoundException, Scope, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { StorageService } from '../storage/storage.service';
import { UpdateProfileDto } from './dtos/update-profile.dto';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
    constructor(
        readonly prisma: PrismaService,
        private readonly storageService: StorageService,
        @Inject(REQUEST) private readonly request: any,
    ) { }

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

        return users.map(u => {
            const copy: any = { ...u };
            if (!copy.KhachHangs || copy.KhachHangs.length === 0) delete copy.KhachHangs;
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
                        QuyenNhomNguoiDungs: true
                    }
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
        if (!result.KhachHangs || result.KhachHangs.length === 0) delete result.KhachHangs;
        if (!result.NhanViens || result.NhanViens.length === 0) delete result.NhanViens;

        return result;
    }

    async getCurrentUser() {
        const userId = this.request?.user?.id;
        return this.getUserById(userId);
    }

    async updateProfile(
        dto: UpdateProfileDto,
        file?: Express.Multer.File,
    ) {
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
            data: updateData
        });

        return { message: 'Cập nhật thông tin cá nhân thành công', user: updateProfile };
    }
}