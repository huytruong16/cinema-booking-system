import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PayosService } from 'src/libs/common/services/payos.service';
import { MailService } from 'src/modules/mail/mail.service';
import { RefundRequestService } from '../refund-request/refund-request.service';
import { REQUEST } from '@nestjs/core';
import {
  RoleEnum,
  TransactionEnum,
  TransactionStatusEnum,
  TransactionTypeEnum,
} from 'src/libs/common/enums';
import { BadRequestException } from '@nestjs/common';

describe('TransactionService', () => {
  let service: TransactionService;

  const mockPrismaService = {
    gIAODICH: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    hOADON: {
      findUnique: jest.fn(),
    },
    yEUCAUHOANVE: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    nHANVIEN: {
      findFirst: jest.fn(),
    },
    xprisma: {
      gIAODICH: {
        paginate: jest.fn().mockReturnThis(),
        withCursor: jest.fn(),
      },
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  const mockPayosService = {
    verifyPaymentWebhookData: jest.fn(),
  };

  const mockMailService = {
    sendInvoiceEmail: jest.fn(),
    sendRefundDecisionEmail: jest.fn(),
  };

  const mockRefundRequestService = {
    updateRefundRequestStatus: jest.fn(),
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
        TransactionService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PayosService, useValue: mockPayosService },
        { provide: MailService, useValue: mockMailService },
        { provide: RefundRequestService, useValue: mockRefundRequestService },
        { provide: REQUEST, useValue: mockRequest },
      ],
    }).compile();

    service = await module.resolve<TransactionService>(TransactionService);
  });

  it('nên được định nghĩa', () => {
    expect(service).toBeDefined();
  });

  describe('getAllTransactions', () => {
    it('trả về các giao dịch cho khách hàng', async () => {
      const userId = '123e4567-e89b-42d3-a456-426614174000';
      const role = RoleEnum.KHACHHANG;
      const filters = {};
      const mockTransactions = [
        { MaGiaoDich: '123e4567-e89b-42d3-a456-426614174000' },
      ];
      const mockPagination = { total: 1 };

      mockPrismaService.xprisma.gIAODICH.withCursor.mockResolvedValue([
        mockTransactions,
        mockPagination,
      ]);

      const result = await service.getAllTransactions(userId, role, filters);

      expect(result.data).toEqual(mockTransactions);
      expect(result.pagination).toEqual(mockPagination);
      expect(mockPrismaService.xprisma.gIAODICH.paginate).toHaveBeenCalled();
    });

    it('ném BadRequestException nếu userId không hợp lệ', async () => {
      await expect(
        service.getAllTransactions('invalid-uuid', RoleEnum.KHACHHANG, {}),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateTransactionStatus', () => {
    it('cập nhật trạng thái giao dịch thành công', async () => {
      const webhookData = {
        data: { orderCode: 123223454, paymentLinkId: 'link-id', code: '00' },
        success: true,
        verified: true,
      };
      const mockTransaction = {
        MaGiaoDich: '123e4567-e89b-42d3-a456-426614174000',
        NgayGiaoDich: new Date(),
        TrangThai: TransactionStatusEnum.DANGCHO,
        HoaDon: {
          MaHoaDon: '123e4567-e89b-42d3-a456-426614174001',
          TongTien: 100000,
          Email: 'test@example.com',
          Code: '123456',
          Ves: [
            {
              GiaVe: 50000,
              GheSuatChieu: {
                GhePhongChieu: {
                  GheLoaiGhe: {
                    Ghe: { Hang: 'A', Cot: '1' },
                  },
                },
                SuatChieu: {
                  ThoiGianBatDau: new Date(),
                  PhongChieu: { TenPhongChieu: 'Room 1' },
                  PhienBanPhim: {
                    Phim: {
                      TenHienThi: 'Movie 1',
                      NhanPhim: { TenNhanPhim: '2D' },
                    },
                    DinhDang: { TenDinhDang: '2D' },
                    NgonNgu: { TenNgonNgu: 'Vietsub' },
                  },
                },
              },
            },
          ],
          HoaDonCombos: [],
        },
      };

      mockPayosService.verifyPaymentWebhookData.mockReturnValue(webhookData);
      mockPrismaService.gIAODICH.findFirst.mockResolvedValue(mockTransaction);
      mockPrismaService.gIAODICH.update.mockResolvedValue({
        ...mockTransaction,
        TrangThai: TransactionStatusEnum.THANHCONG,
      });

      const result = await service.updateTransactionStatus(webhookData);

      expect(result.success).toBe(true);
      expect(mockPrismaService.gIAODICH.update).toHaveBeenCalled();
      expect(mockMailService.sendInvoiceEmail).toHaveBeenCalled();
    });

    it('trả về success false nếu không tìm thấy giao dịch', async () => {
      const webhookData = {
        data: { orderCode: 123, paymentLinkId: 'link-id' },
        verified: true,
      };
      mockPayosService.verifyPaymentWebhookData.mockReturnValue(webhookData);
      mockPrismaService.gIAODICH.findFirst.mockResolvedValue(null);

      const result = await service.updateTransactionStatus(webhookData);

      expect(result.success).toBe(false);
    });
  });

  describe('createRefundTransaction', () => {
    it('tạo giao dịch hoàn vé thành công', async () => {
      const body = {
        MaYeuCau: '123e4567-e89b-42d3-a456-426614174000',
        PhuongThuc: TransactionEnum.TRUCTIEP,
      };
      const mockRefundRequest = {
        MaYeuCau: '123e4567-e89b-42d3-a456-426614174000',
        MaNguoiDung: '123e4567-e89b-42d3-a456-426614174000',
        SoTien: 50000,
        HoaDon: { MaHoaDon: '123e4567-e89b-42d3-a456-426614174001' },
      };
      const mockStaff = { MaNhanVien: '123e4567-e89b-42d3-a456-426614174002' };

      mockRequest.user.vaitro = RoleEnum.NHANVIEN;

      mockPrismaService.nHANVIEN.findFirst.mockResolvedValue(mockStaff);
      mockPrismaService.yEUCAUHOANVE.findUnique.mockResolvedValue(
        mockRefundRequest,
      );
      mockPrismaService.gIAODICH.create.mockResolvedValue({
        MaGiaoDich: '123e4567-e89b-42d3-a456-426614174000',
      });
      mockPrismaService.gIAODICH.findUnique.mockResolvedValue({
        MaGiaoDich: '123e4567-e89b-42d3-a456-426614174000',
      });

      const result = await service.createRefundTransaction(body as any);

      expect(result).toBeDefined();
      expect(mockPrismaService.gIAODICH.create).toHaveBeenCalled();
      expect(mockPrismaService.yEUCAUHOANVE.updateMany).toHaveBeenCalled();
    });

    it('ném BadRequestException nếu MaYeuCau không hợp lệ', async () => {
      await expect(
        service.createRefundTransaction({
          MaYeuCau: 'invalid-uuid',
          PhuongThuc: TransactionEnum.TRUCTIEP,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('ném BadRequestException nếu yêu cầu hoàn vé không tồn tại', async () => {
      mockRequest.user.vaitro = RoleEnum.NHANVIEN;
      mockPrismaService.nHANVIEN.findFirst.mockResolvedValue({
        MaNhanVien: '123e4567-e89b-42d3-a456-426614174002',
      });
      mockPrismaService.yEUCAUHOANVE.findUnique.mockResolvedValue(null);

      await expect(
        service.createRefundTransaction({
          MaYeuCau: '123e4567-e89b-42d3-a456-426614174000',
          PhuongThuc: TransactionEnum.TRUCTIEP,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateRefundTransactionStatus', () => {
    it('cập nhật trạng thái giao dịch hoàn tiền thành công', async () => {
      const transactionId = '123e4567-e89b-42d3-a456-426614174000';
      const request = { TrangThai: TransactionStatusEnum.THANHCONG };
      const mockTransaction = {
        MaGiaoDich: transactionId,
        LoaiGiaoDich: TransactionTypeEnum.HOANTIEN,
        YeuCauHoanVes: [{ MaYeuCau: '123e4567-e89b-42d3-a456-426614174001' }],
      };

      mockPrismaService.gIAODICH.findFirst.mockResolvedValue(mockTransaction);
      mockPrismaService.gIAODICH.update.mockResolvedValue({
        ...mockTransaction,
        TrangThai: TransactionStatusEnum.THANHCONG,
      });
      mockPrismaService.gIAODICH.findUnique.mockResolvedValue({
        ...mockTransaction,
        TrangThai: TransactionStatusEnum.THANHCONG,
      });

      const result = await service.updateRefundTransactionStatus(
        transactionId,
        request as any,
      );

      expect(result).toBeDefined();
      expect(mockPrismaService.gIAODICH.update).toHaveBeenCalled();
      expect(
        mockRefundRequestService.updateRefundRequestStatus,
      ).toHaveBeenCalled();
    });

    it('ném BadRequestException nếu transactionId không hợp lệ', async () => {
      await expect(
        service.updateRefundTransactionStatus('invalid-uuid', {} as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateTransactionMethod', () => {
    it('cập nhật phương thức giao dịch thành công', async () => {
      const transactionId = '123e4567-e89b-42d3-a456-426614174000';
      const request = { PhuongThuc: TransactionEnum.TRUCTIEP };
      const mockTransaction = {
        MaGiaoDich: transactionId,
        PhuongThuc: TransactionEnum.TRUCTUYEN,
      };

      mockPrismaService.gIAODICH.findFirst.mockResolvedValue(mockTransaction);
      mockPrismaService.gIAODICH.update.mockResolvedValue({
        ...mockTransaction,
        PhuongThuc: TransactionEnum.TRUCTIEP,
      });

      await service.updateTransactionMethod(transactionId, request as any);

      expect(mockPrismaService.gIAODICH.update).toHaveBeenCalled();
    });

    it('ném BadRequestException nếu transactionId không hợp lệ', async () => {
      await expect(
        service.updateTransactionMethod('invalid-uuid', {} as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
