import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeatTypeService {
    constructor(
        readonly prisma: PrismaService,
    ) { }

    async getAllSeatTypes() {
        return await this.prisma.lOAIGHE.findMany({
            orderBy: { CreatedAt: 'desc' },
            where: { DeletedAt: null },
        });
    }

    async getSeatTypeById(id: string) {
        const seatType = await this.prisma.lOAIGHE.findUnique({
            where: { MaLoaiGhe: id, DeletedAt: null },
        });

        if (!seatType) {
            throw new NotFoundException('Loại ghế không tồn tại');
        }

        return seatType;
    }
}
