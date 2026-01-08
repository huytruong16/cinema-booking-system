import { Test, TestingModule } from '@nestjs/testing';
import { FilmService } from './film.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('FilmService', () => {
  let service: FilmService;

  const mockPrismaService = {
    pHIM: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    pHIM_THELOAI: {
      createMany: jest.fn(),
      updateMany: jest.fn(),
    },
    tHELOAI: {
      findMany: jest.fn(),
    },
    nHANPHIM: {
      findFirst: jest.fn(),
    },
    pHIENBANPHIM: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    dINHDANG: {
      findFirst: jest.fn(),
    },
    nGONNGU: {
      findFirst: jest.fn(),
    },
    xprisma: {
      pHIM: {
        paginate: jest.fn().mockReturnThis(),
        withCursor: jest.fn(),
      },
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  const mockStorageService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<FilmService>(FilmService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllFilms', () => {
    it('trả về danh sách phim', async () => {
      const mockData = [{ MaPhim: '1' }];
      const mockPagination = { total: 1 };

      mockPrismaService.xprisma.pHIM.withCursor.mockResolvedValue([
        mockData,
        mockPagination,
      ]);

      const result = await service.getAllFilms({});

      expect(result.data).toEqual(mockData);
      expect(result.pagination).toEqual(mockPagination);
      expect(mockPrismaService.xprisma.pHIM.paginate).toHaveBeenCalled();
    });
  });

  describe('createFilm', () => {
    it('ném lỗi nếu MaNhanPhim không tồn tại', async () => {
      mockPrismaService.pHIM.findFirst.mockResolvedValue(null);
      mockPrismaService.nHANPHIM.findFirst.mockResolvedValue(null);

      await expect(
        service.createFilm({
          TenGoc: 'Film A',
          TenHienThi: 'Film A',
          MaNhanPhim: 'invalid',
          ThoiLuong: 120,
          NgayBatDauChieu: new Date(),
          NgayKetThucChieu: new Date(),
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('tạo phim thành công', async () => {
      mockPrismaService.pHIM.findFirst.mockResolvedValue(null);
      mockPrismaService.nHANPHIM.findFirst.mockResolvedValue({
        MaNhanPhim: '1',
      });
      mockPrismaService.pHIM.create.mockResolvedValue({ MaPhim: '1' });

      const result = await service.createFilm({
        TenGoc: 'Film A',
        TenHienThi: 'Film A',
        MaNhanPhim: '1',
        ThoiLuong: 120,
        NgayBatDauChieu: new Date(),
        NgayKetThucChieu: new Date(),
      } as any);

      expect(result.message).toBe('Tạo phim thành công');
      expect(mockPrismaService.pHIM.create).toHaveBeenCalled();
    });
  });

  describe('updateFilm', () => {
    it('ném lỗi nếu phim không tồn tại', async () => {
      mockPrismaService.pHIM.findUnique.mockResolvedValue(null);

      await expect(service.updateFilm('invalid-id', {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('cập nhật phim thành công', async () => {
      mockPrismaService.pHIM.findUnique.mockResolvedValue({
        MaPhim: '1',
        TenGoc: 'Old',
        TenHienThi: 'Old',
      });
      mockPrismaService.pHIM.update.mockResolvedValue({ MaPhim: '1' });

      const result = await service.updateFilm('1', {
        TenGoc: 'New',
      } as any);

      expect(result.message).toBe('Cập nhật phim thành công');
      expect(mockPrismaService.pHIM.update).toHaveBeenCalled();
    });
  });

  describe('removeFilm', () => {
    it('xóa phim thành công', async () => {
      mockPrismaService.pHIM.findUnique.mockResolvedValue({
        MaPhim: '1',
        PosterUrl: null,
        BackdropUrl: null,
      });
      mockPrismaService.pHIM.update.mockResolvedValue({});

      const result = await service.removeFilm('1');

      expect(result.message).toBe('Xóa phim thành công');
      expect(mockPrismaService.pHIM.update).toHaveBeenCalled();
    });
  });

  describe('createFilmVersion', () => {
    it('ném lỗi nếu phim không tồn tại', async () => {
      mockPrismaService.pHIM.findFirst.mockResolvedValue(null);

      await expect(
        service.createFilmVersion({
          MaPhim: '1',
          MaDinhDang: '2',
          MaNgonNgu: '3',
          GiaVe: 50000,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
