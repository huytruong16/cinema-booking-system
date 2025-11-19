import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetShowtimeDto } from './dtos/get-showtime.dto';

@Injectable()
export class ShowtimeService {
    constructor(private readonly prisma: PrismaService) { }

    private readonly fullShowtimeInclude = {
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
    };

    private applyShowtimeFilters(filters: GetShowtimeDto, whereConditions: any) {
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

    async getShowtimes(filters: GetShowtimeDto) {
        const whereConditions: any = { DeletedAt: null };

        this.applyShowtimeFilters(filters, whereConditions);

        const showtimes = await this.prisma.sUATCHIEU.findMany({
            where: whereConditions,
            orderBy: { ThoiGianBatDau: 'asc' },
            include: this.fullShowtimeInclude
        });

        return showtimes;
    }

    async getShowtimeById(id: string) {
        const showtime = await this.prisma.sUATCHIEU.findUnique({
            where: { MaSuatChieu: id },
            include: this.fullShowtimeInclude
        });

        if (!showtime || showtime.DeletedAt) {
            throw new NotFoundException('Suất chiếu không tồn tại');
        }

        return showtime;
    }
}
