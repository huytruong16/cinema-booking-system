import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SeatStatusEnum, TransactionStatusEnum, TransactionTypeEnum } from "src/libs/common/enums";
import { PrismaService } from "src/modules/prisma/prisma.service";

@Injectable()
export class TransactionCronService {
    constructor(private readonly prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const expiredTransactions = await this.findExpiredTransactions(tenMinutesAgo);

        for (const tx of expiredTransactions) {
            try {
                await this.processTransaction(tx);
            } catch (error) {
                console.error(`Error processing transaction ${tx.MaGiaoDich}:`, error);
            }
        }
    }

    private async findExpiredTransactions(threshold: Date) {
        return this.prisma.gIAODICH.findMany({
            where: {
                UpdatedAt: { lte: threshold },
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
        await this.rollbackTransaction(transaction.MaGiaoDich);
        await this.rollbackTicket(transaction.HoaDon);
        await this.rollbackInvoiceCombo(transaction.HoaDon.MaHoaDon);
        await this.rollbackInvoice(transaction.HoaDon.MaHoaDon);
    }

    private async rollbackTransaction(transactionId: string) {
        await this.prisma.gIAODICH.delete({
            where: { MaGiaoDich: transactionId },
        });
    }

    private async rollbackTicket(invoice: any) {
        const ticketIds = (invoice.Ves || []).map((v: any) => v.MaVe).filter(Boolean);
        const seatIds = (invoice.Ves || []).map((v: any) => v.GheSuatChieu?.MaGheSuatChieu).filter(Boolean);
        const promoIds = (invoice.HoaDonKhuyenMais || []).map((p: any) => p.MaKhuyenMaiKH).filter(Boolean);

        if (ticketIds.length) await this.rollbackTickets(ticketIds);
        if (seatIds.length) await this.rollbackSeats(seatIds);
        if (promoIds.length) await this.rollbackPromotions(promoIds);
        await this.rollbackInvoicePromotions(invoice.MaHoaDon);

    }

    private async rollbackTickets(invoiceId: string[]) {
        await this.prisma.vE.deleteMany({
            where: { MaVe: { in: invoiceId }, DeletedAt: null },
        });
    }

    private async rollbackSeats(showSeatCodes: string[]) {
        await this.prisma.gHE_SUATCHIEU.updateMany({
            where: { MaGheSuatChieu: { in: showSeatCodes }, DeletedAt: null },
            data: { TrangThai: SeatStatusEnum.CONTRONG, UpdatedAt: new Date() }
        });
    }

    private async rollbackPromotions(customerPromotionIds: string[]) {
        await this.prisma.kHUYENMAI_KHACHHANG.updateMany({
            where: { MaKhuyenMaiKH: { in: customerPromotionIds } },
            data: { DaSuDung: false, UpdatedAt: new Date() }
        });
    }

    private async rollbackInvoicePromotions(invoiceId: string) {
        await this.prisma.hOADON_KHUYENMAI.deleteMany({
            where: { MaHoaDon: invoiceId },
        });
    }

    private async rollbackInvoiceCombo(invoiceId: string) {
        await this.prisma.hOADONCOMBO.deleteMany({
            where: { MaHoaDon: invoiceId },
        });
    }

    private async rollbackInvoice(invoiceId: string) {
        await this.prisma.hOADON.delete({
            where: { MaHoaDon: invoiceId },
        });
    }
}
