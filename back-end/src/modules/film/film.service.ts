import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFilmDto } from './dtos/create-film.dto';

@Injectable()
export class FilmService {
    constructor(
        readonly prisma: PrismaService,
    ) { }
    async getAllFilms() {
        return await this.prisma.pHIM.findMany({
            orderBy: { CreatedAt: 'desc' },
            where: { DeletedAt: null },
            include: {
                DanhGias: true,
                DinhDangs: { select: { DINHDANG: true } },
                TheLoais: { select: { THELOAI: true } },
            },
        });
    }
    async createFilm(payload: CreateFilmDto) {
        const prisma = this.prisma;

        await checkOriginalFilmNameExist(payload);
        await checkDisplayFilmNameExist(payload);

        let foundDinhDangs: { MaDinhDang: string; GiaVe: any }[] = [];
        if (payload.DinhDangs && payload.DinhDangs.length) {
            const ddEntries: any[] = payload.DinhDangs as any[];
            const ddIds = ddEntries.map(d => (typeof d === 'string' ? d : d.MaDinhDang));
            foundDinhDangs = await this.prisma.dINHDANG.findMany({ where: { MaDinhDang: { in: ddIds }, DeletedAt: null }, select: { MaDinhDang: true, GiaVe: true } });
            const foundDdIds = new Set(foundDinhDangs.map(d => d.MaDinhDang));
            const missingDd = ddIds.filter(id => !foundDdIds.has(id));
            if (missingDd.length) {
                throw new BadRequestException(`Một hoặc nhiều MaDinhDang không tồn tại: ${missingDd.join(', ')}`);
            }
        }

        if (payload.TheLoais && payload.TheLoais.length) {
            const tlIds = payload.TheLoais;
            const foundTheLoais = await this.prisma.tHELOAI.findMany({ where: { MaTheLoai: { in: tlIds }, DeletedAt: null }, select: { MaTheLoai: true } });
            const foundTlIds = new Set(foundTheLoais.map(t => t.MaTheLoai));
            const missingTl = tlIds.filter(id => !foundTlIds.has(id));
            if (missingTl.length) {
                throw new BadRequestException(`Một hoặc nhiều MaTheLoai không tồn tại: ${missingTl.join(', ')}`);
            }
        }

        const created = await this.prisma.$transaction(async (tx) => {
            const film = await addNewFilm(tx);
            await createFilmFormatMappings(payload, foundDinhDangs, film, tx);
            await createFilmGenreMappings(film, tx);

            return film;
        });

        return created;

        async function addNewFilm(tx: any) {
            return await tx.pHIM.create({
                data: {
                    TenGoc: payload.TenGoc,
                    TenHienThi: payload.TenHienThi,
                    TomTatNoiDung: payload.TomTatNoiDung ?? null,
                    DaoDien: payload.DaoDien ?? null,
                    DanhSachDienVien: payload.DanhSachDienVien ?? null,
                    PosterUrl: payload.PosterUrl ?? null,
                    QuocGia: payload.QuocGia ?? null,
                    TrailerUrl: payload.TrailerUrl ?? null,
                    ThoiLuong: payload.ThoiLuong,
                    NgayBatDauChieu: new Date(payload.NgayBatDauChieu),
                    NgayKetThucChieu: new Date(payload.NgayKetThucChieu),
                },
            });
        }

        async function createFilmGenreMappings(film: any, tx: any) {
            if (payload.TheLoais && payload.TheLoais.length) {
                const tlData = payload.TheLoais.map(ma => ({
                    MaPhim: film.MaPhim,
                    MaTheLoai: ma,
                }));
                await tx.pHIM_THELOAI.createMany({ data: tlData });
            }
        }

        async function createFilmFormatMappings(payload: CreateFilmDto, foundDinhDangs: { MaDinhDang: string; GiaVe: any; }[], film: any, tx: any) {
            if (payload.DinhDangs && payload.DinhDangs.length) {
                const priceMap = new Map(foundDinhDangs.map(d => [d.MaDinhDang, d.GiaVe]));
                const ddEntries: any[] = payload.DinhDangs as any[];
                const ddData = ddEntries.map((entry) => {
                    const ma = typeof entry === 'string' ? entry : entry.MaDinhDang;
                    const providedGiaVe = (typeof entry === 'object' && entry.GiaVe != null) ? entry.GiaVe : undefined;
                    return {
                        MaPhim: film.MaPhim,
                        MaDinhDang: ma,
                        GiaVe: providedGiaVe ?? priceMap.get(ma) ?? 0,
                    };
                });
                await tx.pHIM_DINHDANG.createMany({ data: ddData });
            }
        }

        async function checkOriginalFilmNameExist(payload: CreateFilmDto) {
            let isOriginalFilmNameExist = await prisma.pHIM.findFirst({
                where: {
                    TenGoc: payload.TenGoc,
                },
            });
            if (isOriginalFilmNameExist) {
                throw new BadRequestException('Tên gốc phim đã tồn tại');
            }
        }

        async function checkDisplayFilmNameExist(payload: CreateFilmDto) {
            let isDisplayFilmNameExist = await prisma.pHIM.findFirst({
                where: {
                    TenHienThi: payload.TenHienThi,
                }
            });
            if (isDisplayFilmNameExist) {
                throw new BadRequestException('Tên hiển thị phim đã tồn tại');
            }
        }
    }

    async getAllFilmFormats() {
        return await this.prisma.pHIM_DINHDANG.findMany({
            orderBy: { CreatedAt: 'desc' },
            where: { DeletedAt: null },
            select: { MaPhimDinhDang: true, PHIM: true, DINHDANG: true, },
        });
    }

    async getFilmById(id: string) {
        return await this.prisma.pHIM.findUnique({
            where: { MaPhim: id, DeletedAt: null },
            include: {
                DanhGias: true,
                DinhDangs: { select: { DINHDANG: true, GiaVe: true } },
                TheLoais: { select: { THELOAI: true } },
            },
        });
    }
}
