import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import { CreateSeatTypeDto } from './dtos/create-seat-type.dto';
import { UpdateSeatTypeDto } from './dtos/update-seat-type.dto';

@Injectable()
export class SeatTypeService {
  constructor(readonly prisma: PrismaService) {}

  async getAllSeatTypes() {
    return await this.prisma.lOAIGHE.findMany({
      orderBy: { CreatedAt: 'desc' },
      where: { DeletedAt: null },
    });
  }

  async getSeatTypeById(id: string) {
    const seatType = await this.prisma.lOAIGHE.findUnique({
      where: { MaLoaiGhe: id, DeletedAt: null },
    });

    if (!seatType) {
      throw new NotFoundException('Loại ghế không tồn tại');
    }

    return seatType;
  }

  async createSeatType(payload: CreateSeatTypeDto) {
    const exists = await this.prisma.lOAIGHE.findFirst({
      where: {
        LoaiGhe: payload.LoaiGhe,
        DeletedAt: null,
      },
    });

    if (exists) {
      throw new ConflictException('Loại ghế đã tồn tại');
    }

    const seatType = await this.prisma.lOAIGHE.create({
      data: {
        LoaiGhe: payload.LoaiGhe,
        HeSoGiaGhe: payload.HeSoGiaGhe ?? 1.0,
        CreatedAt: new Date(),
        MauSac: payload.MauSac,
      },
    });

    return {
      message: 'Tạo loại ghế thành công',
      seatType,
    };
  }

  async updateSeatType(id: string, updateDto: UpdateSeatTypeDto) {
    const seatType = await this.prisma.lOAIGHE.findFirst({
      where: { MaLoaiGhe: id, DeletedAt: null },
    });

    if (!seatType) {
      throw new NotFoundException(`Loại ghế với ID ${id} không tồn tại`);
    }

    if (updateDto.LoaiGhe && updateDto.LoaiGhe !== seatType.LoaiGhe) {
      const exists = await this.prisma.lOAIGHE.findFirst({
        where: {
          LoaiGhe: updateDto.LoaiGhe,
          MaLoaiGhe: { not: id },
          DeletedAt: null,
        },
      });

      if (exists) {
        throw new ConflictException('Loại ghế đã tồn tại');
      }
    }

    const updateData: any = {
      UpdatedAt: new Date(),
    };

    if (updateDto.LoaiGhe !== undefined) {
      updateData.LoaiGhe = updateDto.LoaiGhe;
    }

    if (updateDto.HeSoGiaGhe !== undefined) {
      updateData.HeSoGiaGhe = updateDto.HeSoGiaGhe;
    }

    if (updateDto.MauSac !== undefined) {
      updateData.MauSac = updateDto.MauSac;
    }

    const updated = await this.prisma.lOAIGHE.update({
      where: { MaLoaiGhe: id },
      data: updateData,
    });

    return {
      message: 'Cập nhật loại ghế thành công',
      seatType: updated,
    };
  }

  async removeSeatType(id: string) {
    const seatType = await this.prisma.lOAIGHE.findFirst({
      where: { MaLoaiGhe: id, DeletedAt: null },
    });

    if (!seatType) {
      throw new NotFoundException(`Loại ghế với ID ${id} không tồn tại`);
    }

    await this.prisma.lOAIGHE.update({
      where: { MaLoaiGhe: id },
      data: {
        DeletedAt: new Date(),
      },
    });

    return { message: 'Xóa loại ghế thành công' };
  }
}
