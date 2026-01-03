import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RoleEnum, TicketStatusEnum } from 'src/libs/common/enums';

describe('TicketsService', () => {
  let service: TicketsService;

  const mockPrismaService = {
    xprisma: {
      vE: {
        paginate: jest.fn().mockReturnThis(),
        withCursor: jest.fn(),
      },
    },
    vE: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockPdfService = {
    generateTicketsPdf: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PdfService, useValue: mockPdfService },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
  });

  it('nên được khởi tạo', () => {
    expect(service).toBeDefined();
  });

  describe('getTickets', () => {
    it('nên trả về danh sách vé và phân trang', async () => {
      const mockData = [{ MaVe: '123e4567-e89b-42d3-a456-426614174000' }];
      const mockPagination = { total: 1 };

      mockPrismaService.xprisma.vE.paginate.mockReturnValue({
        withCursor: jest.fn().mockResolvedValue([mockData, mockPagination]),
      });

      const result = await service.getTickets(
        '123e4567-e89b-42d3-a456-426614174000',
        RoleEnum.KHACHHANG,
      );
      expect(result).toEqual({ data: mockData, pagination: mockPagination });
      expect(mockPrismaService.xprisma.vE.paginate).toHaveBeenCalled();
    });
  });

  describe('getTicketByCode', () => {
    it('nên trả về vé theo mã', async () => {
      const mockTicket = {
        MaVe: '123e4567-e89b-42d3-a456-426614174000',
        Code: '123456789',
      };
      mockPrismaService.vE.findUnique.mockResolvedValue(mockTicket);

      const result = await service.getTicketByCode('123456789');
      expect(result).toEqual(mockTicket);
      expect(mockPrismaService.vE.findUnique).toHaveBeenCalledWith({
        where: { Code: '123456789', DeletedAt: null },
        include: expect.any(Object),
      });
    });
  });

  describe('checkinTicketByCode', () => {
    it('nên checkin vé thành công', async () => {
      const mockTicket = {
        MaVe: '123e4567-e89b-42d3-a456-426614174000',
        Code: '123456789',
        TrangThaiVe: TicketStatusEnum.CHUASUDUNG,
      };
      mockPrismaService.vE.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.vE.update.mockResolvedValue({
        ...mockTicket,
        TrangThaiVe: TicketStatusEnum.DASUDUNG,
      });

      const result = await service.checkinTicketByCode('123456789');
      expect(result).toEqual({ message: 'Checkin thành công' });
      expect(mockPrismaService.vE.update).toHaveBeenCalledWith({
        where: { MaVe: mockTicket.MaVe },
        data: { TrangThaiVe: TicketStatusEnum.DASUDUNG },
        include: expect.any(Object),
      });
    });

    it('nên ném lỗi NotFoundException nếu không tìm thấy vé', async () => {
      mockPrismaService.vE.findUnique.mockResolvedValue(null);

      await expect(service.checkinTicketByCode('123456789')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('nên ném lỗi BadRequestException nếu vé đã được sử dụng', async () => {
      const mockTicket = {
        MaVe: '123e4567-e89b-42d3-a456-426614174000',
        Code: '123456789',
        TrangThaiVe: TicketStatusEnum.DASUDUNG,
      };
      mockPrismaService.vE.findUnique.mockResolvedValue(mockTicket);

      await expect(service.checkinTicketByCode('123456789')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('nên ném lỗi BadRequestException nếu vé đã được hoàn', async () => {
      const mockTicket = {
        MaVe: '123e4567-e89b-42d3-a456-426614174000',
        Code: '123456789',
        TrangThaiVe: TicketStatusEnum.DAHOAN,
      };
      mockPrismaService.vE.findUnique.mockResolvedValue(mockTicket);

      await expect(service.checkinTicketByCode('123456789')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('nên ném lỗi BadRequestException nếu vé đã hết hạn', async () => {
      const mockTicket = {
        MaVe: '123e4567-e89b-42d3-a456-426614174000',
        Code: '123456789',
        TrangThaiVe: TicketStatusEnum.DAHETHAN,
      };
      mockPrismaService.vE.findUnique.mockResolvedValue(mockTicket);

      await expect(service.checkinTicketByCode('123456789')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getTicketById', () => {
    it('nên trả về vé theo id', async () => {
      const mockTicket = { MaVe: '123e4567-e89b-42d3-a456-426614174000' };
      mockPrismaService.vE.findUnique.mockResolvedValue(mockTicket);

      const result = await service.getTicketById(
        '123e4567-e89b-42d3-a456-426614174000',
        RoleEnum.KHACHHANG,
        '123e4567-e89b-42d3-a456-426614174000',
      );
      expect(result).toEqual(mockTicket);
      expect(mockPrismaService.vE.findUnique).toHaveBeenCalled();
    });
  });

  describe('updateTicketStatus', () => {
    it('nên cập nhật trạng thái vé', async () => {
      const mockTicket = {
        MaVe: '123e4567-e89b-42d3-a456-426614174000',
        TrangThaiVe: TicketStatusEnum.DASUDUNG,
      };
      mockPrismaService.vE.update.mockResolvedValue(mockTicket);

      const result = await service.updateTicketStatus(
        '123e4567-e89b-42d3-a456-426614174000',
        TicketStatusEnum.DASUDUNG,
      );
      expect(result).toEqual(mockTicket);
      expect(mockPrismaService.vE.update).toHaveBeenCalledWith({
        where: { MaVe: '123e4567-e89b-42d3-a456-426614174000' },
        data: { TrangThaiVe: TicketStatusEnum.DASUDUNG },
      });
    });
  });

  describe('generateTicketsPdf', () => {
    it('nên tạo pdf cho các vé hợp lệ', async () => {
      const mockTicket = {
        MaVe: '123e4567-e89b-42d3-a456-426614174000',
        Code: '123456789',
        TrangThaiVe: TicketStatusEnum.CHUASUDUNG,
      };
      const mockBuffer = Buffer.from('pdf content');

      jest
        .spyOn(service, 'getTicketByCode')
        .mockResolvedValue(mockTicket as any);
      mockPdfService.generateTicketsPdf.mockResolvedValue(mockBuffer);

      const result = await service.generateTicketsPdf(['123456789']);
      expect(result).toEqual(mockBuffer);
      expect(mockPdfService.generateTicketsPdf).toHaveBeenCalledWith([
        '123456789',
      ]);
    });

    it('nên ném lỗi NotFoundException nếu không tìm thấy vé hợp lệ', async () => {
      jest.spyOn(service, 'getTicketByCode').mockResolvedValue(null);

      await expect(service.generateTicketsPdf(['123456789'])).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
