import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common/exceptions/conflict.exception';
import { CreateFormatDto } from './dtos/create-format.dto';
import { UpdateFormatDto } from './dtos/update-format.dto';

@Injectable()
export class FormatService {
    constructor(
        readonly prisma: PrismaService,
    ) { }

    async getAllFormats() {
        return await this.prisma.dINHDANG.findMany({
            orderBy: { TenDinhDang: 'asc' },
            where: { DeletedAt: null },
        });
    }

    async getFormatById(id: string) {
        const format = await this.prisma.dINHDANG.findUnique({
            where: { MaDinhDang: id, DeletedAt: null },
        });

        if (!format) {
            throw new NotFoundException('Định dạng không tồn tại');
        }

        return format;
    }

    async createFormat(payload: CreateFormatDto) {
        const exists = await this.prisma.dINHDANG.findFirst({
            where: {
                TenDinhDang: payload.TenDinhDang,
                DeletedAt: null,
            },
        });

        if (exists) {
            throw new ConflictException('Tên định dạng đã tồn tại');
        }

        const format = await this.prisma.dINHDANG.create({
            data: {
                TenDinhDang: payload.TenDinhDang,
                GiaVe: payload.GiaVe,
                CreatedAt: new Date(),
            },
        });

        return {
            message: 'Tạo định dạng thành công',
            format,
        };
    }

    async updateFormat(id: string, updateDto: UpdateFormatDto) {
        const format = await this.prisma.dINHDANG.findFirst({
            where: { MaDinhDang: id, DeletedAt: null },
        });

        if (!format) {
            throw new NotFoundException(`Định dạng với ID ${id} không tồn tại`);
        }

        if (
            updateDto.TenDinhDang &&
            updateDto.TenDinhDang !== format.TenDinhDang
        ) {
            const exists = await this.prisma.dINHDANG.findFirst({
                where: {
                    TenDinhDang: updateDto.TenDinhDang,
                    MaDinhDang: { not: id },
                    DeletedAt: null,
                },
            });

            if (exists) {
                throw new ConflictException('Tên định dạng đã tồn tại');
            }
        }

        const updateData: any = {
            UpdatedAt: new Date(),
        };

        if (updateDto.TenDinhDang !== undefined) {
            updateData.TenDinhDang = updateDto.TenDinhDang;
        }

        if (updateDto.GiaVe !== undefined) {
            updateData.GiaVe = updateDto.GiaVe;
        }

        const updated = await this.prisma.dINHDANG.update({
            where: { MaDinhDang: id },
            data: updateData,
        });

        return {
            message: 'Cập nhật định dạng thành công',
            format: updated,
        };
    }

    async removeFormat(id: string) {
        const format = await this.prisma.dINHDANG.findFirst({
            where: { MaDinhDang: id, DeletedAt: null },
        });

        if (!format) {
            throw new NotFoundException(`Định dạng với ID ${id} không tồn tại`);
        }

        await this.prisma.dINHDANG.update({
            where: { MaDinhDang: id },
            data: {
                DeletedAt: new Date(),
            },
        });

        return { message: 'Xóa định dạng thành công' };
    }
}
