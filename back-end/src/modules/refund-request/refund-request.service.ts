import { BadRequestException, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRefundRequestDto } from './dto/create-refund-request.dto';
import { TicketStatusEnum, SeatStatusEnum, RefundRequestStatusEnum, RoleEnum, TransactionEnum } from 'src/libs/common/enums';
import VoucherTargetEnum from 'src/libs/common/enums/voucher_target.enum';
import { UpdateRefundRequestStatusDto } from './dto/update-refund-request-status.dto';
import { REQUEST } from '@nestjs/core';
import { MailService } from '../mail/mail.service';
import formatCurrency from 'src/libs/common/helpers/format-vn-currency';
import { CursorUtils } from 'src/libs/common/utils/pagination.util';
import { GetRefundRequestDto } from './dto/get-refund-request.dto';

@Injectable({ scope: Scope.REQUEST })
export class RefundRequestService {
    constructor(
        readonly prisma: PrismaService,
        @Inject(REQUEST) private readonly request: any,
        private readonly mailService: MailService,
    ) { }
    async getAllRefundRequests(filters: GetRefundRequestDto) {
        const [data, pagination] = await this.prisma.xprisma.yEUCAUHOANVE.paginate({
            orderBy: [
                { CreatedAt: 'desc' },
                { MaYeuCau: 'desc' }
            ],
            where: { DeletedAt: null },
            include: { HoaDon: true },
        }).withCursor(CursorUtils.getPrismaOptions(filters ?? {}, 'MaYeuCau'));

        return { data, pagination };
    }

    async createNewRefundRequest(refundRequestData: CreateRefundRequestDto): Promise<any> {
        const prisma = this.prisma;
        const inv = await prisma.hOADON.findUnique(
            {
                where: {
                    MaHoaDon: refundRequestData.MaHoaDon,
                    DeletedAt: null
                },
                include: {
                    Ves: true
                }
            }
        )

        if (!inv) {
            throw new NotFoundException('Hóa đơn không tồn tại');
        }

        await validateBankExistence();

        validateRefundRequest();

        const param = await prisma.tHAMSO.findUnique({ where: { TenThamSo: 'RefundWindowHours' } });
        let refundWindowHours = 0;
        if (param && param?.KieuDuLieu === 'int') {
            refundWindowHours = parseInt(param.GiaTri);
        }
        const refundWindow = new Date(inv?.CreatedAt || new Date());
        refundWindow.setHours(refundWindow.getHours() + refundWindowHours);
        if (new Date() > refundWindow) {
            throw new BadRequestException('Vé đã vượt quá thời gian hoàn vé cho phép');
        }

        const createdRefund = await this.prisma.$transaction(async (tx) => {
            const refundRequest = await tx.yEUCAUHOANVE.create({
                data: {
                    MaHoaDon: inv!.MaHoaDon,
                    LyDoHoan: refundRequestData.LyDo,
                    MaNganHang: refundRequestData.MaNganHang,
                    SoTaiKhoan: refundRequestData.SoTaiKhoan,
                    TenChuTaiKhoan: refundRequestData.ChuTaiKhoan,
                    SoTien: inv!.TongTien,
                    TrangThai: RefundRequestStatusEnum.DANGCHO,
                }
            });

            await tx.vE.updateMany({
                where: { MaHoaDon: inv!.MaHoaDon, DeletedAt: null },
                data: { TrangThaiVe: TicketStatusEnum.CHOHOANTIEN, UpdatedAt: new Date() },
            });

            return refundRequest;
        });

        return await this.getRefundRequestById(createdRefund.MaYeuCau);

        async function validateBankExistence() {
            const bank = await prisma.nGANHANG.findUnique({
                where: { MaNganHang: refundRequestData.MaNganHang }
            });

            if (!bank) {
                throw new NotFoundException('Ngân hàng không tồn tại');
            }
        }

        function validateRefundRequest() {
            const usedTickets = inv!.Ves.filter(ve => ve.TrangThaiVe === TicketStatusEnum.DASUDUNG);
            if (usedTickets.length > 0) {
                throw new BadRequestException(`Vé ${usedTickets.map(ve => ve.Code).join(', ')} đã được sử dụng, không thể hoàn vé`);
            }

            const refundedTickets = inv!.Ves.filter(ve => ve.TrangThaiVe == TicketStatusEnum.DAHOAN);
            if (refundedTickets.length > 0) {
                throw new BadRequestException(`Vé ${refundedTickets.map(ve => ve.Code).join(', ')} đã được hoàn, không thể hoàn vé lại`);
            }

            const pendingRefundTickets = inv!.Ves.filter(ve => ve.TrangThaiVe == TicketStatusEnum.CHOHOANTIEN || ve.TrangThaiVe == TicketStatusEnum.CHUAHOANTIEN);
            if (pendingRefundTickets.length > 0) {
                throw new BadRequestException(`Vé ${pendingRefundTickets.map(ve => ve.Code).join(', ')} đang trong quá trình hoàn tiền, không thể hoàn vé lại`);
            }

            const expiredTickets = inv!.Ves.filter(ve => ve.TrangThaiVe == TicketStatusEnum.DAHETHAN);
            if (expiredTickets.length > 0) {
                throw new BadRequestException(`Vé ${expiredTickets.map(ve => ve.Code).join(', ')} đã hết hạn hoàn vé`);
            }
        }
    }

    async getRefundRequestById(id: string): Promise<any> {
        const refundRequest = await this.prisma.yEUCAUHOANVE.findFirst({
            where: { MaYeuCau: id, DeletedAt: null },
            include: {
                HoaDon: {
                    include: {
                        Ves: {
                            include: {
                                GheSuatChieu: {
                                    include: {
                                        SuatChieu: true
                                    }
                                }
                            }
                        },
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

    async updateRefundRequestStatus(id: string, payload: UpdateRefundRequestStatusDto, transactionMethod?: TransactionEnum): Promise<any> {
        const userRole = this.request?.user?.vaitro;
        const userId = this.request?.user?.id;

        const prisma = this.prisma;
        const mailService = this.mailService;

        const newStatus = payload.TrangThai;
        const refundRequest = await this.prisma.yEUCAUHOANVE.findUnique({
            where: { MaYeuCau: id, DeletedAt: null },
            select: {
                TrangThai: true,
                SoTien: true,
                SoTaiKhoan: true,
                TenChuTaiKhoan: true,
                NganHang: {
                    select: {
                        TenNganHang: true,
                        Code: true
                    }
                },
                HoaDon: {
                    select: {
                        Email: true,
                        Code: true,
                        KhachHang: {
                            select: {
                                NguoiDungPhanMem: {
                                    select: {
                                        MaNguoiDung: true,
                                        HoTen: true,
                                    }
                                }
                            }
                        },
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
                        Ves: {
                            select: {
                                GiaVe: true,
                                MaVe: true,
                                Code: true,
                                GheSuatChieu: {
                                    select: {
                                        MaGheSuatChieu: true,
                                        SuatChieu: {
                                            select: {
                                                ThoiGianBatDau: true,
                                                ThoiGianKetThuc: true,
                                                PhienBanPhim: {
                                                    select: {
                                                        Phim: { select: { TenHienThi: true } }
                                                    }
                                                },
                                                PhongChieu: {
                                                    select: { TenPhongChieu: true }
                                                }
                                            }
                                        },
                                        GhePhongChieu: {
                                            select: {
                                                GheLoaiGhe: {
                                                    select: {
                                                        Ghe: { select: { Hang: true, Cot: true } }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                            }
                        },
                    }
                },
                MaGiaoDich: true
            },
        });

        if (!refundRequest) {
            throw new NotFoundException('Yêu cầu hoàn vé không tồn tại');
        }

        if (userRole === RoleEnum.KHACHHANG && userId !== refundRequest?.HoaDon.KhachHang?.NguoiDungPhanMem?.MaNguoiDung) {
            throw new BadRequestException('Bạn không có quyền cập nhật trạng thái yêu cầu hoàn vé này');
        }

        if (refundRequest!.TrangThai === RefundRequestStatusEnum.DAHOAN) {
            throw new BadRequestException(`Hóa đơn đã được hoàn tiền, không thể cập nhật trạng thái`);
        }

        await handleRefundRequestStatus();

        await this.prisma.yEUCAUHOANVE.update({
            where: { MaYeuCau: id },
            data: { TrangThai: newStatus, UpdatedAt: new Date() },
        });

        sendRefundEmailNotification();
        return await this.getRefundRequestById(id);

        function sendRefundEmailNotification() {
            if ((newStatus === RefundRequestStatusEnum.DAHOAN || newStatus === RefundRequestStatusEnum.DAHUY) &&
                transactionMethod === TransactionEnum.TRUCTUYEN &&
                userRole !== RoleEnum.KHACHHANG) {
                const email = refundRequest!.HoaDon.Email;

                const firstTicket = refundRequest!.HoaDon.Ves[0];
                const showTime = new Date(firstTicket.GheSuatChieu.SuatChieu.ThoiGianBatDau);
                const showTimeFormatted = `${showTime.getHours()}:${String(showTime.getMinutes()).padStart(2, '0')} - ${showTime.toLocaleDateString('vi-VN')}`;

                const mailData = {
                    BookingCode: refundRequest!.HoaDon.Code,
                    MovieName: firstTicket.GheSuatChieu.SuatChieu.PhienBanPhim.Phim.TenHienThi,
                    CinemaRoom: firstTicket.GheSuatChieu.SuatChieu.PhongChieu.TenPhongChieu,
                    ShowTime: showTimeFormatted,

                    Tickets: refundRequest!.HoaDon.Ves.map(ve => ({
                        Code: ve.Code,
                        SeatCode: `${ve.GheSuatChieu.GhePhongChieu?.GheLoaiGhe?.Ghe.Hang}${ve.GheSuatChieu.GhePhongChieu?.GheLoaiGhe?.Ghe.Cot}`,
                        Price: formatCurrency(Number(ve.GiaVe || 0))
                    })),

                    Combos: refundRequest!.HoaDon.HoaDonCombos.map(combo => ({
                        Name: combo.Combo.TenCombo,
                        Quantity: combo.SoLuong,
                        Price: formatCurrency(Number(combo.DonGia)),
                        Total: formatCurrency(Number(combo.DonGia) * combo.SoLuong)
                    })),

                    RefundAmount: formatCurrency(Number(refundRequest!.SoTien)),
                    BankAccount: refundRequest!.SoTaiKhoan,
                    BankName: refundRequest!.NganHang?.TenNganHang ?? 'N/A',
                    AccountHolder: refundRequest!.TenChuTaiKhoan,
                    RefundDate: new Date().toLocaleDateString('vi-VN')
                };

                mailService.sendRefundDecisionEmail(email, mailData, newStatus);
            }
        }

        async function handleRefundRequestStatus() {
            switch (newStatus) {
                case RefundRequestStatusEnum.DAHOAN:
                    if (userRole === RoleEnum.KHACHHANG) {
                        throw new BadRequestException('Khách hàng không có quyền cập nhật trạng thái này');
                    }
                    if (refundRequest!.TrangThai === RefundRequestStatusEnum.DAHUY) {
                        throw new BadRequestException(`Yêu cầu hoàn vé đã bị hủy, không thể hoàn tiền`);
                    }
                    if (refundRequest!.MaGiaoDich === null) {
                        throw new BadRequestException(`Yêu cầu hoàn vé chưa có giao dịch hoàn tiền, không thể hoàn tiền`);
                    }

                    for (const ve of refundRequest!.HoaDon.Ves) {
                        await prisma.vE.update({
                            where: { MaVe: ve.MaVe },
                            data: { TrangThaiVe: TicketStatusEnum.DAHOAN, UpdatedAt: new Date() },
                        });

                        await prisma.gHE_SUATCHIEU.update({
                            where: { MaGheSuatChieu: ve.GheSuatChieu.MaGheSuatChieu, DeletedAt: null },
                            data: { TrangThai: SeatStatusEnum.CONTRONG, UpdatedAt: new Date() }
                        });
                    }
                    break;
                case RefundRequestStatusEnum.DAHUY:
                    if (refundRequest!.TrangThai !== RefundRequestStatusEnum.DANGCHO) {
                        throw new BadRequestException(`Yêu cầu hoàn vé không ở trạng thái đang chờ, không thể hủy`);
                    }
                    if (refundRequest!.MaGiaoDich !== null) {
                        throw new BadRequestException(`Yêu cầu hoàn vé đang được xử lý hoàn tiền, không thể hủy`);
                    }

                    for (const ve of refundRequest!.HoaDon.Ves) {
                        let tiketStatus;
                        if (new Date() < ve.GheSuatChieu.SuatChieu.ThoiGianKetThuc) {
                            tiketStatus = TicketStatusEnum.CHUASUDUNG;
                        } else tiketStatus = TicketStatusEnum.DAHETHAN;

                        await prisma.vE.update({
                            where: { MaVe: ve.MaVe },
                            data: { TrangThaiVe: tiketStatus, UpdatedAt: new Date() },
                        });
                    }
                    break;
                case RefundRequestStatusEnum.DANGCHO:
                    throw new BadRequestException('Không thể chuyển trạng thái về đang chờ');
            }
        }
    }
}