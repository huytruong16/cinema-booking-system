import { Test, TestingModule } from '@nestjs/testing';
import { FilmCronService } from './film.cron.service';
import { PrismaService } from '../prisma/prisma.service';
import { FilmStatusEnum } from 'src/libs/common/enums';

describe('FilmCronService', () => {
  let service: FilmCronService;

  const mockPrismaService = {
    pHIM: {
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmCronService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FilmCronService>(FilmCronService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleCron', () => {
    it('should update film status to DANGCHIEU for films currently showing', async () => {
      mockPrismaService.pHIM.updateMany
        .mockResolvedValueOnce({ count: 2 })
        .mockResolvedValueOnce({ count: 1 })
        .mockResolvedValueOnce({ count: 3 });

      await service.handleCron();

      expect(mockPrismaService.pHIM.updateMany).toHaveBeenNthCalledWith(1, {
        where: {
          DeletedAt: null,
          NgayBatDauChieu: { lte: expect.any(Date) },
          NgayKetThucChieu: { gte: expect.any(Date) },
          TrangThaiPhim: { not: FilmStatusEnum.DANGCHIEU },
        },
        data: {
          TrangThaiPhim: FilmStatusEnum.DANGCHIEU,
        },
      });
    });

    it('should update film status to SAPCHIEU for upcoming films', async () => {
      mockPrismaService.pHIM.updateMany
        .mockResolvedValueOnce({ count: 2 })
        .mockResolvedValueOnce({ count: 1 })
        .mockResolvedValueOnce({ count: 3 });

      await service.handleCron();

      expect(mockPrismaService.pHIM.updateMany).toHaveBeenNthCalledWith(2, {
        where: {
          DeletedAt: null,
          NgayBatDauChieu: { gt: expect.any(Date) },
          TrangThaiPhim: { not: FilmStatusEnum.SAPCHIEU },
        },
        data: {
          TrangThaiPhim: FilmStatusEnum.SAPCHIEU,
        },
      });
    });

    it('should update film status to NGUNGCHIEU for films that have ended', async () => {
      mockPrismaService.pHIM.updateMany
        .mockResolvedValueOnce({ count: 2 })
        .mockResolvedValueOnce({ count: 1 })
        .mockResolvedValueOnce({ count: 3 });

      await service.handleCron();

      expect(mockPrismaService.pHIM.updateMany).toHaveBeenNthCalledWith(3, {
        where: {
          DeletedAt: null,
          NgayKetThucChieu: { lt: expect.any(Date) },
          TrangThaiPhim: { not: FilmStatusEnum.NGUNGCHIEU },
        },
        data: {
          TrangThaiPhim: FilmStatusEnum.NGUNGCHIEU,
        },
      });
    });

    it('should call updateMany three times', async () => {
      mockPrismaService.pHIM.updateMany
        .mockResolvedValueOnce({ count: 2 })
        .mockResolvedValueOnce({ count: 1 })
        .mockResolvedValueOnce({ count: 3 });

      await service.handleCron();

      expect(mockPrismaService.pHIM.updateMany).toHaveBeenCalledTimes(3);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mockPrismaService.pHIM.updateMany.mockRejectedValueOnce(error);

      await expect(service.handleCron()).rejects.toThrow(error);
    });
  });
});
