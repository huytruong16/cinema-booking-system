import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFilmDto } from './dtos/create-film.dto';
import { FilterFilmDto } from './dtos/filter-film.dto';
import { StorageService } from '../storage/storage.service';
import { UpdateFilmDto } from './dtos/update-film.dto';
import { CreateFilmVersionDto } from './dtos/create-film-version.dto';
import { UpdateFilmVersionDto } from './dtos/update-film-version.dto';
import { CursorUtils } from 'src/libs/common/utils/pagination.util';
import { GetFilmReviewDto } from './dtos/get-film-review.dto';

@Injectable()
export class FilmService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}
  async getAllFilms(filters?: FilterFilmDto) {
    const whereConditions: any = { DeletedAt: null };

    if (filters?.MaNhanPhim) {
      whereConditions.MaNhanPhim = filters.MaNhanPhim;
    }

    if (filters?.MaTheLoai) {
      whereConditions.PhimTheLoais = {
        some: {
          MaTheLoai: filters.MaTheLoai,
          DeletedAt: null,
        },
      };
    }

    if (filters?.MaDinhDang) {
      whereConditions.PhienBanPhims = {
        some: {
          MaDinhDang: filters.MaDinhDang,
          DeletedAt: null,
        },
      };
    }

    if (filters?.MaNgonNgu) {
      whereConditions.PhienBanPhims = {
        some: {
          MaNgonNgu: filters.MaNgonNgu,
          DeletedAt: null,
        },
      };
    }

    const [data, pagination] = await this.prisma.xprisma.pHIM
      .paginate({
        orderBy: [{ CreatedAt: 'desc' }, { MaPhim: 'desc' }],
        where: whereConditions,
        include: {
          DanhGias: true,
          PhienBanPhims: {
            select: {
              MaPhienBanPhim: true,
              DinhDang: true,
              GiaVe: true,
              NgonNgu: true,
            },
          },
          PhimTheLoais: {
            where: { TheLoai: { DeletedAt: null } },
            select: { TheLoai: true },
          },
          NhanPhim: true,
        },
      })
      .withCursor(CursorUtils.getPrismaOptions(filters ?? {}, 'MaPhim'));

    return { data, pagination };
  }
  async createFilm(
    payload: CreateFilmDto,
    posterFile?: Express.Multer.File,
    backdropFile?: Express.Multer.File,
  ) {
    const prisma = this.prisma;

    await checkOriginalFilmNameExist(payload);
    await checkDisplayFilmNameExist(payload);

    const nhanPhim = await prisma.nHANPHIM.findFirst({
      where: { MaNhanPhim: payload.MaNhanPhim, DeletedAt: null },
    });
    if (!nhanPhim) {
      throw new BadRequestException('MaNhanPhim không tồn tại');
    }

    if (payload.TheLoais && payload.TheLoais.length) {
      const tlIds = payload.TheLoais;
      const foundTheLoais = await this.prisma.tHELOAI.findMany({
        where: { MaTheLoai: { in: tlIds }, DeletedAt: null },
        select: { MaTheLoai: true },
      });
      const foundTlIds = new Set(foundTheLoais.map((t) => t.MaTheLoai));
      const missingTl = tlIds.filter((id) => !foundTlIds.has(id));
      if (missingTl.length) {
        throw new BadRequestException(
          `Một hoặc nhiều MaTheLoai không tồn tại: ${missingTl.join(', ')}`,
        );
      }
    }

    const uploads: { posterUrl?: string; backdropUrl?: string } = {};
    if (posterFile) {
      const uploaded = await this.storageService.uploadFile(posterFile, {
        bucket: 'films',
        folder: 'posters',
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });
      uploads.posterUrl = uploaded.url;
    }
    if (backdropFile) {
      const uploaded = await this.storageService.uploadFile(backdropFile, {
        bucket: 'films',
        folder: 'backdrops',
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });
      uploads.backdropUrl = uploaded.url;
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const film = await addNewFilm(tx);
      await createFilmGenreMappings(film, tx);
      return film;
    });

    return { message: 'Tạo phim thành công', film: created };

    async function addNewFilm(tx: any) {
      return await tx.pHIM.create({
        data: {
          TenGoc: payload.TenGoc,
          MaNhanPhim: payload.MaNhanPhim,
          TenHienThi: payload.TenHienThi,
          TomTatNoiDung: payload.TomTatNoiDung ?? null,
          DaoDien: payload.DaoDien ?? null,
          DanhSachDienVien: payload.DanhSachDienVien ?? null,
          PosterUrl: uploads.posterUrl ?? payload.PosterUrl ?? null,
          BackdropUrl: uploads.backdropUrl ?? payload.BackdropUrl ?? null,
          QuocGia: payload.QuocGia ?? null,
          TrailerUrl: payload.TrailerUrl ?? null,
          ThoiLuong: payload.ThoiLuong,
          NgayBatDauChieu: new Date(payload.NgayBatDauChieu),
          NgayKetThucChieu: new Date(payload.NgayKetThucChieu),
          CreatedAt: new Date(),
        },
      });
    }

    async function createFilmGenreMappings(film: any, tx: any) {
      if (payload.TheLoais && payload.TheLoais.length) {
        const tlData = payload.TheLoais.map((ma) => ({
          MaPhim: film.MaPhim,
          MaTheLoai: ma,
          CreatedAt: new Date(),
        }));
        await tx.pHIM_THELOAI.createMany({ data: tlData });
      }
    }

    async function checkOriginalFilmNameExist(payload: CreateFilmDto) {
      const isOriginalFilmNameExist = await prisma.pHIM.findFirst({
        where: { TenGoc: payload.TenGoc },
      });
      if (isOriginalFilmNameExist)
        throw new BadRequestException('Tên gốc phim đã tồn tại');
    }

    async function checkDisplayFilmNameExist(payload: CreateFilmDto) {
      const isDisplayFilmNameExist = await prisma.pHIM.findFirst({
        where: { TenHienThi: payload.TenHienThi },
      });
      if (isDisplayFilmNameExist)
        throw new BadRequestException('Tên hiển thị phim đã tồn tại');
    }
  }

  async updateFilm(
    id: string,
    updateDto: UpdateFilmDto,
    posterFile?: Express.Multer.File,
    backdropFile?: Express.Multer.File,
  ) {
    const prisma = this.prisma;

    const film = await prisma.pHIM.findUnique({
      where: { MaPhim: id, DeletedAt: null },
    });
    if (!film) throw new NotFoundException(`Phim với ID ${id} không tồn tại`);

    if (updateDto.TenGoc && updateDto.TenGoc !== film.TenGoc) {
      const exists = await prisma.pHIM.findFirst({
        where: { TenGoc: updateDto.TenGoc, MaPhim: { not: id } },
      });
      if (exists) throw new ConflictException('Tên gốc phim đã tồn tại');
    }

    if (updateDto.TenHienThi && updateDto.TenHienThi !== film.TenHienThi) {
      const exists = await prisma.pHIM.findFirst({
        where: { TenHienThi: updateDto.TenHienThi, MaPhim: { not: id } },
      });
      if (exists) throw new ConflictException('Tên hiển thị phim đã tồn tại');
    }

    if (updateDto.MaNhanPhim && updateDto.MaNhanPhim !== film.MaNhanPhim) {
      const nhanPhim = await prisma.nHANPHIM.findFirst({
        where: { MaNhanPhim: updateDto.MaNhanPhim, DeletedAt: null },
      });
      if (!nhanPhim) {
        throw new BadRequestException('MaNhanPhim không tồn tại');
      }
    }

    if (Array.isArray(updateDto.TheLoais)) {
      const tlIds = updateDto.TheLoais;
      if (tlIds.length) {
        const found = await prisma.tHELOAI.findMany({
          where: { MaTheLoai: { in: tlIds }, DeletedAt: null },
          select: { MaTheLoai: true },
        });

        const foundIds = new Set(found.map((t) => t.MaTheLoai));
        const missing = tlIds.filter((id) => !foundIds.has(id));

        if (missing.length) {
          throw new BadRequestException(
            `Một hoặc nhiều MaTheLoai không tồn tại: ${missing.join(', ')}`,
          );
        }
      }
    }

    const updateData: any = { UpdatedAt: new Date() };

    const fields = [
      'TenGoc',
      'TenHienThi',
      'TomTatNoiDung',
      'DaoDien',
      'DanhSachDienVien',
      'QuocGia',
      'TrailerUrl',
      'ThoiLuong',
      'MaNhanPhim',
    ];

    fields.forEach((field) => {
      if (updateDto[field] !== undefined) {
        updateData[field] = updateDto[field];
      }
    });

    if (updateDto.NgayBatDauChieu !== undefined) {
      updateData.NgayBatDauChieu = new Date(updateDto.NgayBatDauChieu);
    }
    if (updateDto.NgayKetThucChieu !== undefined) {
      updateData.NgayKetThucChieu = new Date(updateDto.NgayKetThucChieu);
    }

    if (posterFile) {
      if (film.PosterUrl) {
        await this.storageService.deleteFile('films', film.PosterUrl);
      }
      const uploaded = await this.storageService.uploadFile(posterFile, {
        bucket: 'films',
        folder: 'posters',
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });
      updateData.PosterUrl = uploaded.url;
    }

    if (backdropFile) {
      if (film.BackdropUrl) {
        await this.storageService.deleteFile('films', film.BackdropUrl);
      }
      const uploaded = await this.storageService.uploadFile(backdropFile, {
        bucket: 'films',
        folder: 'backdrops',
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });
      updateData.BackdropUrl = uploaded.url;
    }

    return await prisma.$transaction(async (tx) => {
      const updatedFilm = await tx.pHIM.update({
        where: { MaPhim: id },
        data: updateData,
      });

      if (Array.isArray(updateDto.TheLoais)) {
        await tx.pHIM_THELOAI.updateMany({
          where: { MaPhim: id, DeletedAt: null },
          data: { DeletedAt: new Date() },
        });

        if (updateDto.TheLoais.length) {
          const data = updateDto.TheLoais.map((ma: string) => ({
            MaPhim: id,
            MaTheLoai: ma,
            CreatedAt: new Date(),
          }));
          await tx.pHIM_THELOAI.createMany({ data });
        }
      }

      return { message: 'Cập nhật phim thành công', film: updatedFilm };
    });
  }

  async removeFilm(id: string) {
    const film = await this.prisma.pHIM.findUnique({
      where: { MaPhim: id, DeletedAt: null },
    });
    if (!film) throw new NotFoundException(`Phim với ID ${id} không tồn tại`);

    if (film.PosterUrl) {
      await this.storageService.deleteFile('films', film.PosterUrl);
    }
    if (film.BackdropUrl) {
      await this.storageService.deleteFile('films', film.BackdropUrl);
    }

    await this.prisma.pHIM.update({
      where: { MaPhim: id },
      data: {
        DeletedAt: new Date(),
        PosterUrl: null,
        BackdropUrl: null,
      },
    });
    return { message: 'Xóa phim thành công' };
  }

  async getAllFilmFormats(filters?: FilterFilmDto) {
    const whereConditions: any = { DeletedAt: null };

    if (filters?.MaDinhDang) {
      whereConditions.MaDinhDang = filters.MaDinhDang;
    }
    if (filters?.MaNgonNgu) {
      whereConditions.MaNgonNgu = filters.MaNgonNgu;
    }

    if (filters?.MaTheLoai) {
      whereConditions.Phim = {
        PhimTheLoais: {
          some: {
            MaTheLoai: filters.MaTheLoai,
            DeletedAt: null,
          },
        },
        DeletedAt: null,
      };
    }

    if (filters?.MaNhanPhim) {
      whereConditions.Phim = {
        ...whereConditions.Phim,
        MaNhanPhim: filters.MaNhanPhim,
        DeletedAt: null,
      };
    }

    const [data, pagination] = await this.prisma.xprisma.pHIENBANPHIM
      .paginate({
        orderBy: [{ CreatedAt: 'desc' }, { MaPhienBanPhim: 'desc' }],
        where: whereConditions,
        select: {
          MaPhienBanPhim: true,
          Phim: {
            include: {
              NhanPhim: true,
              PhimTheLoais: {
                where: {
                  TheLoai: { DeletedAt: null },
                },
                select: {
                  TheLoai: {
                    select: { TenTheLoai: true },
                  },
                },
              },
            },
          },
          DinhDang: true,
          NgonNgu: true,
          GiaVe: true,
        },
      })
      .withCursor(
        CursorUtils.getPrismaOptions(filters ?? {}, 'MaPhienBanPhim'),
      );

    return { data, pagination };
  }

  async getFilmById(id: string) {
    return await this.prisma.pHIM.findUnique({
      where: { MaPhim: id, DeletedAt: null },
      include: {
        DanhGias: true,
        PhienBanPhims: {
          select: {
            MaPhienBanPhim: true,
            DinhDang: true,
            GiaVe: true,
            NgonNgu: true,
          },
        },
        PhimTheLoais: {
          where: { TheLoai: { DeletedAt: null } },
          select: { TheLoai: true },
        },
      },
    });
  }
  async createFilmVersion(payload: CreateFilmVersionDto) {
    const { MaPhim, MaDinhDang, MaNgonNgu, GiaVe } = payload;

    const film = await this.prisma.pHIM.findFirst({
      where: { MaPhim, DeletedAt: null },
    });
    if (!film)
      throw new NotFoundException(`Phim với ID ${MaPhim} không tồn tại`);

    const format = await this.prisma.dINHDANG.findFirst({
      where: { MaDinhDang, DeletedAt: null },
    });
    if (!format)
      throw new NotFoundException(
        `Định dạng với ID ${MaDinhDang} không tồn tại`,
      );

    const language = await this.prisma.nGONNGU.findFirst({
      where: { MaNgonNgu, DeletedAt: null },
    });
    if (!language)
      throw new NotFoundException(`Ngôn ngữ với ID ${MaNgonNgu} không tồn tại`);

    const exists = await this.prisma.pHIENBANPHIM.findFirst({
      where: {
        MaPhim,
        MaDinhDang,
        MaNgonNgu,
        DeletedAt: null,
      },
    });
    if (exists) throw new BadRequestException('Phiên bản phim này đã tồn tại');

    const filmVersion = await this.prisma.pHIENBANPHIM.create({
      data: {
        MaPhim,
        MaDinhDang,
        MaNgonNgu,
        GiaVe,
        CreatedAt: new Date(),
      },
    });

    return { message: 'Tạo phiên bản phim thành công', filmVersion };
  }

  async updateFilmVersion(id: string, updateDto: UpdateFilmVersionDto) {
    const version = await this.prisma.pHIENBANPHIM.findFirst({
      where: { MaPhienBanPhim: id, DeletedAt: null },
    });
    if (!version)
      throw new NotFoundException(`Phiên bản phim với ID ${id} không tồn tại`);

    const updateData: any = { UpdatedAt: new Date() };

    if (updateDto.MaDinhDang) {
      const format = await this.prisma.dINHDANG.findFirst({
        where: { MaDinhDang: updateDto.MaDinhDang, DeletedAt: null },
      });
      if (!format) throw new BadRequestException('Định dạng không tồn tại');
      updateData.MaDinhDang = updateDto.MaDinhDang;
    }

    if (updateDto.MaNgonNgu) {
      const language = await this.prisma.nGONNGU.findFirst({
        where: { MaNgonNgu: updateDto.MaNgonNgu, DeletedAt: null },
      });
      if (!language) throw new BadRequestException('Ngôn ngữ không tồn tại');
      updateData.MaNgonNgu = updateDto.MaNgonNgu;
    }

    if (updateDto.GiaVe !== undefined) {
      updateData.GiaVe = updateDto.GiaVe;
    }

    const updated = await this.prisma.pHIENBANPHIM.update({
      where: { MaPhienBanPhim: id },
      data: updateData,
      include: { Phim: true, DinhDang: true, NgonNgu: true },
    });

    return {
      message: 'Cập nhật phiên bản phim thành công',
      filmVersion: updated,
    };
  }

  async removeFilmVersion(id: string) {
    const version = await this.prisma.pHIENBANPHIM.findFirst({
      where: { MaPhienBanPhim: id, DeletedAt: null },
    });
    if (!version)
      throw new NotFoundException(`Phiên bản phim với ID ${id} không tồn tại`);

    await this.prisma.pHIENBANPHIM.update({
      where: { MaPhienBanPhim: id },
      data: { DeletedAt: new Date() },
    });

    return { message: 'Xóa phiên bản phim thành công' };
  }

  async getFilmReviews(filmId: string, query: GetFilmReviewDto) {
    const film = await this.prisma.pHIM.findUnique({
      where: { MaPhim: filmId, DeletedAt: null },
    });

    if (!film) throw new NotFoundException(`Phim không tồn tại`);

    const reviews = await this.prisma.xprisma.dANHGIA
      .paginate({
        where: { MaPhim: filmId, DeletedAt: null },
        orderBy: { CreatedAt: 'desc' },
        include: {
          NguoiDungPhanMem: {
            include: {
              KhachHangs: true,
            },
          },
        },
      })
      .withCursor(CursorUtils.getPrismaOptions(query ?? {}, 'MaDanhGia'));
    return reviews;
  }
}
