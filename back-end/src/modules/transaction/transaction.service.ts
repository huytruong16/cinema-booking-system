import { Injectable } from "@nestjs/common";
import { SeatStatusEnum, TransactionStatusEnum, TransactionTypeEnum } from "src/libs/common/enums";
import { PayosService } from "src/libs/common/services/payos.service";
import InvoiceMailDto from "src/modules/mail/dto/invoice-mail.dto";
import { MailService } from "src/modules/mail/mail.service";
import { PrismaService } from "src/modules/prisma/prisma.service";

@Injectable()
export class TransactionService {
    constructor(private readonly prisma: PrismaService, private readonly payosService: PayosService, private readonly mailService: MailService) { }

    private async sendInvoiceEmail(invoice: NonNullable<any>) {
        const emailData: InvoiceMailDto = {
            Transaction: {
                GiaoDich: {
                    HoaDon: {
                        CreatedAt: invoice.CreatedAt.toLocaleDateString('vi-VN'),
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
        await this.mailService.sendInvoiceEmail(
            emailData.Transaction.GiaoDich.HoaDon.Email,
            'Xác nhận đặt vé thành công',
            emailData
        );
    }

    async getAllTransactions() {
        return await this.prisma.gIAODICH.findMany({
            where: { DeletedAt: null },
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
}