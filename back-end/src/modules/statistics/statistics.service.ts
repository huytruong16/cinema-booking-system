import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomStatusDto } from './dtos/room-status.dto';
import { ScreeningRoomStatusEnum, SeatStatusEnum, ShowtimeStatusEnum } from 'src/libs/common/enums';

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
}
