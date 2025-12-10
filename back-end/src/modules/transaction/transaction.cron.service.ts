import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SeatStatusEnum, TransactionStatusEnum, TransactionTypeEnum } from "src/libs/common/enums";
import { PrismaService } from "src/modules/prisma/prisma.service";

@Injectable()
export class TransactionCronService {
    constructor(private readonly prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const expiredTransactions = await this.findExpiredTransactions(fiveMinutesAgo);

        for (const tx of expiredTransactions) {
            try {
                await this.processTransaction(tx);
            } catch (error) {
            }
        }
    }

    private async findExpiredTransactions(threshold: Date) {
        return this.prisma.gIAODICH.findMany({
            where: {
                CreatedAt: { lt: threshold },
                TrangThai: TransactionStatusEnum.DANGCHO,
                DeletedAt: null
            },
            include: {
                HoaDon: {
                    include: {
                        HoaDonKhuyenMais: true,
                        Ves: {
                            include: {
                                GheSuatChieu: true
                            }
                        }
                    }
                }
            }
        });
    }

    private async processTransaction(transaction: any) {
        await this.markTransactionFailed(transaction.MaGiaoDich);

        if (transaction.LoaiGiaoDich === TransactionTypeEnum.MUAVE && transaction.HoaDon) {
            await this.handleTicketRollback(transaction.HoaDon);
        }
    }

    private async markTransactionFailed(maGiaoDich: string) {
        await this.prisma.gIAODICH.update({
            where: { MaGiaoDich: maGiaoDich },
            data: { TrangThai: TransactionStatusEnum.THATBAI, UpdatedAt: new Date() }
        });
    }

    private async handleTicketRollback(hd: any) {
        const ticketIds = (hd.Ves || []).map((v: any) => v.MaVe).filter(Boolean);
        const seatIds = (hd.Ves || []).map((v: any) => v.GheSuatChieu?.MaGheSuatChieu).filter(Boolean);
        const promoIds = (hd.HoaDonKhuyenMais || []).map((p: any) => p.MaKhuyenMaiKH).filter(Boolean);

        if (ticketIds.length) await this.rollbackTickets(ticketIds);
        if (seatIds.length) await this.rollbackSeats(seatIds);
        if (promoIds.length) await this.rollbackPromotions(promoIds);
        await this.rollbackInvoicePromotions(hd.MaHoaDon);

    }

    private async rollbackTickets(maVes: string[]) {
        await this.prisma.vE.updateMany({
            where: { MaVe: { in: maVes }, DeletedAt: null },
            data: { DeletedAt: new Date() }
        });
    }

    private async rollbackSeats(maGheSuatChieus: string[]) {
        await this.prisma.gHE_SUATCHIEU.updateMany({
            where: { MaGheSuatChieu: { in: maGheSuatChieus }, DeletedAt: null },
            data: { TrangThai: SeatStatusEnum.CONTRONG, UpdatedAt: new Date() }
        });
    }

    private async rollbackPromotions(maKhuyenMaiKHs: string[]) {
        await this.prisma.kHUYENMAI_KHACHHANG.updateMany({
            where: { MaKhuyenMaiKH: { in: maKhuyenMaiKHs } },
            data: { DaSuDung: false, UpdatedAt: new Date() }
        });
    }

    private async rollbackInvoicePromotions(MaHoaDon: string) {
        await this.prisma.hOADON_KHUYENMAI.deleteMany({
            where: { MaHoaDon: MaHoaDon },
        });
    }
}
