import { Inject, Injectable, NotFoundException, Scope, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
    constructor(
        readonly prisma: PrismaService,
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
}