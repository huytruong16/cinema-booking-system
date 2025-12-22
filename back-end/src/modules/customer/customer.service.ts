import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomerService {
    constructor(
        readonly prisma: PrismaService,
    ) { }

    async getAllCustomers() {
        return await this.prisma.kHACHHANG.findMany({
            where: { DeletedAt: null },
            orderBy: { CreatedAt: 'desc' },
            include: {
                NguoiDungPhanMem: {
                    select: {
                        MaNguoiDung: true,
                        HoTen: true,
                        Email: true,
                        SoDienThoai: true,
                        VaiTro: true,
                        AvatarUrl: true,
                        CreatedAt: true,
                        UpdatedAt: true,
                        DeletedAt: true,
                    }
                },
                HoaDons: false,
                KhuyenMaiKhachHangs: false,
            },
        });
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
                                QuyenNhomNguoiDungs: true
                            }
                        },
                        CreatedAt: true,
                        UpdatedAt: true,
                        DeletedAt: true,
                    }
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
            where: { MaKhachHang: id, DeletedAt: null },
        });

        if (!customer) {
            throw new NotFoundException(
                `Khách hàng với ID ${id} không tồn tại`,
            );
        }

        await this.prisma.kHACHHANG.update({
            where: { MaKhachHang: id },
            data: {
                DeletedAt: new Date(),
            },
        });

        return {
            message: 'Xóa khách hàng thành công',
        };
    }
}
