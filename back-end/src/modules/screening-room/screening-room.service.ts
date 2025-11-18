import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScreeningRoomService {
    constructor(
        readonly prisma: PrismaService,
    ) { }

    private getSeatsIncludeQuery(): any {
        return {
            where: { DeletedAt: null },
            select: {
                MaGhePhongChieu: true,
                GheLoaiGhe: {
                    select: {
                        MaGheLoaiGhe: true,
                        Ghe: {
                            select: {
                                MaGhe: true,
                                Hang: true,
                                Cot: true
                            }
                        },
                        LoaiGhe: {
                            select: {
                                MaLoaiGhe: true,
                                LoaiGhe: true,
                                HeSoGiaGhe: true
                            }
                        }
                    }
                }
            },
            orderBy: [
                { GheLoaiGhe: { Ghe: { Hang: 'asc' } } },
                { GheLoaiGhe: { Ghe: { Cot: 'asc' } } }
            ]
        };
    }

    async getAllScreeningRooms() {
        return await this.prisma.pHONGCHIEU.findMany({
            orderBy: { CreatedAt: 'desc' },
            where: { DeletedAt: null },
            select: {
                MaPhongChieu: true,
                TenPhongChieu: true,
                SoDoGhe: true,
                GhePhongChieus: this.getSeatsIncludeQuery(),
                CreatedAt: true,
                UpdatedAt: true,
                DeletedAt: true,
            }
        });
    }

    async getScreeningRoomById(id: string) {
        return await this.prisma.pHONGCHIEU.findUnique({
            where: { MaPhongChieu: id, DeletedAt: null },
            include: {
                GhePhongChieus: this.getSeatsIncludeQuery()
            }
        });
    }
}
