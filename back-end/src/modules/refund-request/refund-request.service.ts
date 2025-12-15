import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRefundRequestDto } from './dto/create-refund-request.dto';
import { TicketStatusEnum, SeatStatusEnum } from 'src/libs/common/enums';
import VoucherTargetEnum from 'src/libs/common/enums/voucher_target.enum';

@Injectable()
export class RefundRequestService {
    constructor(
        readonly prisma: PrismaService,
    ) { }
    async getAllRefundRequests() {
        return await this.prisma.yEUCAUHOANVE.findMany({
            orderBy: { CreatedAt: 'desc' },
            where: { DeletedAt: null },
            include: { Ve: true },
        });
    }

    async createNewRefundRequest(refundRequestData: CreateRefundRequestDto): Promise<any> {
        const prisma = this.prisma;
        const ves = await this.prisma.vE.findMany({
            where: {
                Code: {
                    in: refundRequestData.Code
                },
                DeletedAt: null
            }
        });

        await validateBankExistence();

        const invoiceId = ves[0]?.MaHoaDon;

        validateRefundRequest();

        await checkTicketVoucherEligibility();

        const param = await prisma.tHAMSO.findUnique({ where: { TenThamSo: 'RefundWindowHours' } });
        let refundWindowHours = 0;
        if (param && param?.KieuDuLieu === 'int') {
            refundWindowHours = parseInt(param.GiaTri);
        }
        const invoice = await prisma.hOADON.findUnique({ where: { MaHoaDon: invoiceId } });
        const refundWindow = new Date(invoice?.CreatedAt || new Date());
        refundWindow.setHours(refundWindow.getHours() + refundWindowHours);
        if (new Date() > refundWindow) {
            throw new BadRequestException('Vé đã vượt quá thời gian hoàn vé cho phép');
        }

        const createdRefunds = await this.prisma.$transaction(async (tx) => {
            await Promise.all(
                refundRequestData.Code.map(code =>
                    tx.yEUCAUHOANVE.create({
                        data: {
                            MaVe: ves.find(ve => ve.Code === code)!.MaVe,
                            LyDoHoan: refundRequestData.LyDo,
                            MaNganHang: refundRequestData.MaNganHang,
                            SoTaiKhoan: refundRequestData.SoTaiKhoan,
                            TenChuTaiKhoan: refundRequestData.ChuTaiKhoan,
                            SoTien: ves.find(ve => ve.Code === code)!.GiaVe,
                        },
                    })
                )
            );

            await tx.vE.updateMany({
                where: { Code: { in: refundRequestData.Code } },
                data: { TrangThaiVe: TicketStatusEnum.CHOHOANTIEN, UpdatedAt: new Date() },
            });

            return await tx.yEUCAUHOANVE.findMany({
                where: { MaVe: { in: ves.map(ve => ve.MaVe) }, DeletedAt: null },
            });
        });

        return await Promise.all(createdRefunds.map(e => this.getRefundRequestById(e.MaYeuCau)));

        async function checkTicketVoucherEligibility() {
            const appliedTicketVouchers = await prisma.hOADON_KHUYENMAI.findMany({
                where: {
                    MaHoaDon: invoiceId,
                    KhuyenMaiKH: {
                        KhuyenMai: {
                            DoiTuongApDung: VoucherTargetEnum.VE
                        }
                    },
                    DeletedAt: null
                }
            });

            if (appliedTicketVouchers.length > 0) {
                throw new BadRequestException('Hóa đơn có áp dụng khuyến mãi vé, không thể hoàn vé');
            }
        }

        async function validateBankExistence() {
            const bank = await prisma.nGANHANG.findUnique({
                where: { MaNganHang: refundRequestData.MaNganHang }
            });

            if (!bank) {
                throw new NotFoundException('Ngân hàng không tồn tại');
            }
        }

        function validateRefundRequest() {
            if (ves.length !== refundRequestData.Code.length) {
                throw new BadRequestException('Một hoặc nhiều vé không tồn tại');
            }

            if (ves.some(ve => ve.MaHoaDon !== invoiceId)) {
                throw new BadRequestException('Các vé phải thuộc cùng một hóa đơn để có thể hoàn vé');
            }

            const usedTickets = ves.filter(ve => ve.TrangThaiVe == TicketStatusEnum.DASUDUNG);
            if (usedTickets.length > 0) {
                throw new BadRequestException(`Vé ${usedTickets.map(ve => ve.Code).join(', ')} đã được sử dụng, không thể hoàn vé`);
            }

            const refundedTickets = ves.filter(ve => ve.TrangThaiVe == TicketStatusEnum.DAHOAN);
            if (refundedTickets.length > 0) {
                throw new BadRequestException(`Vé ${refundedTickets.map(ve => ve.Code).join(', ')} đã được hoàn, không thể hoàn vé lại`);
            }

            const pendingRefundTickets = ves.filter(ve => ve.TrangThaiVe == TicketStatusEnum.CHOHOANTIEN || ve.TrangThaiVe == TicketStatusEnum.CHUAHOANTIEN);
            if (pendingRefundTickets.length > 0) {
                throw new BadRequestException(`Vé ${pendingRefundTickets.map(ve => ve.Code).join(', ')} đang trong quá trình hoàn tiền, không thể hoàn vé lại`);
            }

            const expiredTickets = ves.filter(ve => ve.TrangThaiVe == TicketStatusEnum.DAHETHAN);
            if (expiredTickets.length > 0) {
                throw new BadRequestException(`Vé ${expiredTickets.map(ve => ve.Code).join(', ')} đã hết hạn hoàn vé`);
            }
        }
    }

    async getRefundRequestById(id: string): Promise<any> {
        const refundRequest = await this.prisma.yEUCAUHOANVE.findFirst({
            where: { MaYeuCau: id, DeletedAt: null },
            include: {
                Ve: {
                    include: {
                        GheSuatChieu: {
                            include: {
                                SuatChieu: true
                            }
                        }
                    }
                },
                GiaoDich: true
            },
        });
        if (!refundRequest) {
            throw new NotFoundException('Yêu cầu hoàn vé không tồn tại');
        }
        return refundRequest;
    }
}