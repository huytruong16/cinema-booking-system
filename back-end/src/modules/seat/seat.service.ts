import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetSeatsDto } from './dtos/get-seat.dto';
import { SeatStatusEnum } from 'src/libs/common/enums';
import { CreateSeatDto } from './dtos/create-seat.dto';
import { CreateSeatSeatTypeDto } from './dtos/create-seat-seat-type.dto';
import { SeatCheckResponseDto } from './dtos/post-check-available.dto';

@Injectable()
export class SeatService {
  constructor(readonly prisma: PrismaService) {}

  // ghế đã chia theo loại ghế
  async getAllSeats(query?: GetSeatsDto) {
    return await this.prisma.gHE_LOAIGHE.findMany({
      where: {
        DeletedAt: null,
        MaLoaiGhe: query?.MaLoaiGhe,
      },
      orderBy: { CreatedAt: 'desc' },
      include: {
        Ghe: true,
        LoaiGhe: true,
      },
    });
  }

  // ghế đã chia theo loại ghế
  async getSeatById(id: string) {
    const seat = await this.prisma.gHE_LOAIGHE.findFirst({
      where: { MaGheLoaiGhe: id, DeletedAt: null },
      include: {
        Ghe: true,
        LoaiGhe: true,
      },
    });

    if (!seat) {
      throw new NotFoundException('Ghế - loại ghế không tồn tại');
    }

    return seat;
  }

  // ghế chưa chia theo loại ghế
  async getAllBaseSeats() {
    const whereClause: any = { DeletedAt: null };

    return await this.prisma.gHE.findMany({
      where: whereClause,
      orderBy: { CreatedAt: 'desc' },
    });
  }

  async getBaseSeatById(id: string) {
    const seat = await this.prisma.gHE.findFirst({
      where: { MaGhe: id, DeletedAt: null },
    });

    if (!seat) {
      throw new NotFoundException('Ghế không tồn tại');
    }

    return seat;
  }

  async createSeats(seats: CreateSeatDto[]): Promise<any[]> {
    const results: any[] = [];
    for (const body of seats) {
      const existingSeat = await this.prisma.gHE.findFirst({
        where: {
          Hang: body.Hang,
          Cot: body.Cot,
          DeletedAt: null,
        },
      });

      if (existingSeat) {
        continue;
      }

      const seat = await this.prisma.gHE.create({
        data: {
          Hang: body.Hang,
          Cot: body.Cot,
        },
      });

      results.push(await this.getBaseSeatById(seat.MaGhe));
    }
    return results;
  }

  async createSeatSeatType(body: CreateSeatSeatTypeDto) {
    const seat = await this.prisma.gHE.findFirst({
      where: {
        MaGhe: body.MaGhe,
        DeletedAt: null,
      },
    });

    if (!seat) {
      throw new NotFoundException('Ghế không tồn tại');
    }

    const existingSeatSeatType = await this.prisma.gHE_LOAIGHE.findFirst({
      where: {
        MaGhe: body.MaGhe,
        MaLoaiGhe: body.MaLoaiGhe,
        DeletedAt: null,
      },
    });

    if (existingSeatSeatType) {
      return { message: 'Ghế - loại ghế đã tồn tại' };
    }

    const seatSeatType = await this.prisma.gHE_LOAIGHE.create({
      data: {
        MaGhe: body.MaGhe,
        MaLoaiGhe: body.MaLoaiGhe,
      },
    });

    return await this.getSeatById(seatSeatType.MaGheLoaiGhe);
  }

  async checkAvailableSeats(id: string): Promise<SeatCheckResponseDto> {
    const prisma = this.prisma;
    const seat = await this.prisma.gHE_SUATCHIEU.findFirst({
      where: { MaGheSuatChieu: id, DeletedAt: null },
    });

    if (!seat) {
      throw new NotFoundException('Ghế suất chiếu không tồn tại');
    }

    if (seat.TrangThai === SeatStatusEnum.CONTRONG) {
      await this.prisma.gHE_SUATCHIEU.update({
        where: { MaGheSuatChieu: id },
        data: { TrangThai: SeatStatusEnum.DANGGIU, UpdatedAt: new Date() },
      });

      await holdSeatForDuration();

      return { ConTrong: true };
    }

    return { ConTrong: false };

    async function holdSeatForDuration() {
      let holdMinutes = 5;

      const param = await prisma.tHAMSO.findFirst({
        where: { TenThamSo: 'SeatHoldDuration' },
      });
      if (param && param.GiaTri && param.KieuDuLieu === 'number') {
        const n = Number(param.GiaTri);
        if (!isNaN(n) && n > 0) holdMinutes = n;
      }

      const timeoutMs = holdMinutes * 60 * 1000;

      setTimeout(() => {
        (async () => {
          try {
            const current = await prisma.gHE_SUATCHIEU.findFirst({
              where: { MaGheSuatChieu: id },
            });
            if (current && current.TrangThai === SeatStatusEnum.DANGGIU) {
              await prisma.gHE_SUATCHIEU.update({
                where: { MaGheSuatChieu: id },
                data: {
                  TrangThai: SeatStatusEnum.CONTRONG,
                  UpdatedAt: new Date(),
                },
              });
            }
          } catch {}
        })();
      }, timeoutMs);
    }
  }
}
