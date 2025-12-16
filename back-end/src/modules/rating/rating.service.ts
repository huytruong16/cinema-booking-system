import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRatingDto } from './dtos/create-rating.dto';
import { UpdateRatingDto } from './dtos/update-rating.dto';

@Injectable()
export class RatingService {
    constructor(
        readonly prisma: PrismaService,
    ) { }

    async getAllRatings() {
        return await this.prisma.nHANPHIM.findMany({
            orderBy: { CreatedAt: 'desc' },
            where: { DeletedAt: null },
        });
    }

    async getRatingById(id: string) {
        const rating = await this.prisma.nHANPHIM.findUnique({
            where: { MaNhanPhim: id, DeletedAt: null },
        });

        if (!rating) {
            throw new NotFoundException('Nhãn phim không tồn tại');
        }

        return rating;
    }

    async createRating(payload: CreateRatingDto) {
        const exists = await this.prisma.nHANPHIM.findFirst({
            where: {
                TenNhanPhim: payload.TenNhanPhim,
                DeletedAt: null,
            },
        });

        if (exists) {
            throw new ConflictException('Tên nhãn phim đã tồn tại');
        }

        const rating = await this.prisma.nHANPHIM.create({
            data: {
                TenNhanPhim: payload.TenNhanPhim,
                MoTa: payload.MoTa,
                DoTuoiToiThieu: payload.DoTuoiToiThieu,
                CreatedAt: new Date(),
            },
        });

        return {
            message: 'Tạo nhãn phim thành công',
            rating,
        };
    }

    async updateRating(id: string, updateDto: UpdateRatingDto) {
        const rating = await this.prisma.nHANPHIM.findFirst({
            where: { MaNhanPhim: id, DeletedAt: null },
        });

        if (!rating) {
            throw new NotFoundException(
                `Nhãn phim với ID ${id} không tồn tại`,
            );
        }

        if (
            updateDto.TenNhanPhim &&
            updateDto.TenNhanPhim !== rating.TenNhanPhim
        ) {
            const exists = await this.prisma.nHANPHIM.findFirst({
                where: {
                    TenNhanPhim: updateDto.TenNhanPhim,
                    MaNhanPhim: { not: id },
                    DeletedAt: null,
                },
            });

            if (exists) {
                throw new ConflictException('Tên nhãn phim đã tồn tại');
            }
        }

        const updateData: any = {
            UpdatedAt: new Date(),
        };

        if (updateDto.TenNhanPhim !== undefined) {
            updateData.TenNhanPhim = updateDto.TenNhanPhim;
        }

        if (updateDto.MoTa !== undefined) {
            updateData.MoTa = updateDto.MoTa;
        }

        if (updateDto.DoTuoiToiThieu !== undefined) {
            updateData.DoTuoiToiThieu = updateDto.DoTuoiToiThieu;
        }

        const updated = await this.prisma.nHANPHIM.update({
            where: { MaNhanPhim: id },
            data: updateData,
        });

        return {
            message: 'Cập nhật nhãn phim thành công',
            rating: updated,
        };
    }

    async removeRating(id: string) {
        const rating = await this.prisma.nHANPHIM.findFirst({
            where: { MaNhanPhim: id, DeletedAt: null },
        });

        if (!rating) {
            throw new NotFoundException(
                `Nhãn phim với ID ${id} không tồn tại`,
            );
        }

        await this.prisma.nHANPHIM.update({
            where: { MaNhanPhim: id },
            data: {
                DeletedAt: new Date(),
            },
        });

        return { message: 'Xóa nhãn phim thành công' };
    }
}
