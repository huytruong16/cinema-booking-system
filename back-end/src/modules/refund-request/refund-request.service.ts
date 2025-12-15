import { BadRequestException, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRefundRequestDto } from './dto/create-refund-request.dto';
import { TicketStatusEnum, SeatStatusEnum, RefundRequestStatusEnum, RoleEnum } from 'src/libs/common/enums';
import VoucherTargetEnum from 'src/libs/common/enums/voucher_target.enum';
import { UpdateRefundRequestStatusDto } from './dto/update-refund-request-status.dto';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class RefundRequestService {
    constructor(
        readonly prisma: PrismaService,
        @Inject(REQUEST) private readonly request: any,
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

    async updateRefundRequestStatus(id: string, payload: UpdateRefundRequestStatusDto): Promise<any> {
        const vaitro = this.request?.user?.vaitro;
        const userId = this.request?.user?.id;

        const newStatus = payload.TrangThai;
        const refundRequest = await this.prisma.yEUCAUHOANVE.findUnique({
            where: { MaYeuCau: id, DeletedAt: null },
            select: {
                TrangThai: true,
                Ve: {
                    select: {
                        MaVe: true,
                        Code: true,
                        GheSuatChieu: {
                            select: {
                                MaGheSuatChieu: true,
                                SuatChieu: {
                                    select: {
                                        ThoiGianBatDau: true,
                                        ThoiGianKetThuc: true,
                                    }
                                }
                            }
                        },
                        HoaDon: {
                            select: {
                                KhachHang: {
                                    select: {
                                        MaNguoiDung: true
                                    }
                                }
                            }
                        }
                    }
                },
                MaGiaoDich: true
            },
        });

        if (!refundRequest) {
            throw new NotFoundException('Yêu cầu hoàn vé không tồn tại');
        }

        if (vaitro === RoleEnum.KHACHHANG && userId !== refundRequest?.Ve.HoaDon.KhachHang?.MaNguoiDung) {
            throw new BadRequestException('Bạn không có quyền cập nhật trạng thái yêu cầu hoàn vé này');
        }

        if (refundRequest!.TrangThai === RefundRequestStatusEnum.DAHOAN) {
            throw new BadRequestException(`Vé ${refundRequest!.Ve.Code} đã được hoàn tiền, không thể cập nhật trạng thái`);
        }

        switch (newStatus) {
            case RefundRequestStatusEnum.DAHOAN:
                if (vaitro === RoleEnum.KHACHHANG) {
                    throw new BadRequestException('Khách hàng không có quyền cập nhật trạng thái này');
                }
                if (refundRequest!.TrangThai === RefundRequestStatusEnum.DAHUY) {
                    throw new BadRequestException(`Yêu cầu hoàn vé cho vé ${refundRequest!.Ve.Code} đã bị hủy, không thể hoàn tiền`);
                }
                if (refundRequest!.MaGiaoDich === null) {
                    throw new BadRequestException(`Yêu cầu hoàn vé cho vé ${refundRequest!.Ve.Code} chưa có giao dịch hoàn tiền, không thể hoàn tiền`);
                }

                await this.prisma.vE.update({
                    where: { MaVe: refundRequest!.Ve.MaVe },
                    data: { TrangThaiVe: TicketStatusEnum.DAHOAN, UpdatedAt: new Date() },
                });

                await this.prisma.gHE_SUATCHIEU.update({
                    where: { MaGheSuatChieu: refundRequest!.Ve.GheSuatChieu.MaGheSuatChieu, DeletedAt: null },
                    data: { TrangThai: SeatStatusEnum.CONTRONG, UpdatedAt: new Date() }
                });
                break;
            case RefundRequestStatusEnum.DAHUY:
                if (refundRequest!.TrangThai !== RefundRequestStatusEnum.DANGCHO) {
                    throw new BadRequestException(`Yêu cầu hoàn vé cho vé ${refundRequest!.Ve.Code} không ở trạng thái đang chờ, không thể hủy`);
                }
                if (refundRequest!.MaGiaoDich !== null) {
                    throw new BadRequestException(`Yêu cầu hoàn vé cho vé ${refundRequest!.Ve.Code} đang được xử lý hoàn tiền, không thể hủy`);
                }

                let tiketStatus;
                if (new Date() < refundRequest!.Ve.GheSuatChieu.SuatChieu.ThoiGianKetThuc) {
                    tiketStatus = TicketStatusEnum.CHUASUDUNG;
                } else tiketStatus = tiketStatus.DAHETHAN;


                await this.prisma.vE.update({
                    where: { MaVe: refundRequest!.Ve.MaVe },
                    data: { TrangThaiVe: tiketStatus, UpdatedAt: new Date() },
                });
                break;
            case RefundRequestStatusEnum.DANGCHO:
                throw new BadRequestException('Không thể chuyển trạng thái về đang chờ');
        }

        await this.prisma.yEUCAUHOANVE.update({
            where: { MaYeuCau: id },
            data: { TrangThai: newStatus, UpdatedAt: new Date() },
        });

        return await this.getRefundRequestById(id);
    }
}