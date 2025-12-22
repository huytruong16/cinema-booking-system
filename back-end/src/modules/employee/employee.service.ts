import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateEmployeeDto } from './dtos/update-employee.dto';

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

    async updateEmployee(id: string, updateDto: UpdateEmployeeDto) {
        const employee = await this.prisma.nHANVIEN.findFirst({
            where: { MaNhanVien: id, DeletedAt: null },
        });

        if (!employee) {
            throw new NotFoundException(
                `Nhân viên với ID ${id} không tồn tại`,
            );
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
            where: { MaNhanVien: id, DeletedAt: null },
        });

        if (!employee) {
            throw new NotFoundException(
                `Nhân viên với ID ${id} không tồn tại`,
            );
        }

        await this.prisma.nHANVIEN.update({
            where: { MaNhanVien: id },
            data: {
                DeletedAt: new Date(),
            },
        });

        return {
            message: 'Xóa nhân viên thành công',
        };
    }
}