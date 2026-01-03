import { Test, TestingModule } from '@nestjs/testing';
import { TicketsCronService } from './tickets.cron.service';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatusEnum } from 'src/libs/common/enums/ticket-status.enum';

describe('TicketsCronService', () => {
  let service: TicketsCronService;

  const mockPrismaService = {
    vE: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsCronService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TicketsCronService>(TicketsCronService);
    jest.clearAllMocks();
  });

  it('nên được khởi tạo', () => {
    expect(service).toBeDefined();
  });

  describe('handleUpdateTicketStatus', () => {
    it('nên cập nhật các vé hết hạn', async () => {
      const expiredTickets = [
        { MaVe: '123e4567-e89b-42d3-a456-426614174000' },
        { MaVe: '123e4567-e89b-42d3-a456-426614174001' },
      ];
      mockPrismaService.vE.findMany.mockResolvedValue(expiredTickets);
      mockPrismaService.vE.updateMany.mockResolvedValue({
        count: 2,
      });

      await service.handleUpdateTicketStatus();

      expect(mockPrismaService.vE.findMany).toHaveBeenCalledWith({
        where: {
          TrangThaiVe: TicketStatusEnum.CHUASUDUNG,
          GheSuatChieu: {
            SuatChieu: {
              ThoiGianKetThuc: {
                lt: expect.any(Date),
              },
            },
          },
          DeletedAt: null,
        },
        select: { MaVe: true },
      });

      expect(mockPrismaService.vE.updateMany).toHaveBeenCalledWith({
        where: {
          MaVe: {
            in: [
              '123e4567-e89b-42d3-a456-426614174000',
              '123e4567-e89b-42d3-a456-426614174001',
            ],
          },
        },
        data: {
          TrangThaiVe: TicketStatusEnum.DAHETHAN,
        },
      });
    });

    it('không nên làm gì nếu không có vé hết hạn', async () => {
      mockPrismaService.vE.findMany.mockResolvedValue([]);

      await service.handleUpdateTicketStatus();

      expect(mockPrismaService.vE.findMany).toHaveBeenCalled();
      expect(mockPrismaService.vE.updateMany).not.toHaveBeenCalled();
    });
  });
});
