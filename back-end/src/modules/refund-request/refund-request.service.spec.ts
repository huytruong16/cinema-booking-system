import { Test, TestingModule } from '@nestjs/testing';
import { RefundRequestService } from './refund-request.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { REQUEST } from '@nestjs/core';
import { RoleEnum, TicketStatusEnum } from 'src/libs/common/enums';
import { NotFoundException } from '@nestjs/common';

describe('RefundRequestService', () => {
  let service: RefundRequestService;

  const mockYEUCAUHOANVE = {
    paginate: jest.fn(),
    withCursor: jest.fn(),
  };
  mockYEUCAUHOANVE.paginate.mockReturnValue(mockYEUCAUHOANVE);

  const mockPrismaService = {
    xprisma: {
      yEUCAUHOANVE: mockYEUCAUHOANVE,
    },
    hOADON: {
      findUnique: jest.fn(),
    },
    nGANHANG: {
      findUnique: jest.fn(),
    },
    tHAMSO: {
      findUnique: jest.fn(),
    },
    yEUCAUHOANVE: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    vE: {
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  const mockMailService = {
    sendRefundDecisionEmail: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: '123e4567-e89b-42d3-a456-426614174000',
      vaitro: RoleEnum.KHACHHANG,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefundRequestService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MailService, useValue: mockMailService },
        { provide: REQUEST, useValue: mockRequest },
      ],
    }).compile();

    service = await module.resolve<RefundRequestService>(RefundRequestService);
  });

  it('nên được định nghĩa', () => {
    expect(service).toBeDefined();
  });

  describe('getAllRefundRequests', () => {
    it('nên trả về danh sách yêu cầu hoàn vé', async () => {
      const result = { data: [], pagination: {} };
      mockPrismaService.xprisma.yEUCAUHOANVE.withCursor.mockResolvedValue([
        [],
        {},
      ]);

      expect(await service.getAllRefundRequests({})).toEqual(result);
    });
  });

  describe('createNewRefundRequest', () => {
    it('nên tạo yêu cầu hoàn vé thành công', async () => {
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const role = RoleEnum.KHACHHANG;
      const dto = {
        MaHoaDon: '123e4567-e89b-42d3-a456-426614174000',
        LyDo: 'Lý do',
        MaNganHang: 'VCB',
        SoTaiKhoan: '123',
        ChuTaiKhoan: 'ABC',
      };

      const mockInvoice = {
        MaHoaDon: dto.MaHoaDon,
        TongTien: 100000,
        Ves: [
          {
            TrangThaiVe: TicketStatusEnum.CHUASUDUNG,
            GheSuatChieu: {
              SuatChieu: {
                ThoiGianBatDau: new Date(Date.now() + 10000000),
              },
            },
          },
        ],
      };

      mockPrismaService.hOADON.findUnique.mockResolvedValue(mockInvoice);
      mockPrismaService.nGANHANG.findUnique.mockResolvedValue({
        MaNganHang: 'VCB',
      });
      mockPrismaService.tHAMSO.findUnique.mockResolvedValue({
        GiaTri: '24',
        KieuDuLieu: 'int',
      });
      mockPrismaService.yEUCAUHOANVE.create.mockResolvedValue({
        MaYeuCau: '123e4567-e89b-42d3-a456-426614174000',
      });

      jest
        .spyOn(service, 'getRefundRequestById')
        .mockResolvedValue({ id: '123e4567-e89b-42d3-a456-426614174000' });

      const result = await service.createNewRefundRequest(
        userId,
        role,
        dto as any,
      );
      expect(result).toEqual({ id: '123e4567-e89b-42d3-a456-426614174000' });
    });

    it('nên ném lỗi NotFoundException nếu hóa đơn không tồn tại', async () => {
      mockPrismaService.hOADON.findUnique.mockResolvedValue(null);
      const dto = { MaHoaDon: 'invalid-id' } as any;
      await expect(
        service.createNewRefundRequest(
          '123e4567-e89b-42d3-a456-426614174000',
          RoleEnum.KHACHHANG,
          dto,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
