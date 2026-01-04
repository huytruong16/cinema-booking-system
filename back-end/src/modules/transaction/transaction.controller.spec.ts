import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { BadRequestException } from '@nestjs/common';
import {
  RoleEnum,
  TransactionEnum,
  TransactionStatusEnum,
} from 'src/libs/common/enums';

describe('TransactionController', () => {
  let controller: TransactionController;

  const mockTransactionService = {
    getAllTransactions: jest.fn(),
    updateTransactionStatus: jest.fn(),
    createRefundTransaction: jest.fn(),
    updateRefundTransactionStatus: jest.fn(),
    updateTransactionMethod: jest.fn(),
    getTransactionById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        { provide: TransactionService, useValue: mockTransactionService },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
  });

  it('nên được khởi tạo', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllTransaction', () => {
    it('nên trả về danh sách giao dịch', async () => {
      const result = { data: [], pagination: {} };
      mockTransactionService.getAllTransactions.mockResolvedValue(result);

      const req = {
        user: {
          id: '123e4567-e89b-42d3-a456-426614174000',
          vaitro: RoleEnum.KHACHHANG,
        },
      };
      const filters = {};

      expect(await controller.getAllTransaction(req, filters)).toBe(result);
      expect(mockTransactionService.getAllTransactions).toHaveBeenCalledWith(
        req.user.id,
        req.user.vaitro,
        filters,
      );
    });

    it('nên ném lỗi BadRequestException nếu userId không phải UUID hợp lệ', async () => {
      const req = { user: { id: 'invalid-uuid', vaitro: RoleEnum.KHACHHANG } };
      await expect(controller.getAllTransaction(req, {})).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('handlePayosWebhook', () => {
    it('nên xử lý webhook từ PayOS thành công', async () => {
      const body = { some: 'data' };
      const result = { success: true };
      mockTransactionService.updateTransactionStatus.mockResolvedValue(result);

      expect(await controller.handlePayosWebhook(body)).toBe(result);
      expect(
        mockTransactionService.updateTransactionStatus,
      ).toHaveBeenCalledWith(body);
    });
  });

  describe('createRefundTransaction', () => {
    it('nên tạo giao dịch hoàn tiền thành công', async () => {
      const body = {
        refundRequestIds: ['123e4567-e89b-42d3-a456-426614174000'],
      };
      const result = { success: true };
      mockTransactionService.createRefundTransaction.mockResolvedValue(result);

      expect(await controller.createRefundTransaction(body as any)).toBe(
        result,
      );
      expect(
        mockTransactionService.createRefundTransaction,
      ).toHaveBeenCalledWith(body);
    });
  });

  describe('updateTransactionStatus', () => {
    it('nên cập nhật trạng thái giao dịch hoàn tiền thành công', async () => {
      const transactionId = '123e4567-e89b-42d3-a456-426614174000';
      const request = { TrangThai: TransactionStatusEnum.THANHCONG };
      const result = { success: true };
      mockTransactionService.updateRefundTransactionStatus.mockResolvedValue(
        result,
      );

      expect(
        await controller.updateTransactionStatus(transactionId, request as any),
      ).toBe(result);
      expect(
        mockTransactionService.updateRefundTransactionStatus,
      ).toHaveBeenCalledWith(transactionId, request);
    });

    it('nên ném lỗi BadRequestException nếu id không phải UUID hợp lệ', async () => {
      const transactionId = 'invalid-uuid';
      const request = { TrangThai: TransactionStatusEnum.THANHCONG };

      await expect(
        controller.updateTransactionStatus(transactionId, request as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateTransactionMethod', () => {
    it('nên cập nhật phương thức giao dịch thành công', async () => {
      const transactionId = '123e4567-e89b-42d3-a456-426614174000';
      const request = { PhuongThuc: TransactionEnum.TRUCTIEP };
      const result = { success: true };
      mockTransactionService.updateTransactionMethod.mockResolvedValue(result);

      expect(
        await controller.updateTransactionMethod(transactionId, request as any),
      ).toBe(result);
      expect(
        mockTransactionService.updateTransactionMethod,
      ).toHaveBeenCalledWith(transactionId, request);
    });

    it('nên ném lỗi BadRequestException nếu id không phải UUID hợp lệ', async () => {
      const transactionId = 'invalid-uuid';
      const request = { PhuongThuc: TransactionEnum.TRUCTIEP };

      await expect(
        controller.updateTransactionMethod(transactionId, request as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTransactionById', () => {
    it('nên trả về thông tin giao dịch', async () => {
      const transactionId = '123e4567-e89b-42d3-a456-426614174000';
      const result = { MaGiaoDich: transactionId };
      mockTransactionService.getTransactionById.mockResolvedValue(result);

      const req = {
        user: {
          id: 'user-uuid',
          vaitro: RoleEnum.KHACHHANG,
        },
      };

      expect(await controller.getTransactionById(req, transactionId)).toBe(
        result,
      );
      expect(mockTransactionService.getTransactionById).toHaveBeenCalledWith(
        req.user.id,
        req.user.vaitro,
        transactionId,
      );
    });

    it('nên ném lỗi BadRequestException nếu id không phải UUID hợp lệ', async () => {
      const transactionId = 'invalid-uuid';
      const req = { user: { id: 'user-uuid', vaitro: RoleEnum.KHACHHANG } };

      await expect(
        controller.getTransactionById(req, transactionId),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
