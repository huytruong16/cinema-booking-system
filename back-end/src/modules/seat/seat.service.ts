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
    const rows = [...new Set(seats.map((s) => s.Hang))];
    const existingSeats = await this.prisma.gHE.findMany({
      where: {
        Hang: { in: rows },
        DeletedAt: null,
      },
    });

    const existingSeatSet = new Set(
      existingSeats.map((s) => `${s.Hang}-${s.Cot}`),
    );
    const toCreate: CreateSeatDto[] = [];
    const processedKeys = new Set<string>();

    for (const seat of seats) {
      const key = `${seat.Hang}-${seat.Cot}`;
      if (!processedKeys.has(key)) {
        processedKeys.add(key);
        if (!existingSeatSet.has(key)) {
          toCreate.push(seat);
        }
      }
    }

    if (toCreate.length > 0) {
      await this.prisma.gHE.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
    }

    const allSeats = await this.prisma.gHE.findMany({
      where: {
        Hang: { in: rows },
        DeletedAt: null,
      },
    });

    const seatMap = new Map(allSeats.map((s) => [`${s.Hang}-${s.Cot}`, s]));
    const results: any[] = [];

    for (const seat of seats) {
      const key = `${seat.Hang}-${seat.Cot}`;
      const found = seatMap.get(key);
      if (found) {
        results.push(found);
      }
    }

    return results;
  }

  async createSeatSeatType(bodies: CreateSeatSeatTypeDto[]) {
    const maGheList = [...new Set(bodies.map((b) => b.MaGhe))];

    const validSeats = await this.prisma.gHE.findMany({
      where: {
        MaGhe: { in: maGheList },
        DeletedAt: null,
      },
      select: { MaGhe: true },
    });
    const validMaGheSet = new Set(validSeats.map((s) => s.MaGhe));

    const validBodies = bodies.filter((b) => validMaGheSet.has(b.MaGhe));
    if (validBodies.length === 0) return [];

    const existingRelations = await this.prisma.gHE_LOAIGHE.findMany({
      where: {
        MaGhe: { in: validBodies.map((b) => b.MaGhe) },
        DeletedAt: null,
      },
      select: { MaGhe: true, MaLoaiGhe: true },
    });

    const existingSet = new Set(
      existingRelations.map((r) => `${r.MaGhe}-${r.MaLoaiGhe}`),
    );

    const uniqueInputs = new Map<string, CreateSeatSeatTypeDto>();
    for (const b of validBodies) {
      const key = `${b.MaGhe}-${b.MaLoaiGhe}`;
      if (!existingSet.has(key)) {
        uniqueInputs.set(key, b);
      }
    }

    const toCreate = Array.from(uniqueInputs.values());

    if (toCreate.length > 0) {
      await this.prisma.gHE_LOAIGHE.createMany({
        data: toCreate.map((item) => ({
          MaGhe: item.MaGhe,
          MaLoaiGhe: item.MaLoaiGhe,
        })),
        skipDuplicates: true,
      });
    }

    const finalRecords = await this.prisma.gHE_LOAIGHE.findMany({
      where: {
        MaGhe: { in: maGheList },
        DeletedAt: null,
      },
      include: {
        Ghe: true,
        LoaiGhe: true,
      },
    });

    const results: any[] = [];
    for (const body of bodies) {
      if (!validMaGheSet.has(body.MaGhe)) continue;

      const match = finalRecords.find(
        (r) => r.MaGhe === body.MaGhe && r.MaLoaiGhe === body.MaLoaiGhe,
      );
      if (match) {
        results.push(match);
      }
    }

    return results;
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
        void (async () => {
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
