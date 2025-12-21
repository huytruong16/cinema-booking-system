import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScreeningRoomDto } from './dtos/create-screening-room.dto';

@Injectable()
export class ScreeningRoomService {
    constructor(
        readonly prisma: PrismaService,
    ) { }

    private getSeatsIncludeQuery(): any {
        return {
            where: { DeletedAt: null },
            select: {
                MaGhePhongChieu: true,
                GheLoaiGhe: {
                    select: {
                        MaGheLoaiGhe: true,
                        Ghe: {
                            select: {
                                MaGhe: true,
                                Hang: true,
                                Cot: true
                            }
                        },
                        LoaiGhe: {
                            select: {
                                MaLoaiGhe: true,
                                LoaiGhe: true,
                                HeSoGiaGhe: true,
                                MauSac: true
                            }
                        }
                    }
                }
            },
            orderBy: [
                { GheLoaiGhe: { Ghe: { Hang: 'asc' } } },
                { GheLoaiGhe: { Ghe: { Cot: 'asc' } } }
            ]
        };
    }

    async getAllScreeningRooms() {
        return await this.prisma.pHONGCHIEU.findMany({
            orderBy: { CreatedAt: 'desc' },
            where: { DeletedAt: null },
            select: {
                MaPhongChieu: true,
                TenPhongChieu: true,
                SoDoGhe: true,
                GhePhongChieus: this.getSeatsIncludeQuery(),
                CreatedAt: true,
                UpdatedAt: true,
                DeletedAt: true,
            }
        });
    }

    async getScreeningRoomById(id: string) {
        return await this.prisma.pHONGCHIEU.findUnique({
            where: { MaPhongChieu: id, DeletedAt: null },
            include: {
                GhePhongChieus: this.getSeatsIncludeQuery()
            }
        });
    }

    async createScreeningRoom(data: CreateScreeningRoomDto) {
        const prisma = this.prisma;
        const { TenPhongChieu, SoDoPhongChieu, DanhSachGhe } = data;

        await checkScreeningRoomExists();
        validateSeatConsistency();

        await prisma.$transaction(async (tx) => {
            const screeningRoom = await tx.pHONGCHIEU.create({
                data: {
                    TenPhongChieu,
                    SoDoGhe: SoDoPhongChieu,
                }
            });

            const screeningRoomId = screeningRoom.MaPhongChieu;

            for (const seat of DanhSachGhe) {
                const { Hang, Cot, MaLoaiGhe } = seat;

                const existingSeatSeatType = await findExistingSeat(Hang, Cot, MaLoaiGhe);

                await tx.gHE_PHONGCHIEU.create({
                    data: {
                        MaPhongChieu: screeningRoomId,
                        MaGheLoaiGhe: existingSeatSeatType.MaGheLoaiGhe,
                    }
                });
            }

            return screeningRoom;

            async function findExistingSeat(Hang: string, Cot: string, MaLoaiGhe: string) {
                const existingSeat = await tx.gHE.findFirst({
                    where: {
                        Hang: Hang,
                        Cot: Cot,
                        DeletedAt: null
                    },
                    select: {
                        MaGhe: true
                    }
                });

                if (!existingSeat) {
                    throw new BadRequestException(`Ghế tại hàng ${Hang} cột ${Cot} không tồn tại`);
                }

                const existingSeatSeatType = await tx.gHE_LOAIGHE.findFirst({
                    where: {
                        MaGhe: existingSeat.MaGhe,
                        MaLoaiGhe: MaLoaiGhe,
                        DeletedAt: null
                    },
                    select: {
                        MaGheLoaiGhe: true
                    }
                });

                if (!existingSeatSeatType) {
                    throw new BadRequestException(`Ghế tại hàng ${Hang} cột ${Cot} không có loại ghế được chọn`);
                }
                return existingSeatSeatType;
            }
        });

        async function checkScreeningRoomExists() {
            const screeningRoom = await prisma.pHONGCHIEU.findFirst({
                where: { DeletedAt: null, TenPhongChieu: TenPhongChieu },
            });

            if (screeningRoom) {
                throw new BadRequestException('Tên phòng chiếu đã tồn tại');
            }
        }

        function validateSeatConsistency() {
            const layoutSeats = new Set<string>();
            const listSeats = new Set<string>();

            for (const [row, cols] of Object.entries(SoDoPhongChieu)) {
                if (Array.isArray(cols)) {
                    cols.forEach((col: string) => {
                        if (col && String(col).trim() !== '') {
                            layoutSeats.add(`${row}${col}`);
                        }
                    });
                }
            }

            DanhSachGhe.forEach(seat => {
                listSeats.add(`${seat.Hang}${seat.Cot}`);
            });

            const missingInList = [...layoutSeats].filter(x => !listSeats.has(x));
            if (missingInList.length > 0) {
                throw new BadRequestException(`Các ghế sau có trong sơ đồ nhưng thiếu thông tin chi tiết: ${missingInList.join(', ')}`);
            }

            const missingInLayout = [...listSeats].filter(x => !layoutSeats.has(x));
            if (missingInLayout.length > 0) {
                throw new BadRequestException(`Các ghế sau có thông tin chi tiết nhưng không có trong sơ đồ: ${missingInLayout.join(', ')}`);
            }
        }
    }
}
