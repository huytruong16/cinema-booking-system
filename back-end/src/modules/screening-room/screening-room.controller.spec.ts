import { Test, TestingModule } from '@nestjs/testing';
import { ScreeningRoomController } from './screening-room.controller';
import { ScreeningRoomService } from './screening-room.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ScreeningRoomController', () => {
  let controller: ScreeningRoomController;

  const mockScreeningRoomService = {
    getAllScreeningRooms: jest.fn(),
    getScreeningRoomById: jest.fn(),
    createScreeningRoom: jest.fn(),
    updateScreeningRoom: jest.fn(),
    removeScreeningRoom: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScreeningRoomController],
      providers: [
        { provide: ScreeningRoomService, useValue: mockScreeningRoomService },
      ],
    }).compile();

    controller = module.get<ScreeningRoomController>(ScreeningRoomController);
  });

  it('phải được định nghĩa', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllScreeningRooms', () => {
    it('trả về danh sách tất cả phòng chiếu', async () => {
      const mockRooms = [{ MaPhongChieu: '1', TenPhongChieu: 'Phòng 1' }];
      mockScreeningRoomService.getAllScreeningRooms.mockResolvedValue(
        mockRooms,
      );

      const result = await controller.getAllScreeningRooms();
      expect(result).toEqual(mockRooms);
      expect(mockScreeningRoomService.getAllScreeningRooms).toHaveBeenCalled();
    });
  });

  describe('getScreeningRoomById', () => {
    it('trả về phòng chiếu theo id', async () => {
      const mockRoom = { MaPhongChieu: 'uuid-1234', TenPhongChieu: 'Phòng 1' };
      mockScreeningRoomService.getScreeningRoomById.mockResolvedValue(mockRoom);

      const result = await controller.getScreeningRoomById(
        '550e8400-e29b-41d4-a716-446655440000',
      );
      expect(result).toEqual(mockRoom);
      expect(
        mockScreeningRoomService.getScreeningRoomById,
      ).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
    });

    it('ném BadRequestException nếu UUID không hợp lệ', async () => {
      await expect(
        controller.getScreeningRoomById('invalid-uuid'),
      ).rejects.toThrow(BadRequestException);
    });

    it('ném NotFoundException nếu phòng chiếu không tồn tại', async () => {
      mockScreeningRoomService.getScreeningRoomById.mockResolvedValue(null);
      await expect(
        controller.getScreeningRoomById('550e8400-e29b-41d4-a716-446655440000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createScreeningRoom', () => {
    it('gọi service để tạo phòng chiếu', async () => {
      const dto = {
        TenPhongChieu: 'Phòng 1',
        SoDoPhongChieu: {},
        DanhSachGhe: [],
      };
      const mockRoom = { MaPhongChieu: '1', TenPhongChieu: 'Phòng 1' };
      mockScreeningRoomService.createScreeningRoom.mockResolvedValue(mockRoom);

      const result = await controller.createScreeningRoom(dto as any);
      expect(result).toEqual(mockRoom);
      expect(mockScreeningRoomService.createScreeningRoom).toHaveBeenCalledWith(
        dto,
      );
    });
  });

  describe('updateScreeningRoom', () => {
    it('gọi service để cập nhật phòng chiếu', async () => {
      const dto = { TenPhongChieu: 'Phòng mới' };
      const mockResponse = { message: 'Cập nhật phòng chiếu thành công' };
      mockScreeningRoomService.updateScreeningRoom.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.updateScreeningRoom(
        '550e8400-e29b-41d4-a716-446655440000',
        dto as any,
      );
      expect(result).toEqual(mockResponse);
      expect(mockScreeningRoomService.updateScreeningRoom).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        dto,
      );
    });

    it('ném BadRequestException nếu UUID không hợp lệ', async () => {
      await expect(
        controller.updateScreeningRoom('invalid-uuid', {} as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeScreeningRoom', () => {
    it('gọi service để xóa phòng chiếu', async () => {
      const mockResponse = { message: 'Xóa phòng chiếu thành công' };
      mockScreeningRoomService.removeScreeningRoom.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.removeScreeningRoom(
        '550e8400-e29b-41d4-a716-446655440000',
      );
      expect(result).toEqual(mockResponse);
      expect(mockScreeningRoomService.removeScreeningRoom).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
      );
    });

    it('ném BadRequestException nếu UUID không hợp lệ', async () => {
      await expect(
        controller.removeScreeningRoom('invalid-uuid'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
