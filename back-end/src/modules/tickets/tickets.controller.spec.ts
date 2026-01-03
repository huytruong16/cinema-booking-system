import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RoleEnum } from 'src/libs/common/enums';
import { Response } from 'express';

describe('TicketsController', () => {
  let controller: TicketsController;

  const mockTicketsService = {
    checkinTicketByCode: jest.fn(),
    getTickets: jest.fn(),
    getTicketById: jest.fn(),
    generateTicketsPdf: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [{ provide: TicketsService, useValue: mockTicketsService }],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
  });

  it('nên được khởi tạo', () => {
    expect(controller).toBeDefined();
  });

  describe('checkin', () => {
    it('nên checkin vé thành công', async () => {
      const result = { message: 'Checkin thành công' };
      mockTicketsService.checkinTicketByCode.mockResolvedValue(result);

      expect(await controller.checkin('123456789')).toBe(result);
      expect(mockTicketsService.checkinTicketByCode).toHaveBeenCalledWith(
        '123456789',
      );
    });

    it('nên ném lỗi BadRequestException nếu mã vé không phải 9 ký tự số', async () => {
      await expect(controller.checkin('ABC123456')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('nên trả về danh sách vé', async () => {
      const result = { data: [], pagination: {} };
      mockTicketsService.getTickets.mockResolvedValue(result);

      const req = {
        user: {
          id: '123e4567-e89b-42d3-a456-426614174000',
          vaitro: RoleEnum.KHACHHANG,
        },
      };
      expect(await controller.findAll(req, {})).toBe(result);
      expect(mockTicketsService.getTickets).toHaveBeenCalledWith(
        '123e4567-e89b-42d3-a456-426614174000',
        RoleEnum.KHACHHANG,
        {},
      );
    });

    it('nên ném lỗi BadRequestException nếu userId không phải UUID hợp lệ', async () => {
      const req = { user: { id: 'invalid-uuid', vaitro: RoleEnum.KHACHHANG } };
      await expect(controller.findAll(req, {})).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('nên trả về chi tiết vé theo id', async () => {
      const mockTicket = { MaVe: '123e4567-e89b-42d3-a456-426614174000' };
      mockTicketsService.getTicketById.mockResolvedValue(mockTicket);

      const req = {
        user: {
          id: '123e4567-e89b-42d3-a456-426614174000',
          vaitro: RoleEnum.KHACHHANG,
        },
      };
      const validUUID = '123e4567-e89b-42d3-a456-426614174000';

      expect(await controller.findOne(req, validUUID)).toBe(mockTicket);
      expect(mockTicketsService.getTicketById).toHaveBeenCalledWith(
        '123e4567-e89b-42d3-a456-426614174000',
        RoleEnum.KHACHHANG,
        validUUID,
      );
    });

    it('nên ném lỗi BadRequestException nếu id không phải UUID hợp lệ', async () => {
      const req = {
        user: {
          id: '123e4567-e89b-42d3-a456-426614174000',
          vaitro: RoleEnum.KHACHHANG,
        },
      };
      await expect(controller.findOne(req, 'invalid-uuid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('nên ném lỗi BadRequestException nếu userId không phải UUID hợp lệ', async () => {
      const req = { user: { id: 'invalid-uuid', vaitro: RoleEnum.KHACHHANG } };
      const validUUID = '123e4567-e89b-42d3-a456-426614174000';
      await expect(controller.findOne(req, validUUID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('nên ném lỗi NotFoundException nếu không tìm thấy vé', async () => {
      mockTicketsService.getTicketById.mockResolvedValue(null);
      const validUUID = '123e4567-e89b-42d3-a456-426614174000';
      const req = {
        user: {
          id: '123e4567-e89b-42d3-a456-426614174000',
          vaitro: RoleEnum.KHACHHANG,
        },
      };
      await expect(controller.findOne(req, validUUID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('downloadTicketPdf', () => {
    it('nên tạo và tải xuống file pdf', async () => {
      const mockBuffer = Buffer.from('pdf content');
      mockTicketsService.generateTicketsPdf.mockResolvedValue(mockBuffer);

      const res = {
        set: jest.fn(),
        end: jest.fn(),
      };

      await controller.downloadTicketPdf(
        '123456789',
        res as unknown as Response,
      );

      expect(mockTicketsService.generateTicketsPdf).toHaveBeenCalledWith([
        '123456789',
      ]);
      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=ticket-123456789.pdf',
        'Content-Length': mockBuffer.length,
      });
      expect(res.end).toHaveBeenCalledWith(mockBuffer);
    });

    it('nên ném lỗi BadRequestException nếu mã vé không phải 9 ký tự số', async () => {
      const res = {
        set: jest.fn(),
        end: jest.fn(),
      } as unknown as Response;
      await expect(
        controller.downloadTicketPdf('ABC123456', res),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
