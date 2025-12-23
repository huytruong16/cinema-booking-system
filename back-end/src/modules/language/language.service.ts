import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import { CreateLanguageDto } from './dtos/create-language.dto';
import { UpdateLanguageDto } from './dtos/update-language.dto';

@Injectable()
export class LanguageService {
  constructor(readonly prisma: PrismaService) {}

  async getAllLanguages() {
    return await this.prisma.nGONNGU.findMany({
      orderBy: { CreatedAt: 'desc' },
      where: { DeletedAt: null },
    });
  }

  async getLanguageById(id: string) {
    const language = await this.prisma.nGONNGU.findUnique({
      where: { MaNgonNgu: id, DeletedAt: null },
    });

    if (!language) {
      throw new NotFoundException('Ngôn ngữ không tồn tại');
    }

    return language;
  }

  async createLanguage(payload: CreateLanguageDto) {
    const exists = await this.prisma.nGONNGU.findFirst({
      where: {
        TenNgonNgu: payload.TenNgonNgu,
        DeletedAt: null,
      },
    });

    if (exists) {
      throw new ConflictException('Tên ngôn ngữ đã tồn tại');
    }

    const language = await this.prisma.nGONNGU.create({
      data: {
        TenNgonNgu: payload.TenNgonNgu,
        CreatedAt: new Date(),
      },
    });

    return {
      message: 'Tạo ngôn ngữ thành công',
      language,
    };
  }

  async updateLanguage(id: string, updateDto: UpdateLanguageDto) {
    const language = await this.prisma.nGONNGU.findFirst({
      where: { MaNgonNgu: id, DeletedAt: null },
    });

    if (!language) {
      throw new NotFoundException(`Ngôn ngữ với ID ${id} không tồn tại`);
    }

    if (updateDto.TenNgonNgu && updateDto.TenNgonNgu !== language.TenNgonNgu) {
      const exists = await this.prisma.nGONNGU.findFirst({
        where: {
          TenNgonNgu: updateDto.TenNgonNgu,
          MaNgonNgu: { not: id },
          DeletedAt: null,
        },
      });

      if (exists) {
        throw new ConflictException('Tên ngôn ngữ đã tồn tại');
      }
    }

    const updateData: any = {
      UpdatedAt: new Date(),
    };

    if (updateDto.TenNgonNgu !== undefined) {
      updateData.TenNgonNgu = updateDto.TenNgonNgu;
    }

    const updated = await this.prisma.nGONNGU.update({
      where: { MaNgonNgu: id },
      data: updateData,
    });

    return {
      message: 'Cập nhật ngôn ngữ thành công',
      language: updated,
    };
  }

  async removeLanguage(id: string) {
    const language = await this.prisma.nGONNGU.findFirst({
      where: { MaNgonNgu: id, DeletedAt: null },
    });

    if (!language) {
      throw new NotFoundException(`Ngôn ngữ với ID ${id} không tồn tại`);
    }

    await this.prisma.nGONNGU.update({
      where: { MaNgonNgu: id },
      data: {
        DeletedAt: new Date(),
      },
    });

    return { message: 'Xóa ngôn ngữ thành công' };
  }
}
