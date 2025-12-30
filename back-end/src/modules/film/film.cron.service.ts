import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { FilmStatusEnum } from 'src/libs/common/enums';

@Injectable()
export class FilmCronService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    const now = new Date();

    await this.prisma.pHIM.updateMany({
      where: {
        DeletedAt: null,
        NgayBatDauChieu: { lte: now },
        NgayKetThucChieu: { gte: now },
        TrangThaiPhim: { not: FilmStatusEnum.DANGCHIEU },
      },
      data: {
        TrangThaiPhim: FilmStatusEnum.DANGCHIEU,
      },
    });

    await this.prisma.pHIM.updateMany({
      where: {
        DeletedAt: null,
        NgayBatDauChieu: { gt: now },
        TrangThaiPhim: { not: FilmStatusEnum.SAPCHIEU },
      },
      data: {
        TrangThaiPhim: FilmStatusEnum.SAPCHIEU,
      },
    });

    await this.prisma.pHIM.updateMany({
      where: {
        DeletedAt: null,
        NgayKetThucChieu: { lt: now },
        TrangThaiPhim: { not: FilmStatusEnum.NGUNGCHIEU },
      },
      data: {
        TrangThaiPhim: FilmStatusEnum.NGUNGCHIEU,
      },
    });
  }
}
