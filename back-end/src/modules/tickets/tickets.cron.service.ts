import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatusEnum } from 'src/libs/common/enums/ticket-status.enum';

@Injectable()
export class TicketsCronService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleUpdateTicketStatus() {
    const now = new Date();

    const expiredTickets = await this.prisma.vE.findMany({
      where: {
        TrangThaiVe: TicketStatusEnum.CHUASUDUNG,
        GheSuatChieu: {
          SuatChieu: {
            ThoiGianKetThuc: {
              lt: now,
            },
          },
        },
        DeletedAt: null,
      },
      select: { MaVe: true },
    });

    if (expiredTickets.length > 0) {
      const ids = expiredTickets.map((t) => t.MaVe);

      await this.prisma.vE.updateMany({
        where: {
          MaVe: { in: ids },
        },
        data: {
          TrangThaiVe: TicketStatusEnum.DAHETHAN,
        },
      });
    }
  }
}
