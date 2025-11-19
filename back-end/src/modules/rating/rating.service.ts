import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}
