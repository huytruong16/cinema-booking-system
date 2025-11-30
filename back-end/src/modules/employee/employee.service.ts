import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeeService {
    constructor(
        readonly prisma: PrismaService,
    ) { }

    async getAllEmployees() {
        return await this.prisma.nHANVIEN.findMany({
            where: { DeletedAt: null },
            orderBy: { CreatedAt: 'desc' },
            include: {
                NguoiDungPhanMem: {
                    select: {
                        MaNguoiDung: true,
                        HoTen: true,
                        Email: true,
                        VaiTro: true,
                        SoDienThoai: true,
                        AvatarUrl: true,
                        CreatedAt: true,
                        UpdatedAt: true,
                        DeletedAt: true,
                    }
                },
            },
        });
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
                                QuyenNhomNguoiDungs: true
                            }
                        },
                        CreatedAt: true,
                        UpdatedAt: true,
                        DeletedAt: true,
                    }
                },
            },
        });

        if (!employee) {
            throw new NotFoundException('Nhân viên không tồn tại');
        }

        return employee;
    }
}