import { Test, TestingModule } from '@nestjs/testing';
import { FilmCronService } from './film.cron.service';
import { PrismaService } from '../prisma/prisma.service';
import { FilmStatusEnum } from 'src/libs/common/enums';

describe('FilmCronService', () => {
    let service: FilmCronService;
    let prisma: PrismaService;

    const mockPrismaService = {
        pHIM: {
            updateMany: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FilmCronService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<FilmCronService>(FilmCronService);
        prisma = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    it('nên được định nghĩa', () => {
        expect(service).toBeDefined();
    });

    it('cập nhật trạng thái phim đúng theo thời gian', async () => {
        mockPrismaService.pHIM.updateMany.mockResolvedValue({ count: 1 });

        await service.handleCron();

        expect(prisma.pHIM.updateMany).toHaveBeenCalledTimes(3);

        expect(prisma.pHIM.updateMany).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                data: {
                    TrangThaiPhim: FilmStatusEnum.DANGCHIEU,
                },
            }),
        );

        expect(prisma.pHIM.updateMany).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                data: {
                    TrangThaiPhim: FilmStatusEnum.SAPCHIEU,
                },
            }),
        );

        expect(prisma.pHIM.updateMany).toHaveBeenNthCalledWith(
            3,
            expect.objectContaining({
                data: {
                    TrangThaiPhim: FilmStatusEnum.NGUNGCHIEU,
                },
            }),
        );
    });
});
