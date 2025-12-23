import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateComboDto } from './dtos/create-combo.dto';
import { UpdateComboDto } from './dtos/update-combo.dto';
import { CursorUtils } from 'src/libs/common/utils/pagination.util';

@Injectable()
export class ComboService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async getAllCombos(filters?: any) {
    const where: any = { DeletedAt: null };
    if (filters?.TrangThai) where.TrangThai = filters.TrangThai;

    const [data, pagination] = await this.prisma.xprisma.cOMBO
      .paginate({
        orderBy: [{ CreatedAt: 'desc' }, { MaCombo: 'desc' }],
        where,
        include: {
          HoaDonCombos: false,
        },
      })
      .withCursor(CursorUtils.getPrismaOptions(filters ?? {}, 'MaCombo'));

    return { data, pagination };
  }

  async getComboById(id: string) {
    const combo = await this.prisma.cOMBO.findUnique({
      where: { MaCombo: id, DeletedAt: null },
      include: {
        HoaDonCombos: false,
      },
    });

    if (!combo) {
      throw new NotFoundException(`Combo với ID ${id} không tồn tại`);
    }

    return combo;
  }

  async createCombo(dto: CreateComboDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng upload hình ảnh cho combo');
    }

    const existingCombo = await this.prisma.cOMBO.findFirst({
      where: {
        TenCombo: dto.TenCombo,
        DeletedAt: null,
      },
    });

    if (existingCombo) {
      throw new ConflictException(`Combo ${dto.TenCombo} đã tồn tại`);
    }

    const uploaded = await this.storageService.uploadFile(file, {
      bucket: 'combos',
      folder: 'combo-images',
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    });

    return await this.prisma.cOMBO.create({
      data: {
        TenCombo: dto.TenCombo,
        MoTa: dto.MoTa,
        GiaTien: dto.GiaTien,
        TrangThai: dto.TrangThai,
        HinhAnh: uploaded.url,
        CreatedAt: new Date(),
      },
    });
  }

  async updateCombo(
    id: string,
    dto: UpdateComboDto,
    file?: Express.Multer.File,
  ) {
    const combo = await this.getComboById(id);

    if (dto.TenCombo !== undefined && dto.TenCombo !== combo.TenCombo) {
      const existingCombo = await this.prisma.cOMBO.findFirst({
        where: {
          TenCombo: dto.TenCombo,
          DeletedAt: null,
          MaCombo: { not: id },
        },
      });

      if (existingCombo) {
        throw new ConflictException(`Combo ${dto.TenCombo} đã tồn tại`);
      }
    }

    const updateData: any = {
      UpdatedAt: new Date(),
    };

    if (dto.TenCombo !== undefined) updateData.TenCombo = dto.TenCombo;
    if (dto.MoTa !== undefined) updateData.MoTa = dto.MoTa;
    if (dto.GiaTien !== undefined) updateData.GiaTien = dto.GiaTien;
    if (dto.TrangThai !== undefined) updateData.TrangThai = dto.TrangThai;

    if (file) {
      if (combo.HinhAnh) {
        await this.storageService.deleteFile('combos', combo.HinhAnh);
      }

      const uploaded = await this.storageService.uploadFile(file, {
        bucket: 'combos',
        folder: 'combo-images',
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });
      updateData.HinhAnh = uploaded.url;
    }

    return await this.prisma.cOMBO.update({
      where: { MaCombo: id },
      data: updateData,
    });
  }

  async removeCombo(id: string) {
    const combo = await this.getComboById(id);

    if (combo.HinhAnh) {
      await this.storageService.deleteFile('combos', combo.HinhAnh);
    }

    return await this.prisma.cOMBO.update({
      where: { MaCombo: id },
      data: {
        DeletedAt: new Date(),
        HinhAnh: null,
      },
    });
  }
}
