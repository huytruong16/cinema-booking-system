import { Test, TestingModule } from '@nestjs/testing';
import { RefundRequestController } from './refund-request.controller';
import { RefundRequestService } from './refund-request.service';
import { BadRequestException } from '@nestjs/common';
import { RefundRequestStatusEnum, RoleEnum } from 'src/libs/common/enums';
import { CreateRefundRequestDto } from './dto/create-refund-request.dto';
import { UpdateRefundRequestStatusDto } from './dto/update-refund-request-status.dto';
import { UpdateRefundRequestDto } from './dto/update-refund-request.dto';

describe('RefundRequestController', () => {
  let controller: RefundRequestController;

  const mockRefundRequestService = {
    getAllRefundRequests: jest.fn(),
    createNewRefundRequest: jest.fn(),
    updateRefundRequestStatus: jest.fn(),
    updateRefundRequestInfo: jest.fn(),
    getRefundRequestById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefundRequestController],
      providers: [
        { provide: RefundRequestService, useValue: mockRefundRequestService },
      ],
    }).compile();

    controller = module.get<RefundRequestController>(RefundRequestController);
  });

  it('nên được khởi tạo', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllRefundRequests', () => {
    it('nên trả về danh sách yêu cầu hoàn vé', async () => {
      const result = { data: [], pagination: {} };
      mockRefundRequestService.getAllRefundRequests.mockResolvedValue(result);

      const filters = {};
      expect(await controller.getAllRefundRequests(filters)).toBe(result);
      expect(
        mockRefundRequestService.getAllRefundRequests,
      ).toHaveBeenCalledWith(filters);
    });
  });

  describe('createRefundRequest', () => {
    it('nên tạo yêu cầu hoàn vé thành công', async () => {
      const req = {
        user: {
          id: '123e4567-e89b-42d3-a456-426614174000',
          vaitro: RoleEnum.KHACHHANG,
        },
      };
      const dto: CreateRefundRequestDto = {
        MaHoaDon: '123e4567-e89b-42d3-a456-426614174000',
        LyDo: 'Lý do hoàn vé',
        MaNganHang: 'VCB',
        SoTaiKhoan: '123456789',
        ChuTaiKhoan: 'NGUYEN VAN A',
      };
      const result = { success: true };
      mockRefundRequestService.createNewRefundRequest.mockResolvedValue(result);

      expect(await controller.createRefundRequest(req, dto)).toBe(result);
      expect(
        mockRefundRequestService.createNewRefundRequest,
      ).toHaveBeenCalledWith(req.user.id, req.user.vaitro, dto);
    });

    it('nên ném lỗi BadRequestException nếu khách hàng thiếu thông tin ngân hàng', async () => {
      const req = {
        user: {
          id: '123e4567-e89b-42d3-a456-426614174000',
          vaitro: RoleEnum.KHACHHANG,
        },
      };
      const dto: CreateRefundRequestDto = {
        MaHoaDon: '123e4567-e89b-42d3-a456-426614174000',
        LyDo: 'Lý do hoàn vé',
      } as any;

      await expect(controller.createRefundRequest(req, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateRefundRequestStatus', () => {
    it('nên cập nhật trạng thái yêu cầu hoàn vé thành công', async () => {
      const id = '123e4567-e89b-42d3-a456-426614174000';
      const body: UpdateRefundRequestStatusDto = {
        TrangThai: RefundRequestStatusEnum.DAHOAN,
      };
      const result = { success: true };
      mockRefundRequestService.updateRefundRequestStatus.mockResolvedValue(
        result,
      );

      expect(await controller.updateRefundRequestStatus(id, body)).toBe(result);
      expect(
        mockRefundRequestService.updateRefundRequestStatus,
      ).toHaveBeenCalledWith(id, body);
    });

    it('nên ném lỗi BadRequestException nếu id không phải UUID v4 hợp lệ', async () => {
      const id = 'invalid-uuid';
      const body: UpdateRefundRequestStatusDto = {
        TrangThai: RefundRequestStatusEnum.DAHOAN,
      };

      await expect(
        controller.updateRefundRequestStatus(id, body),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateRefundRequest', () => {
    it('nên cập nhật thông tin yêu cầu hoàn vé thành công', async () => {
      const id = '123e4567-e89b-42d3-a456-426614174000';
      const body: UpdateRefundRequestDto = {
        LyDoHoan: 'Lý do mới',
      };
      const result = {};
      mockRefundRequestService.updateRefundRequestInfo.mockResolvedValue(
        result,
      );

      expect(await controller.updateRefundRequest(id, body)).toBe(result);
      expect(
        mockRefundRequestService.updateRefundRequestInfo,
      ).toHaveBeenCalledWith(id, body);
    });

    it('nên ném lỗi BadRequestException nếu id không phải UUID v4 hợp lệ', async () => {
      const id = 'invalid-uuid';
      const body: UpdateRefundRequestDto = {
        LyDoHoan: 'Lý do mới',
      };

      await expect(controller.updateRefundRequest(id, body)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getById', () => {
    it('nên trả về chi tiết yêu cầu hoàn vé', async () => {
      const id = '123e4567-e89b-42d3-a456-426614174000';
      const result = {};
      mockRefundRequestService.getRefundRequestById.mockResolvedValue(result);

      expect(await controller.getById(id)).toBe(result);
      expect(
        mockRefundRequestService.getRefundRequestById,
      ).toHaveBeenCalledWith(id);
    });

    it('nên ném lỗi BadRequestException nếu id không phải UUID v4 hợp lệ', async () => {
      const id = 'invalid-uuid';
      await expect(controller.getById(id)).rejects.toThrow(BadRequestException);
    });
  });
});
