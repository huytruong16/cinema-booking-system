import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CursorUtils } from 'src/libs/common/utils/pagination.util';
import { GetTicketsDto } from './dtos/get-tickets.dto';

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

    async getTickets(filters?: GetTicketsDto) {

        const [data, pagination] = await this.prisma.xprisma.vE.paginate({
            where: { DeletedAt: null },
            orderBy: [
                { CreatedAt: 'desc' },
                { MaVe: 'desc' }
            ],
            include: ticketIncludes,
        }).withCursor(CursorUtils.getPrismaOptions(filters ?? {}, 'MaVe'));

        return { data, pagination };
    }

    async getTicketById(id: string) {
        return await this.prisma.vE.findUnique({
            where: {
                MaVe: id,
                DeletedAt: null
            },
            include: ticketIncludes
        });
    }
}
