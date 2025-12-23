import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dtos/create-genre.dto';
import { ConflictException } from '@nestjs/common/exceptions/conflict.exception';

@Injectable()
export class GenreService {
  constructor(readonly prisma: PrismaService) {}

  async getAllGenres() {
    return await this.prisma.tHELOAI.findMany({
      orderBy: { TenTheLoai: 'asc' },
      where: { DeletedAt: null },
    });
  }

  async getGenreById(id: string) {
    const genre = await this.prisma.tHELOAI.findUnique({
      where: { MaTheLoai: id, DeletedAt: null },
    });

    if (!genre) {
      throw new NotFoundException('Thể loại không tồn tại');
    }

    return genre;
  }

  async createGenre(payload: CreateGenreDto) {
    const exists = await this.prisma.tHELOAI.findFirst({
      where: {
        TenTheLoai: payload.TenTheLoai,
        DeletedAt: null,
      },
    });

    if (exists) {
      throw new ConflictException('Tên thể loại đã tồn tại');
    }

    const genre = await this.prisma.tHELOAI.create({
      data: {
        TenTheLoai: payload.TenTheLoai,
        CreatedAt: new Date(),
      },
    });

    return {
      message: 'Tạo thể loại thành công',
      genre,
    };
  }

  async updateGenre(id: string, updateDto: CreateGenreDto) {
    const genre = await this.prisma.tHELOAI.findFirst({
      where: { MaTheLoai: id, DeletedAt: null },
    });

    if (!genre) {
      throw new NotFoundException(`Thể loại với ID ${id} không tồn tại`);
    }

    if (updateDto.TenTheLoai && updateDto.TenTheLoai !== genre.TenTheLoai) {
      const exists = await this.prisma.tHELOAI.findFirst({
        where: {
          TenTheLoai: updateDto.TenTheLoai,
          MaTheLoai: { not: id },
          DeletedAt: null,
        },
      });

      if (exists) {
        throw new ConflictException('Tên thể loại đã tồn tại');
      }
    }

    const updateData: any = {
      UpdatedAt: new Date(),
    };

    if (updateDto.TenTheLoai !== undefined) {
      updateData.TenTheLoai = updateDto.TenTheLoai;
    }

    const updated = await this.prisma.tHELOAI.update({
      where: { MaTheLoai: id },
      data: updateData,
    });

    return {
      message: 'Cập nhật thể loại thành công',
      genre: updated,
    };
  }

  async removeGenre(id: string) {
    const genre = await this.prisma.tHELOAI.findFirst({
      where: { MaTheLoai: id, DeletedAt: null },
    });

    if (!genre) {
      throw new NotFoundException(`Thể loại với ID ${id} không tồn tại`);
    }

    await this.prisma.tHELOAI.update({
      where: { MaTheLoai: id },
      data: {
        DeletedAt: new Date(),
      },
    });

    return { message: 'Xóa thể loại thành công' };
  }
}
