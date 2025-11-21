import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomStatusDto } from './dtos/room-status.dto';
import { ScreeningRoomStatusEnum, SeatStatusEnum, ShowtimeStatusEnum } from 'src/libs/common/enums';
import { SummaryDto } from './dtos/summary.dto';
import { GetSummaryQueryDto } from './dtos/get-summary-query.dto';

@Injectable()
export class StatisticsService {
    constructor(private readonly prisma: PrismaService) { }

    private convertToVietnamTime(date: Date): string {
        return new Date(date.getTime() + 7 * 60 * 60 * 1000).toISOString();
    }

    async getRoomStatus(): Promise<RoomStatusDto[]> {
        const now = new Date();

        const rooms = await this.prisma.pHONGCHIEU.findMany({
            where: { DeletedAt: null },
            include: {
                SuatChieus: {
                    where: { DeletedAt: null },
                    include: {
                        GheSuatChieus: {
                            where: { DeletedAt: null },
                        },
                        PhienBanPhim: {
                            include: {
                                Phim: true,
                            },
                        },
                    },
                    orderBy: {
                        ThoiGianBatDau: 'asc',
                    },
                },
            },
        });

        const roomStatusList: RoomStatusDto[] = [];

        for (const room of rooms) {
            const currentShowtime = room.SuatChieus.find(
                (sc) =>
                    sc.ThoiGianBatDau <= now &&
                    now <= sc.ThoiGianKetThuc &&
                    sc.DeletedAt === null,
            );

            const nextShowtime = room.SuatChieus.find(
                (sc) =>
                    sc.ThoiGianBatDau > now &&
                    sc.DeletedAt === null,
            );

            const roomStatusData: RoomStatusDto = {
                PhongChieu: {
                    MaPhongChieu: room.MaPhongChieu,
                    TenPhongChieu: room.TenPhongChieu,
                },
                TrangThai: ScreeningRoomStatusEnum.TRONG,
            };

            if (currentShowtime) {
                const bookedSeats = currentShowtime.GheSuatChieus.filter(
                    (gs) => gs.TrangThai !== SeatStatusEnum.CONTRONG,
                ).length;
                const totalSeatsInShowtime = currentShowtime.GheSuatChieus.length;

                roomStatusData.TrangThai = ScreeningRoomStatusEnum.DANGCHIEU;
                roomStatusData.GheDaDat = bookedSeats;
                roomStatusData.TongGhe = totalSeatsInShowtime;
                roomStatusData.SuatChieuHienTai = {
                    MaSuatChieu: currentShowtime.MaSuatChieu,
                    MaPhim: currentShowtime.PhienBanPhim?.MaPhim || '',
                    TenPhim: currentShowtime.PhienBanPhim?.Phim?.TenHienThi || '',
                    ThoiGianBatDau: this.convertToVietnamTime(currentShowtime.ThoiGianBatDau),
                    ThoiGianKetThuc: this.convertToVietnamTime(currentShowtime.ThoiGianKetThuc),
                };
            } else if (nextShowtime) {
                const timeDiffMs = nextShowtime.ThoiGianBatDau.getTime() - now.getTime();
                const timeDiffMinutes = Math.floor(timeDiffMs / (1000 * 60));

                if (timeDiffMinutes < 30) {
                    roomStatusData.TrangThai = ScreeningRoomStatusEnum.SAPCHIEU;
                } else {
                    roomStatusData.TrangThai = ScreeningRoomStatusEnum.TRONG;
                }
                const bookedSeats = nextShowtime.GheSuatChieus.filter(
                    (gs) => gs.TrangThai !== SeatStatusEnum.CONTRONG,
                ).length;

                roomStatusData.GheDaDat = bookedSeats;
                roomStatusData.TongGhe = nextShowtime.GheSuatChieus.length;
                roomStatusData.SuatChieuTiepTheo = {
                    MaSuatChieu: nextShowtime.MaSuatChieu,
                    MaPhim: nextShowtime.PhienBanPhim?.MaPhim || '',
                    TenPhim: nextShowtime.PhienBanPhim?.Phim?.TenHienThi || '',
                    ThoiGianBatDau: this.convertToVietnamTime(nextShowtime.ThoiGianBatDau),
                    ThoiGianKetThuc: this.convertToVietnamTime(nextShowtime.ThoiGianKetThuc),
                    SoPhutConLai: timeDiffMinutes,
                };
            }

            roomStatusList.push(roomStatusData);
        }

        return roomStatusList;
    }

    async updateShowtimeStatuses(): Promise<void> {
        const now = new Date();

        const upcomingShowtimes = await this.prisma.sUATCHIEU.findMany({
            where: {
                TrangThai: ShowtimeStatusEnum.CHUACHIEU,
                ThoiGianBatDau: {
                    lte: new Date(now.getTime() + 30 * 60 * 1000),
                    gt: now,
                },
                DeletedAt: null,
            },
        });

        for (const showtime of upcomingShowtimes) {
            await this.prisma.sUATCHIEU.update({
                where: { MaSuatChieu: showtime.MaSuatChieu },
                data: { TrangThai: ShowtimeStatusEnum.SAPCHIEU },
            });
        }

        const currentShowtimes = await this.prisma.sUATCHIEU.findMany({
            where: {
                TrangThai: ShowtimeStatusEnum.SAPCHIEU,
                ThoiGianBatDau: {
                    lte: now,
                },
                ThoiGianKetThuc: {
                    gt: now,
                },
                DeletedAt: null,
            },
        });

        for (const showtime of currentShowtimes) {
            await this.prisma.sUATCHIEU.update({
                where: { MaSuatChieu: showtime.MaSuatChieu },
                data: { TrangThai: ShowtimeStatusEnum.DANGCHIEU },
            });
        }

        const completedShowtimes = await this.prisma.sUATCHIEU.findMany({
            where: {
                TrangThai: ShowtimeStatusEnum.DANGCHIEU,
                ThoiGianKetThuc: {
                    lt: now,
                },
                DeletedAt: null,
            },
        });

        for (const showtime of completedShowtimes) {
            await this.prisma.sUATCHIEU.update({
                where: { MaSuatChieu: showtime.MaSuatChieu },
                data: { TrangThai: ShowtimeStatusEnum.DACHIEU },
            });
        }
    }

    async getSummary(filter: GetSummaryQueryDto): Promise<SummaryDto> {
        const targetDate = filter.date ? new Date(filter.date) : new Date();
        console.log('Target date for summary:', targetDate);

        const y = targetDate.getFullYear();
        const m = targetDate.getMonth();
        const d = targetDate.getDate();

        let start: Date;
        let end: Date;
        let prevStart: Date;
        let prevEnd: Date;

        if (filter.mode === 'day') {
            start = new Date(y, m, d - 1, 0, 0, 0, 0);
            end = new Date(y, m, d, 0, 0, 0, 0);
            prevStart = new Date(y, m, d - 1, 0, 0, 0, 0);
            prevEnd = new Date(y, m, d, 0, 0, 0, 0);
        } else if (filter.mode === 'week') {
            const dayOfWeek = targetDate.getDay();
            const offsetToMonday = (dayOfWeek + 6) % 7;
            const monday = new Date(y, m, d - offsetToMonday, 0, 0, 0, 0);
            start = monday;
            end = new Date(monday.getTime());
            end.setDate(monday.getDate() + 7);
            prevStart = new Date(monday.getTime());
            prevStart.setDate(monday.getDate() - 7);
            prevEnd = monday;
        } else if (filter.mode === 'year') {
            start = new Date(y, 0, 1, 0, 0, 0, 0);
            end = new Date(y + 1, 0, 1, 0, 0, 0, 0);
            prevStart = new Date(y - 1, 0, 1, 0, 0, 0, 0);
            prevEnd = new Date(y, 0, 1, 0, 0, 0, 0);
        } else {
            start = new Date(y, m, 1, 0, 0, 0, 0);
            end = new Date(y, m + 1, 1, 0, 0, 0, 0);
            prevStart = new Date(y, m - 1, 1, 0, 0, 0, 0);
            prevEnd = new Date(y, m, 1, 0, 0, 0, 0);
        }

        console.log('Start date for summary:', start);
        console.log('End date for summary:', end);
        console.log('Previous period start date for summary:', prevStart);
        console.log('Previous period end date for summary:', prevEnd);

        const invoices = await this.prisma.hOADON.findMany({
            where: {
                DeletedAt: null,
                NgayLap: { gte: start, lt: end }
            },
            include: { Ves: true }
        });
        const revenue = invoices.reduce((sum, invoice) => {
            const invoiceTotal = invoice.Ves.reduce((veSum, ve) => veSum + Number(ve.GiaVe || 0), 0);
            return sum + invoiceTotal;
        }, 0);

        const preInvoices = await this.prisma.hOADON.findMany({
            where: {
                DeletedAt: null,
                NgayLap: { gte: prevStart, lt: prevEnd }
            },
            include: { Ves: true }
        });

        const prevRevenue = preInvoices.reduce((sum, invoice) => {
            const invoiceTotal = invoice.Ves.reduce((veSum, ve) => veSum + Number(ve.GiaVe || 0), 0);
            return sum + invoiceTotal;
        }, 0);

        const ticketsSold = await this.prisma.vE.count({
            where: {
                DeletedAt: null,
                TrangThaiVe: { in: ['CHUASUDUNG', 'DASUDUNG'] },
                HoaDon: {
                    DeletedAt: null,
                    NgayLap: { gte: start, lt: end }
                }
            }
        });

        const prevTicketsSold = await this.prisma.vE.count({
            where: {
                DeletedAt: null,
                TrangThaiVe: { in: ['CHUASUDUNG', 'DASUDUNG'] },
                HoaDon: {
                    DeletedAt: null,
                    NgayLap: { gte: prevStart, lt: prevEnd }
                }
            }
        });

        const comboRecords = await this.prisma.hOADONCOMBO.findMany({
            where: {
                DeletedAt: null,
                HoaDon: {
                    DeletedAt: null,
                    NgayLap: { gte: start, lt: end }
                }
            },
            select: { SoLuong: true, DonGia: true }
        });
        const comboRevenue = comboRecords.reduce((sum, r) => {
            const price = Number(r.DonGia);
            return sum + r.SoLuong * price;
        }, 0);

        const showtimes = await this.prisma.sUATCHIEU.findMany({
            where: {
                DeletedAt: null,
                ThoiGianBatDau: { gte: start, lt: end },
            },
            include: {
                GheSuatChieus: {
                    where: { DeletedAt: null }
                }
            }
        });
        console.log('Showtimes for occupancy rate calculation:', showtimes.length);

        let totalSeats = 0;
        let bookedSeats = 0;
        for (const st of showtimes) {
            totalSeats += st.GheSuatChieus.length;
            bookedSeats += st.GheSuatChieus.filter(gs => gs.TrangThai === SeatStatusEnum.DADAT).length;
        }
        const occupancyRate = totalSeats === 0 ? 0 : Number(((bookedSeats / totalSeats) * 100).toFixed(1));

        const revenueChangePercent = prevRevenue > 0
            ? Number((((revenue - prevRevenue) / prevRevenue) * 100).toFixed(1))
            : 0;
        const ticketsDiff = ticketsSold - prevTicketsSold;

        return {
            LoaiThongKe: filter.mode,
            NgayBatDau: start.toISOString(),
            NgayKetThuc: end.toISOString(),
            TongDoanhThu: revenue + comboRevenue,
            DoanhThuVe: revenue,
            SoVeDaBan: ticketsSold,
            TiLeLapDay: occupancyRate,
            DoanhThuCombo: comboRevenue,
            SoSanh: {
                DoanhThuVe: revenueChangePercent,
                SoVeDaBan: ticketsDiff
            }
        };
    }
}
