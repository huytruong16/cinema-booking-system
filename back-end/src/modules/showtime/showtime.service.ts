import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetAllShowtimeDto } from './dtos/get-showtime.dto';
import { GetShowtimeByMovieDto } from './dtos/get-showtime-by-movie.dto';
import { CreateShowtimeDto } from './dtos/create-showtime.dto';
import { UpdateShowtimeDto } from './dtos/update-showtime.dto';
import { CursorUtils } from 'src/libs/common/utils/pagination.util';

@Injectable()
export class ShowtimeService {
    constructor(private readonly prisma: PrismaService) { }

    private applyShowtimeFilters(filters: GetAllShowtimeDto, whereConditions: any) {
        if (filters.MaPhim) {
            whereConditions.PhienBanPhim = {
                MaPhim: filters.MaPhim,
                DeletedAt: null
            };
        }

        if (filters.MaPhongChieu) {
            whereConditions.MaPhongChieu = filters.MaPhongChieu;
        }

        if (filters.MaPhienBanPhim) {
            whereConditions.MaPhienBanPhim = filters.MaPhienBanPhim;
        }

        if (filters.MaDinhDang) {
            whereConditions.PhienBanPhim = {
                ...whereConditions.PhienBanPhim,
                MaDinhDang: filters.MaDinhDang,
                DeletedAt: null
            };
        }

        if (filters.MaTheLoai) {
            whereConditions.PhienBanPhim = {
                ...whereConditions.PhienBanPhim,
                Phim: {
                    PhimTheLoais: {
                        some: {
                            MaTheLoai: filters.MaTheLoai,
                            DeletedAt: null
                        }
                    },
                    DeletedAt: null
                },
                DeletedAt: null
            };
        }

        if (filters.TrangThai) {
            whereConditions.TrangThai = filters.TrangThai;
        }

        if (filters.TuNgay) {
            whereConditions.ThoiGianBatDau = {
                ...whereConditions.ThoiGianBatDau,
                gte: new Date(filters.TuNgay)
            };
        }

        if (filters.DenNgay) {
            whereConditions.ThoiGianBatDau = {
                ...whereConditions.ThoiGianBatDau,
                lte: new Date(filters.DenNgay)
            };
        }
    }

    async getShowtimesByMovieId(movieId: string, filters: GetShowtimeByMovieDto) {
        const { TrangThai, NgayChieu } = filters;

        const film = await this.prisma.pHIM.findUnique({
            where: {
                MaPhim: movieId,
                DeletedAt: null,
            },
        });

        if (!film) {
            throw new NotFoundException('Phim không tồn tại');
        }

        let dateFilter = filterDate(NgayChieu);

        const showtimes = await this.prisma.sUATCHIEU.findMany({
            where: {
                PhienBanPhim: { MaPhim: movieId },
                DeletedAt: null,
                ...TrangThai && { TrangThai: { in: TrangThai } },
                ...dateFilter
            },
            orderBy: { ThoiGianBatDau: 'asc' },
            select: {
                MaSuatChieu: true,
                ThoiGianBatDau: true,
                ThoiGianKetThuc: true,
                TrangThai: true,
                PhongChieu: {
                    select: {
                        MaPhongChieu: true,
                        TenPhongChieu: true,
                    }
                },
                PhienBanPhim: {
                    select: {
                        MaPhienBanPhim: true,
                        DinhDang: {
                            select: {
                                TenDinhDang: true,
                            }
                        },
                        NgonNgu: {
                            select: {
                                TenNgonNgu: true,
                            }
                        }
                    }
                }
            }
        });

        const groupByDate: Map<number, Map<string, any>> = new Map();

        for (const s of showtimes) {
            const dateKeyObj = new Date(s.ThoiGianBatDau);
            dateKeyObj.setHours(0, 0, 0, 0);
            const dateKey = dateKeyObj.getTime();

            if (!groupByDate.has(dateKey)) {
                groupByDate.set(dateKey, new Map());
            }
            const pbpMap = groupByDate.get(dateKey)!;

            const pbpId = s.PhienBanPhim?.MaPhienBanPhim;
            if (!pbpMap.has(pbpId)) {
                pbpMap.set(pbpId, {
                    MaPhienBanPhim: pbpId,
                    DinhDang: s.PhienBanPhim?.DinhDang,
                    NgonNgu: s.PhienBanPhim?.NgonNgu,
                    PhongChieus: new Map()
                });
            }
            const phien = pbpMap.get(pbpId)!;

            const phongId = s.PhongChieu?.MaPhongChieu;
            if (!phien.PhongChieus.has(phongId)) {
                phien.PhongChieus.set(phongId, {
                    MaPhongChieu: phongId,
                    TenPhongChieu: s.PhongChieu?.TenPhongChieu,
                    SuatChieus: []
                });
            }
            const phong = phien.PhongChieus.get(phongId)!;

            phong.SuatChieus.push({
                MaSuatChieu: s.MaSuatChieu,
                ThoiGianBatDau: s.ThoiGianBatDau,
                ThoiGianKetThuc: s.ThoiGianKetThuc,
                TrangThai: s.TrangThai
            });
        }

        const showtimeAfterGroup = Array.from(groupByDate.entries()).map(([dateMs, pbpMap]) => {
            const NgayChieu = new Date(Number(dateMs));
            const PhienBanPhim = Array.from(pbpMap.values()).map((phien: any) => ({
                MaPhienBanPhim: phien.MaPhienBanPhim,
                DinhDang: phien.DinhDang,
                NgonNgu: phien.NgonNgu,
                PhongChieu: Array.from(phien.PhongChieus.values())
            }));
            return { NgayChieu, PhienBanPhim };
        });

        return {
            Phim: film,
            SuatChieuTheoNgay: showtimeAfterGroup
        }


        function filterDate(date: string | undefined) {
            let dateFilter = {};

            if (date) {
                const startDate = new Date(date);
                startDate.setHours(0, 0, 0, 0);

                const endDate = new Date(date);
                endDate.setDate(endDate.getDate() + 1);

                dateFilter = {
                    ThoiGianBatDau: {
                        gte: startDate,
                        lt: endDate
                    }
                };
            }
            return dateFilter;
        }
    }

    async getAllShowtimes(filters: GetAllShowtimeDto) {
        const whereConditions: any = { DeletedAt: null };

        this.applyShowtimeFilters(filters, whereConditions);

        const [data, pagination] = await this.prisma.xprisma.sUATCHIEU.paginate({
            where: whereConditions,
            orderBy: [
                { ThoiGianBatDau: 'asc' },
                { MaSuatChieu: 'asc' }
            ],
            include: {
                PhienBanPhim: {
                    include: {
                        Phim: {
                            include: {
                                NhanPhim: true,
                                PhimTheLoais: {
                                    include: {
                                        TheLoai: true,
                                    }
                                }
                            }
                        },
                        DinhDang: true,
                        NgonNgu: true
                    }
                },
            }
        }).withCursor(CursorUtils.getPrismaOptions(filters ?? {}, 'MaSuatChieu'));

        return { data, pagination };
    }

    async getShowtimeById(id: string) {
        const showtime = await this.prisma.sUATCHIEU.findUnique({
            where: { MaSuatChieu: id },
            include: {
                PhienBanPhim: {
                    include: {
                        Phim: {
                            include: {
                                NhanPhim: true,
                                PhimTheLoais: {
                                    include: {
                                        TheLoai: true
                                    }
                                }
                            }
                        },
                        DinhDang: true,
                        NgonNgu: true
                    }
                },
                PhongChieu: true,
                GheSuatChieus: {
                    where: { DeletedAt: null },
                    include: {
                        GhePhongChieu: {
                            include: {
                                GheLoaiGhe: {
                                    include: {
                                        Ghe: true,
                                        LoaiGhe: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!showtime || showtime.DeletedAt) {
            throw new NotFoundException('Suất chiếu không tồn tại');
        }

        return showtime;
    }

    async createShowtime(payload: CreateShowtimeDto) {
        const phienBan = await this.prisma.pHIENBANPHIM.findFirst({
            where: {
                MaPhienBanPhim: payload.MaPhienBanPhim,
                DeletedAt: null,
            },
        });

        if (!phienBan) {
            throw new NotFoundException('Phiên bản phim không tồn tại');
        }

        const phong = await this.prisma.pHONGCHIEU.findFirst({
            where: {
                MaPhongChieu: payload.MaPhongChieu,
                DeletedAt: null,
            },
        });

        if (!phong) {
            throw new NotFoundException('Phòng chiếu không tồn tại');
        }

        const showtime = await this.prisma.sUATCHIEU.create({
            data: {
                MaPhienBanPhim: payload.MaPhienBanPhim,
                MaPhongChieu: payload.MaPhongChieu,
                ThoiGianBatDau: new Date(payload.ThoiGianBatDau),
                ThoiGianKetThuc: new Date(payload.ThoiGianKetThuc),
                CreatedAt: new Date(),
            },
        });

        return {
            message: 'Tạo suất chiếu thành công',
            showtime,
        };
    }

    async updateShowtime(id: string, updateDto: UpdateShowtimeDto) {
        const showtime = await this.prisma.sUATCHIEU.findFirst({
            where: { MaSuatChieu: id, DeletedAt: null },
        });

        if (!showtime) {
            throw new NotFoundException(`Suất chiếu với ID ${id} không tồn tại`);
        }

        const updateData: any = {
            UpdatedAt: new Date(),
        };

        if (updateDto.MaPhienBanPhim !== undefined) {
            updateData.MaPhienBanPhim = updateDto.MaPhienBanPhim;
        }

        if (updateDto.MaPhongChieu !== undefined) {
            updateData.MaPhongChieu = updateDto.MaPhongChieu;
        }

        if (updateDto.ThoiGianBatDau !== undefined) {
            updateData.ThoiGianBatDau = new Date(updateDto.ThoiGianBatDau);
        }

        if (updateDto.ThoiGianKetThuc !== undefined) {
            updateData.ThoiGianKetThuc = new Date(updateDto.ThoiGianKetThuc);
        }

        if (updateDto.TrangThai !== undefined) {
            updateData.TrangThai = updateDto.TrangThai;
        }

        const updated = await this.prisma.sUATCHIEU.update({
            where: { MaSuatChieu: id },
            data: updateData,
        });

        return {
            message: 'Cập nhật suất chiếu thành công',
            showtime: updated,
        };
    }

    async removeShowtime(id: string) {
        const showtime = await this.prisma.sUATCHIEU.findFirst({
            where: { MaSuatChieu: id, DeletedAt: null },
        });

        if (!showtime) {
            throw new NotFoundException(`Suất chiếu với ID ${id} không tồn tại`);
        }

        await this.prisma.sUATCHIEU.update({
            where: { MaSuatChieu: id },
            data: {
                DeletedAt: new Date(),
            },
        });

        return { message: 'Xóa suất chiếu thành công' };
    }
}
