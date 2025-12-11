import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetAllShowtimeDto } from './dtos/get-showtime.dto';
import { GetShowtimeByMovieDto } from './dtos/get-showtime-by-movie.dto';

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

        const showtimes = await this.prisma.sUATCHIEU.findMany({
            where: whereConditions,
            orderBy: { ThoiGianBatDau: 'asc' },
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
        });

        return showtimes;
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
}
