import { Test, TestingModule } from '@nestjs/testing';
import { ScreeningRoomService } from './screening-room.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ScreeningRoomService', () => {
  let service: ScreeningRoomService;

  const mockPrismaService = {
    pHONGCHIEU: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    gHE: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    gHE_LOAIGHE: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    gHE_PHONGCHIEU: {
      create: jest.fn(),
      updateMany: jest.fn(),
      createMany: jest.fn(),
    },
    sUATCHIEU: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScreeningRoomService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ScreeningRoomService>(ScreeningRoomService);
  });

  it('phải được định nghĩa', () => {
    expect(service).toBeDefined();
  });

  describe('getAllScreeningRooms', () => {
    it('trả về tất cả các phòng chiếu', async () => {
      const mockRooms = [{ MaPhongChieu: '1', TenPhongChieu: 'Phòng 1' }];
      mockPrismaService.pHONGCHIEU.findMany.mockResolvedValue(mockRooms);

      const result = await service.getAllScreeningRooms();
      expect(result).toEqual(mockRooms);
      expect(mockPrismaService.pHONGCHIEU.findMany).toHaveBeenCalled();
    });
  });

  describe('getScreeningRoomById', () => {
    it('trả về phòng chiếu theo id', async () => {
      const mockRoom = { MaPhongChieu: '1', TenPhongChieu: 'Phòng 1' };
      mockPrismaService.pHONGCHIEU.findUnique.mockResolvedValue(mockRoom);

      const result = await service.getScreeningRoomById('1');
      expect(result).toEqual(mockRoom);
      expect(mockPrismaService.pHONGCHIEU.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { MaPhongChieu: '1', DeletedAt: null },
        }),
      );
    });
  });

  describe('createScreeningRoom', () => {
    it('tạo phòng chiếu thành công', async () => {
      const dto = {
        TenPhongChieu: 'Phòng 1',
        SoDoPhongChieu: { A: ['01'] },
        DanhSachGhe: [{ Hang: 'A', Cot: '01', MaLoaiGhe: 'uuid-1234' }],
      };

      mockPrismaService.pHONGCHIEU.findFirst.mockResolvedValue(null);
      mockPrismaService.pHONGCHIEU.create.mockResolvedValue({
        MaPhongChieu: '1',
      });
      mockPrismaService.gHE.findFirst.mockResolvedValue(null);
      mockPrismaService.gHE.create.mockResolvedValue({ MaGhe: 'g1' });
      mockPrismaService.gHE_LOAIGHE.findFirst.mockResolvedValue(null);
      mockPrismaService.gHE_LOAIGHE.create.mockResolvedValue({
        MaGheLoaiGhe: 'gl1',
      });
      mockPrismaService.gHE_PHONGCHIEU.create.mockResolvedValue({});
      mockPrismaService.pHONGCHIEU.findUnique.mockResolvedValue({
        MaPhongChieu: '1',
        TenPhongChieu: 'Phòng 1',
      });

      const result = await service.createScreeningRoom(dto as any);
      expect(result).toEqual({ MaPhongChieu: '1', TenPhongChieu: 'Phòng 1' });
    });

    it('ném BadRequestException nếu tên phòng đã tồn tại', async () => {
      mockPrismaService.pHONGCHIEU.findFirst.mockResolvedValue({
        MaPhongChieu: '1',
      });

      await expect(
        service.createScreeningRoom({
          TenPhongChieu: 'Phòng 1',
          SoDoPhongChieu: {},
          DanhSachGhe: [],
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateScreeningRoom', () => {
    it('cập nhật phòng chiếu thành công', async () => {
      mockPrismaService.pHONGCHIEU.findFirst
        .mockResolvedValueOnce({ MaPhongChieu: '1', TenPhongChieu: 'Phòng cũ' })
        .mockResolvedValueOnce(null);

      mockPrismaService.gHE.findMany.mockResolvedValue([
        { MaGhe: 'g1', Hang: 'A', Cot: '01' },
      ]);
      mockPrismaService.gHE_LOAIGHE.findMany.mockResolvedValue([
        { MaGheLoaiGhe: 'gl1', MaGhe: 'g1', MaLoaiGhe: 'uuid-1234' },
      ]);
      mockPrismaService.pHONGCHIEU.update.mockResolvedValue({});
      mockPrismaService.gHE_PHONGCHIEU.updateMany.mockResolvedValue({});
      mockPrismaService.gHE_PHONGCHIEU.createMany.mockResolvedValue({});

      const result = await service.updateScreeningRoom('1', {
        TenPhongChieu: 'Phòng mới',
        DanhSachGhe: [{ Hang: 'A', Cot: '01', MaLoaiGhe: 'uuid-1234' }],
      } as any);

      expect(result).toEqual({ message: 'Cập nhật phòng chiếu thành công' });
    });
  });

  describe('removeScreeningRoom', () => {
    it('xóa phòng chiếu thành công', async () => {
      mockPrismaService.pHONGCHIEU.findFirst.mockResolvedValue({
        MaPhongChieu: '1',
      });
      mockPrismaService.sUATCHIEU.findFirst.mockResolvedValue(null);
      mockPrismaService.gHE_PHONGCHIEU.updateMany.mockResolvedValue({});
      mockPrismaService.pHONGCHIEU.update.mockResolvedValue({});

      const result = await service.removeScreeningRoom('1');
      expect(result).toEqual({ message: 'Xóa phòng chiếu thành công' });
    });

    it('ném NotFoundException nếu phòng chiếu không tồn tại', async () => {
      mockPrismaService.pHONGCHIEU.findFirst.mockResolvedValue(null);
      await expect(service.removeScreeningRoom('1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('ném BadRequestException nếu phòng chiếu có suất chiếu', async () => {
      mockPrismaService.pHONGCHIEU.findFirst.mockResolvedValue({
        MaPhongChieu: '1',
      });
      mockPrismaService.sUATCHIEU.findFirst.mockResolvedValue({
        MaSuatChieu: 'sc1',
      });

      await expect(service.removeScreeningRoom('1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
