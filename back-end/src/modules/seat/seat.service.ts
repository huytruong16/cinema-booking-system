import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetSeatsDto } from './dtos/get-seat.dto';

@Injectable()
export class SeatService {
    constructor(
        readonly prisma: PrismaService,
    ) { }

    // ghế đã chia theo loại ghế
    async getAllSeats(query?: GetSeatsDto) {
        return await this.prisma.gHE_LOAIGHE.findMany({
            where: {
                DeletedAt: null,
                MaLoaiGhe: query?.MaLoaiGhe,
            },
            orderBy: { CreatedAt: 'desc' },
            include: {
                Ghe: true,
                LoaiGhe: true,
            }
        });
    }

    // ghế đã chia theo loại ghế
    async getSeatById(id: string) {
        const seat = await this.prisma.gHE_LOAIGHE.findFirst({
            where: { MaGheLoaiGhe: id, DeletedAt: null },
            include: {
                Ghe: true,
                LoaiGhe: true,
            }
        });

        if (!seat) {
            throw new NotFoundException('Ghế - loại ghế không tồn tại');
        }

        return seat;
    }

    // ghế chưa chia theo loại ghế
    async getAllBaseSeats() {
        const whereClause: any = { DeletedAt: null };

        return await this.prisma.gHE.findMany({
            where: whereClause,
            orderBy: { CreatedAt: 'desc' },
        });
    }

    async getBaseSeatById(id: string) {
        const seat = await this.prisma.gHE.findFirst({
            where: { MaGhe: id, DeletedAt: null },
        });

        if (!seat) {
            throw new NotFoundException('Ghế không tồn tại');
        }

        return seat;
    }
}
