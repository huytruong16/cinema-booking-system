import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CursorUtils } from 'src/libs/common/utils/pagination.util';
import { GetTicketsDto } from './dtos/get-tickets.dto';
import { PdfService } from '../pdf/pdf.service';
import { TicketStatusEnum } from 'src/libs/common/enums';

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
    constructor(
        private readonly prisma: PrismaService,
        private readonly pdfService: PdfService,
    ) { }

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

    async getTicketByCode(code: string) {
        return await this.prisma.vE.findUnique({
            where: {
                Code: code,
                DeletedAt: null
            },
            include: ticketIncludes
        });
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

    async updateTicketStatus(id: string, status: TicketStatusEnum) {
        return this.prisma.vE.update({
            where: { MaVe: id },
            data: { TrangThaiVe: status },
        });
    }

    async generateTicketsPdf(ticketCodes: string[]) {
        let codes: string[] = [];
        for (const code of ticketCodes) {
            const ticket = await this.getTicketByCode(code);

            if (ticket && ticket.TrangThaiVe === TicketStatusEnum.CHUASUDUNG) {
                await this.updateTicketStatus(ticket.MaVe, TicketStatusEnum.DASUDUNG);
                codes.push(code);
            }
        }

        if (codes.length === 0) {
            throw new NotFoundException('Không có vé nào để in');
        }

        return this.pdfService.generateTicketsPdf(codes);
    }
}
