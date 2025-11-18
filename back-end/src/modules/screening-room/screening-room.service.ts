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
                GHE_LOAIGHE: {
                    select: {
                        MaGheLoaiGhe: true,
                        GHE: {
                            select: {
                                MaGhe: true,
                                Hang: true,
                                Cot: true
                            }
                        },
                        LOAIGHE: {
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
                { GHE_LOAIGHE: { GHE: { Hang: 'asc' } } },
                { GHE_LOAIGHE: { GHE: { Cot: 'asc' } } }
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
                GhePhongChieu: this.getSeatsIncludeQuery(),
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
                GhePhongChieu: this.getSeatsIncludeQuery()
            }
        });
    }
}
