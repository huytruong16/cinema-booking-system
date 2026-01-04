import { Test, TestingModule } from '@nestjs/testing';
import { TransactionCronService } from './transaction.cron.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

describe('TransactionCronService', () => {
  let service: TransactionCronService;

  const mockPrismaService = {
    gIAODICH: {
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    vE: {
      deleteMany: jest.fn(),
    },
    gHE_SUATCHIEU: {
      updateMany: jest.fn(),
    },
    kHUYENMAI_KHACHHANG: {
      updateMany: jest.fn(),
    },
    hOADON_KHUYENMAI: {
      deleteMany: jest.fn(),
    },
    hOADONCOMBO: {
      deleteMany: jest.fn(),
    },
    hOADON: {
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionCronService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TransactionCronService>(TransactionCronService);
  });

  it('nên được định nghĩa', () => {
    expect(service).toBeDefined();
  });

  describe('handleCron', () => {
    it('xử lý các giao dịch đã hết hạn', async () => {
      const mockExpiredTransactions = [
        {
          MaGiaoDich: '550e8400-e29b-41d4-a716-446655440000',
          HoaDon: {
            MaHoaDon: '550e8400-e29b-41d4-a716-446655440001',
            Ves: [
              {
                MaVe: '550e8400-e29b-41d4-a716-446655440002',
                GheSuatChieu: {
                  MaGheSuatChieu: '550e8400-e29b-41d4-a716-446655440003',
                },
              },
            ],
            HoaDonKhuyenMais: [
              { MaKhuyenMaiKH: '550e8400-e29b-41d4-a716-446655440004' },
            ],
          },
        },
      ];

      mockPrismaService.gIAODICH.findMany.mockResolvedValue(
        mockExpiredTransactions,
      );

      await service.handleCron();

      expect(mockPrismaService.gIAODICH.findMany).toHaveBeenCalled();
      expect(mockPrismaService.gIAODICH.delete).toHaveBeenCalledWith({
        where: { MaGiaoDich: '550e8400-e29b-41d4-a716-446655440000' },
      });
      expect(mockPrismaService.vE.deleteMany).toHaveBeenCalled();
      expect(mockPrismaService.gHE_SUATCHIEU.updateMany).toHaveBeenCalled();
      expect(
        mockPrismaService.kHUYENMAI_KHACHHANG.updateMany,
      ).toHaveBeenCalled();
      expect(mockPrismaService.hOADON_KHUYENMAI.deleteMany).toHaveBeenCalled();
      expect(mockPrismaService.hOADONCOMBO.deleteMany).toHaveBeenCalled();
      expect(mockPrismaService.hOADON.delete).toHaveBeenCalled();
    });

    it('xử lý lỗi một cách an toàn', async () => {
      const mockExpiredTransactions = [
        {
          MaGiaoDich: '550e8400-e29b-41d4-a716-446655440000',
          HoaDon: { MaHoaDon: '550e8400-e29b-41d4-a716-446655440001' },
        },
      ];

      mockPrismaService.gIAODICH.findMany.mockResolvedValue(
        mockExpiredTransactions,
      );
      mockPrismaService.gIAODICH.delete.mockRejectedValue(
        new Error('Delete failed'),
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await service.handleCron();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('bỏ qua giao dịch có UUID không hợp lệ', async () => {
      const mockExpiredTransactions = [
        {
          MaGiaoDich: 'invalid-uuid',
          HoaDon: { MaHoaDon: 'invoice-1' },
        },
      ];

      mockPrismaService.gIAODICH.findMany.mockResolvedValue(
        mockExpiredTransactions,
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await service.handleCron();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error processing transaction invalid-uuid'),
        expect.any(Error),
      );
      expect(mockPrismaService.gIAODICH.delete).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
