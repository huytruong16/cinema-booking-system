import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ticketIncludes = {
    GheSuatChieu: {
        include: {
            GhePhongChieu: {
                include: {
                    GheLoaiGhe: {
                        include: {
                            Ghe: true,
                            LoaiGhe: true,
                        }
                    },
                    PhongChieu: true,
                }
            },
            SuatChieu: {
                include: {
                    PhienBanPhim: {
                        include: {
                            Phim: {
                                include: {
                                    PhimTheLoais: {
                                        include: {
                                            TheLoai: true,
                                        }
                                    },
                                    NhanPhim: true,
                                }
                            },
                            DinhDang: true,
                            NgonNgu: true,
                        }
                    },
                }
            },
        }
    },
};
@Injectable()
export class TicketsService {
    constructor(private prisma: PrismaService) { }

    getTickets() {
        return this.prisma.vE.findMany(
            {
                where: {
                    DeletedAt: null,
                },
                include: ticketIncludes
            }
        );
    }

    getTicketById(id: string) {
        return this.prisma.vE.findUnique({
            where: {
                MaVe: id,
                DeletedAt: null
            },
            include: ticketIncludes
        });
    }
}
