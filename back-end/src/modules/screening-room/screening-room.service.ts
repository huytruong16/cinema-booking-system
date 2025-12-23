import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScreeningRoomDto } from './dtos/create-screening-room.dto';
import { UpdateScreeningRoomDto } from './dtos/update-screening-room.dto';

@Injectable()
export class ScreeningRoomService {
  constructor(private readonly prisma: PrismaService) {}

  private getSeatsIncludeQuery(): any {
    return {
      where: { DeletedAt: null },
      select: {
        MaGhePhongChieu: true,
        GheLoaiGhe: {
          select: {
            MaGheLoaiGhe: true,
            Ghe: {
              select: {
                MaGhe: true,
                Hang: true,
                Cot: true,
              },
            },
            LoaiGhe: {
              select: {
                MaLoaiGhe: true,
                LoaiGhe: true,
                HeSoGiaGhe: true,
                MauSac: true,
              },
            },
          },
        },
      },
      orderBy: [
        { GheLoaiGhe: { Ghe: { Hang: 'asc' } } },
        { GheLoaiGhe: { Ghe: { Cot: 'asc' } } },
      ],
    };
  }

  async getAllScreeningRooms() {
    return await this.prisma.pHONGCHIEU.findMany({
      orderBy: { CreatedAt: 'desc' },
      where: { DeletedAt: null },
      select: {
        MaPhongChieu: true,
        TenPhongChieu: true,
        SoDoGhe: true,
        GhePhongChieus: this.getSeatsIncludeQuery(),
        CreatedAt: true,
        UpdatedAt: true,
        DeletedAt: true,
      },
    });
  }

  async getScreeningRoomById(id: string) {
    return await this.prisma.pHONGCHIEU.findUnique({
      where: { MaPhongChieu: id, DeletedAt: null },
      include: {
        GhePhongChieus: this.getSeatsIncludeQuery(),
      },
    });
  }

  async createScreeningRoom(data: CreateScreeningRoomDto) {
    const prisma = this.prisma;
    const { TenPhongChieu, SoDoPhongChieu, DanhSachGhe } = data;

    await checkScreeningRoomExists();
    validateSeatConsistency();

    const newScreeningRoomId = await prisma.$transaction(
      async (tx) => {
        const screeningRoom = await tx.pHONGCHIEU.create({
          data: {
            TenPhongChieu,
            SoDoGhe: SoDoPhongChieu,
          },
        });

        const screeningRoomId = screeningRoom.MaPhongChieu;

        for (const { Hang, Cot, MaLoaiGhe } of DanhSachGhe) {
          let seat = await tx.gHE.findFirst({
            where: {
              Hang: Hang,
              Cot: Cot,
              DeletedAt: null,
            },
            select: {
              MaGhe: true,
            },
          });

          if (!seat) {
            seat = await tx.gHE.create({
              data: {
                Hang: Hang,
                Cot: Cot,
              },
            });
          }

          let seatSeatType = await tx.gHE_LOAIGHE.findFirst({
            where: {
              MaGhe: seat.MaGhe,
              MaLoaiGhe: MaLoaiGhe,
              DeletedAt: null,
            },
            select: {
              MaGheLoaiGhe: true,
            },
          });

          if (!seatSeatType) {
            seatSeatType = await tx.gHE_LOAIGHE.create({
              data: {
                MaGhe: seat.MaGhe,
                MaLoaiGhe: MaLoaiGhe,
              },
            });
          }

          await tx.gHE_PHONGCHIEU.create({
            data: {
              MaPhongChieu: screeningRoomId,
              MaGheLoaiGhe: seatSeatType.MaGheLoaiGhe,
            },
          });
        }

        return screeningRoomId;
      },
      {
        timeout: 100000,
      },
    );

    return this.getScreeningRoomById(newScreeningRoomId);

    async function checkScreeningRoomExists() {
      const screeningRoom = await prisma.pHONGCHIEU.findFirst({
        where: { DeletedAt: null, TenPhongChieu: TenPhongChieu },
      });

      if (screeningRoom) {
        throw new BadRequestException('Tên phòng chiếu đã tồn tại');
      }
    }

    function validateSeatConsistency() {
      const layoutSeats = new Set<string>();
      const listSeats = new Set<string>();

      for (const [row, cols] of Object.entries(SoDoPhongChieu)) {
        if (Array.isArray(cols)) {
          cols.forEach((col: string) => {
            if (col && String(col).trim() !== '') {
              layoutSeats.add(`${row}${col}`);
            }
          });
        }
      }

      DanhSachGhe.forEach((seat) => {
        listSeats.add(`${seat.Hang}${seat.Cot}`);
      });

      const missingInList = [...layoutSeats].filter((x) => !listSeats.has(x));
      if (missingInList.length > 0) {
        throw new BadRequestException(
          `Các ghế sau có trong sơ đồ nhưng thiếu thông tin chi tiết: ${missingInList.join(', ')}`,
        );
      }

      const missingInLayout = [...listSeats].filter((x) => !layoutSeats.has(x));
      if (missingInLayout.length > 0) {
        throw new BadRequestException(
          `Các ghế sau có thông tin chi tiết nhưng không có trong sơ đồ: ${missingInLayout.join(', ')}`,
        );
      }
    }
  }

  async updateScreeningRoom(id: string, updateDto: UpdateScreeningRoomDto) {
    const prisma = this.prisma;

    const screeningRoom = await prisma.pHONGCHIEU.findFirst({
      where: { MaPhongChieu: id, DeletedAt: null },
    });

    if (!screeningRoom) {
      throw new NotFoundException(`Phòng chiếu với ID ${id} không tồn tại`);
    }

    if (
      updateDto.TenPhongChieu &&
      updateDto.TenPhongChieu !== screeningRoom.TenPhongChieu
    ) {
      const exists = await prisma.pHONGCHIEU.findFirst({
        where: {
          TenPhongChieu: updateDto.TenPhongChieu,
          MaPhongChieu: { not: id },
          DeletedAt: null,
        },
      });

      if (exists) {
        throw new BadRequestException('Tên phòng chiếu đã tồn tại');
      }
    }

    const updateData: any = {
      UpdatedAt: new Date(),
    };

    if (updateDto.TenPhongChieu !== undefined) {
      updateData.TenPhongChieu = updateDto.TenPhongChieu;
    }

    if (updateDto.SoDoPhongChieu !== undefined) {
      updateData.SoDoGhe = updateDto.SoDoPhongChieu;
    }

    if (updateDto.TrangThai !== undefined) {
      updateData.TrangThai = updateDto.TrangThai;
    }

    await prisma.$transaction(async (tx) => {
      await tx.pHONGCHIEU.update({
        where: { MaPhongChieu: id },
        data: updateData,
      });

      if (updateDto.DanhSachGhe) {
        await tx.gHE_PHONGCHIEU.updateMany({
          where: {
            MaPhongChieu: id,
            DeletedAt: null,
          },
          data: {
            DeletedAt: new Date(),
          },
        });

        for (const seat of updateDto.DanhSachGhe) {
          const { Hang, Cot, MaLoaiGhe } = seat;

          const ghe = await tx.gHE.findFirst({
            where: { Hang, Cot, DeletedAt: null },
            select: { MaGhe: true },
          });

          if (!ghe) {
            throw new BadRequestException(
              `Ghế tại hàng ${Hang} cột ${Cot} không tồn tại`,
            );
          }

          const gheLoai = await tx.gHE_LOAIGHE.findFirst({
            where: {
              MaGhe: ghe.MaGhe,
              MaLoaiGhe,
              DeletedAt: null,
            },
            select: { MaGheLoaiGhe: true },
          });

          if (!gheLoai) {
            throw new BadRequestException(
              `Ghế ${Hang}${Cot} không có loại ghế được chọn`,
            );
          }

          await tx.gHE_PHONGCHIEU.create({
            data: {
              MaPhongChieu: id,
              MaGheLoaiGhe: gheLoai.MaGheLoaiGhe,
            },
          });
        }
      }
    });

    return {
      message: 'Cập nhật phòng chiếu thành công',
    };
  }

  async removeScreeningRoom(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const phong = await tx.pHONGCHIEU.findFirst({
        where: {
          MaPhongChieu: id,
          DeletedAt: null,
        },
      });

      if (!phong) {
        throw new NotFoundException(`Phòng chiếu với ID ${id} không tồn tại`);
      }

      const existShowtime = await tx.sUATCHIEU.findFirst({
        where: {
          MaPhongChieu: id,
          DeletedAt: null,
        },
        select: { MaSuatChieu: true },
      });

      if (existShowtime) {
        throw new BadRequestException(
          'Không thể xoá phòng chiếu vì vẫn còn suất chiếu',
        );
      }

      await tx.gHE_PHONGCHIEU.updateMany({
        where: {
          MaPhongChieu: id,
          DeletedAt: null,
        },
        data: {
          DeletedAt: new Date(),
        },
      });

      await tx.pHONGCHIEU.update({
        where: { MaPhongChieu: id },
        data: {
          DeletedAt: new Date(),
        },
      });

      return {
        message: 'Xóa phòng chiếu thành công',
      };
    });
  }
}
