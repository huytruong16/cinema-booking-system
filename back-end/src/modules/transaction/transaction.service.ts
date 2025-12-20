import { BadRequestException, Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { RefundRequestStatusEnum, RoleEnum, SeatStatusEnum, TicketStatusEnum, TransactionEnum, TransactionStatusEnum, TransactionTypeEnum } from "src/libs/common/enums";
import { PayosService } from "src/libs/common/services/payos.service";
import InvoiceMailDto from "src/modules/mail/dto/invoice-mail.dto";
import { MailService } from "src/modules/mail/mail.service";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { UpdateTransactionMethodDto } from "./dto/update-transaction-method";
import { CreateRefundTransactionDto } from "./dto/create-refund-transaction.dto";
import { REQUEST } from "@nestjs/core";
import { UpdateRefundTransactionStatusDto } from "./dto/update-refund-transaction-status.dto";
import { RefundRequestService } from "../refund-request/refund-request.service";
import { CursorUtils } from 'src/libs/common/utils/pagination.util';
import { GetTransactionDto } from "./dto/get-transaction.dto";

@Injectable({ scope: Scope.REQUEST })
export class TransactionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly payosService: PayosService,
        private readonly mailService: MailService,
        private readonly refundRequestService: RefundRequestService,
        @Inject(REQUEST) private readonly request: any
    ) { }

    private async sendInvoiceEmail(invoice: NonNullable<any>) {
        const emailData: InvoiceMailDto = {
            Transaction: {
                GiaoDich: {
                    NgayGiaoDich: invoice.HoaDon.GiaoDich.NgayGiaoDich,
                    HoaDon: {
                        TongTien: invoice.TongTien,
                        Email: invoice.Email,
                        Code: invoice.Code,
                        HoaDonCombos: invoice.HoaDonCombos.map(hdc => ({
                            SoLuong: hdc.SoLuong,
                            DonGia: hdc.DonGia,
                            Combo: {
                                TenCombo: hdc.Combo.TenCombo
                            }
                        })),
                        Ves: invoice.Ves.map(ve => ({
                            GiaVe: ve.GiaVe,
                            GheSuatChieu: {
                                GhePhongChieu: {
                                    GheLoaiGhe: {
                                        Ghe: {
                                            Hang: ve.GheSuatChieu.GhePhongChieu.GheLoaiGhe.Ghe.Hang,
                                            Cot: ve.GheSuatChieu.GhePhongChieu.GheLoaiGhe.Ghe.Cot
                                        }
                                    }
                                }
                            }
                        }))
                    }
                }
            },
            Showtime: {
                ThoiGianBatDau: invoice.Ves[0].GheSuatChieu.SuatChieu.ThoiGianBatDau,
                PhienBanPhim: {
                    Phim: {
                        TenHienThi: invoice.Ves[0].GheSuatChieu.SuatChieu.PhienBanPhim.Phim.TenHienThi,
                        NhanPhim: {
                            TenNhanPhim: invoice.Ves[0].GheSuatChieu.SuatChieu.PhienBanPhim.Phim.NhanPhim?.TenNhanPhim
                        },
                        DinhDang: {
                            TenDinhDang: invoice.Ves[0].GheSuatChieu.SuatChieu.PhienBanPhim.DinhDang.TenDinhDang
                        },
                        NgonNgu: {
                            TenNgonNgu: invoice.Ves[0].GheSuatChieu.SuatChieu.PhienBanPhim.NgonNgu?.TenNgonNgu
                        },
                    }
                },
                PhongChieu: {
                    TenPhongChieu: invoice.Ves[0].GheSuatChieu.SuatChieu.PhongChieu.TenPhongChieu
                }
            }
        };
        this.mailService.sendInvoiceEmail(
            emailData.Transaction.GiaoDich.HoaDon.Email,
            'Xác nhận đặt vé thành công',
            emailData
        );
    }

    async getAllTransactions(filters?: GetTransactionDto) {

        const [data, pagination] = await this.prisma.xprisma.gIAODICH.paginate({
            where: { DeletedAt: null },
            orderBy: [
                { CreatedAt: 'desc' },
                { MaGiaoDich: 'desc' }
            ],
        }).withCursor(CursorUtils.getPrismaOptions(filters ?? {}, 'MaGiaoDich'));

        return { data, pagination };
    }

    async getTransactionById(id: string) {
        return await this.prisma.gIAODICH.findUnique({
            where: { MaGiaoDich: id, DeletedAt: null },
        });
    }

    async updateTransactionStatus(webhookBody: any) {
        const { data, verified } = this.payosService.verifyPaymentWebhookData(webhookBody);

        if (!verified || !data) {
            return { success: false, message: 'Webhook không hợp lệ' };
        }

        const code = data?.code ?? data?.statusCode ?? data?.status;
        const linkId = data?.paymentLinkId ?? data?.transaction?.paymentLinkId;

        if (!linkId) {
            return { success: false, message: 'Thiếu paymentLinkId trong webhook' };
        }

        const transaction = await this.prisma.gIAODICH.findFirst({
            where: {
                LinkId: linkId,
                DeletedAt: null
            },
            select: {
                LoaiGiaoDich: true,
                TrangThai: true,
                MaGiaoDich: true,
                NgayGiaoDich: true,
                HoaDon: {
                    select: {
                        CreatedAt: true,
                        TongTien: true,
                        Email: true,
                        Code: true,
                        HoaDonCombos: {
                            select: {
                                SoLuong: true,
                                DonGia: true,
                                Combo: {
                                    select: {
                                        TenCombo: true
                                    }
                                }
                            }
                        },
                        HoaDonKhuyenMais: {
                            select: {
                                MaKhuyenMaiKH: true,
                            }
                        },
                        Ves: {
                            select: {
                                MaVe: true,
                                GiaVe: true,
                                GheSuatChieu: {
                                    select: {
                                        MaGheSuatChieu: true,
                                        GhePhongChieu: {
                                            select: {
                                                GheLoaiGhe: {
                                                    select: {
                                                        Ghe: {
                                                            select: {
                                                                Hang: true,
                                                                Cot: true
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        SuatChieu: {
                                            select: {
                                                ThoiGianBatDau: true,
                                                PhongChieu: true,
                                                PhienBanPhim: {
                                                    select: {
                                                        Phim: {
                                                            select: {
                                                                TenHienThi: true,
                                                                NhanPhim: {
                                                                    select: {
                                                                        TenNhanPhim: true
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        DinhDang: {
                                                            select: {
                                                                TenDinhDang: true
                                                            }
                                                        },
                                                        NgonNgu: {
                                                            select: {
                                                                TenNgonNgu: true
                                                            }
                                                        }

                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                            }
                        },
                    }
                },
            }
        });

        if (!transaction) {
            return { success: false, message: 'Giao dịch không tồn tại' };
        }

        if (transaction.TrangThai === TransactionStatusEnum.THANHCONG) {
            return { success: true, message: 'Giao dịch đã được cập nhật trước đó' };
        }

        const isPaid =
            code === '00' ||
            data?.status === 'PAID' ||
            data?.success === true;

        await this.prisma.gIAODICH.update({
            where: { MaGiaoDich: transaction.MaGiaoDich },
            data: {
                TrangThai: isPaid ? TransactionStatusEnum.THANHCONG : TransactionStatusEnum.THATBAI,
                UpdatedAt: new Date()
            }
        });

        if (isPaid) {
            await this.sendInvoiceEmail(transaction.HoaDon);
        }

        return { success: true };
    }

    async updateTransactionMethod(transactionId: string, request: UpdateTransactionMethodDto) {
        const transactionMethod = request.PhuongThuc;

        const transaction = await this.prisma.gIAODICH.findFirst({
            where: { MaGiaoDich: transactionId },
            select: {
                Code: true,
                PhuongThuc: true,
                GiaoDichUrl: true,
                LoaiGiaoDich: true,
                HoaDon: {
                    select: {
                        Code: true,
                        TongTien: true
                    }
                }
            }
        });

        if (!transaction) {
            throw new NotFoundException('Giao dịch không tồn tại');
        }

        if (transaction.PhuongThuc == transactionMethod) {
            return;
        }

        let paymentData: { paymentLinkId: string, checkoutUrl: string } | undefined;

        if (transaction.LoaiGiaoDich === TransactionTypeEnum.MUAVE && transaction.PhuongThuc == TransactionEnum.TRUCTIEP && transactionMethod == TransactionEnum.TRUCTUYEN && transaction.GiaoDichUrl.length === 0) {
            paymentData = await this.payosService.getPaymentLinkUrl(Number(transaction.Code), Number(transaction.HoaDon.TongTien), `${transaction.HoaDon.Code}`);
        }

        await this.prisma.gIAODICH.update({
            where: { MaGiaoDich: transactionId },
            data: {
                PhuongThuc: transactionMethod,
                LinkId: paymentData && paymentData.paymentLinkId,
                GiaoDichUrl: paymentData && paymentData.checkoutUrl,
                TrangThai: TransactionStatusEnum.DANGCHO,
                UpdatedAt: new Date()
            }
        });
    }

    async createRefundTransaction(payload: CreateRefundTransactionDto) {
        const { MaYeuCaus, PhuongThuc } = payload;

        if (this.request?.user?.vaitro !== RoleEnum.NHANVIEN) {
            throw new BadRequestException('Chỉ nhân viên mới có quyền tạo giao dịch hoàn tiền');
        }

        const userId = this.request?.user?.id;

        const staff = await this.prisma.nHANVIEN.findFirst({
            where: { MaNguoiDung: userId, DeletedAt: null },
        });

        if (!staff) {
            throw new NotFoundException('Nhân viên không tồn tại');
        }

        const refundRequests = await this.prisma.yEUCAUHOANVE.findMany({
            where: {
                MaYeuCau: { in: MaYeuCaus },
                DeletedAt: null,
                MaGiaoDich: null
            },
            include: {
                HoaDon: {
                    include: {
                        Ves: true
                    }
                }
            }
        });

        if (refundRequests.length !== MaYeuCaus.length) {
            throw new BadRequestException('Một số yêu cầu hoàn vé không tồn tại hoặc đã được xử lý.');
        }

        const invoiceIds = refundRequests.map(req => req.MaHoaDon);
        const uniqueInvoiceIds = [...new Set(invoiceIds)];

        if (uniqueInvoiceIds.length > 1) {
            throw new BadRequestException('Các yêu cầu hoàn vé phải thuộc cùng một hóa đơn để gộp giao dịch.');
        }

        const invoiceId = uniqueInvoiceIds[0];

        const totalAmount = refundRequests.reduce((sum, req) => sum + Number(req.SoTien), 0);

        const ts = await this.prisma.$transaction(async (tx) => {
            const transaction = await tx.gIAODICH.create({
                data: {
                    MaHoaDon: invoiceId,
                    TongTien: totalAmount,
                    LoaiGiaoDich: TransactionTypeEnum.HOANTIEN,
                    PhuongThuc: PhuongThuc,
                    NgayGiaoDich: new Date(),
                    TrangThai: TransactionStatusEnum.DANGCHO,
                    MaNhanVien: staff!.MaNhanVien,
                    Code: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
                    GiaoDichUrl: '',
                    LinkId: ''
                }
            });

            await tx.yEUCAUHOANVE.updateMany({
                where: { MaYeuCau: { in: MaYeuCaus } },
                data: {
                    MaGiaoDich: transaction.MaGiaoDich,
                    UpdatedAt: new Date()
                }
            });

            return transaction;
        });
        return await this.getTransactionById(ts.MaGiaoDich);
    }

    async updateRefundTransactionStatus(transactionId: string, request: UpdateRefundTransactionStatusDto) {
        const transaction = await this.prisma.gIAODICH.findFirst({
            where: {
                MaGiaoDich: transactionId,
                LoaiGiaoDich: TransactionTypeEnum.HOANTIEN,
                DeletedAt: null
            },
            include: {
                YeuCauHoanVes: true
            }
        });

        if (!transaction) {
            throw new NotFoundException('Giao dịch không tồn tại');
        }

        if (transaction.LoaiGiaoDich !== TransactionTypeEnum.HOANTIEN) {
            throw new BadRequestException('Giao dịch không phải là giao dịch hoàn tiền, không thể cập nhật trạng thái hoàn tiền');
        }

        const newStatus = request.TrangThai;

        await this.prisma.gIAODICH.update({
            where: { MaGiaoDich: transactionId },
            data: {
                TrangThai: newStatus,
                UpdatedAt: new Date()
            }
        });

        if (newStatus === TransactionStatusEnum.THANHCONG) {
            for (const refundRequestId of transaction.YeuCauHoanVes.map(req => req.MaYeuCau)) {
                await this.refundRequestService.updateRefundRequestStatus(refundRequestId, { TrangThai: RefundRequestStatusEnum.DAHOAN }, TransactionEnum.TRUCTUYEN);
            }
        }
        if (newStatus === TransactionStatusEnum.THATBAI) {
            for (const refundRequestId of transaction.YeuCauHoanVes.map(req => req.MaYeuCau)) {
                await this.refundRequestService.updateRefundRequestStatus(refundRequestId, { TrangThai: RefundRequestStatusEnum.DAHUY }, TransactionEnum.TRUCTUYEN);
            }
        }

        return await this.getTransactionById(transactionId);

    }
}