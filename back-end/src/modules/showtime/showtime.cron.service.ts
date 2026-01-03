import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ShowtimeStatusEnum } from 'src/libs/common/enums/showtime-status.enum';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShowtimeCronService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleUpdateShowtimeStatus() {
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
