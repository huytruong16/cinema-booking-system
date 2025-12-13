import { BadRequestException, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFilmDto } from './dtos/create-film.dto';
import { FilterFilmDto } from './dtos/filter-film.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class FilmService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService
    ) { }
    async getAllFilms(filters?: FilterFilmDto) {
        const whereConditions: any = { DeletedAt: null };

        if (filters?.MaNhanPhim) {
            whereConditions.MaNhanPhim = filters.MaNhanPhim;
        }

        if (filters?.MaTheLoai) {
            whereConditions.PhimTheLoais = {
                some: {
                    MaTheLoai: filters.MaTheLoai,
                    DeletedAt: null
                }
            };
        }

        if (filters?.MaDinhDang) {
            whereConditions.PhienBanPhims = {
                some: {
                    MaDinhDang: filters.MaDinhDang,
                    DeletedAt: null
                }
            };
        }

        if (filters?.MaNgonNgu) {
            whereConditions.PhienBanPhims = {
                some: {
                    MaNgonNgu: filters.MaNgonNgu,
                    DeletedAt: null
                }
            };
        }

        return await this.prisma.pHIM.findMany({
            orderBy: { CreatedAt: 'desc' },
            where: whereConditions,
            include: {
                DanhGias: true,
                PhienBanPhims: { select: { DinhDang: true, GiaVe: true, NgonNgu: true } },
                PhimTheLoais: { select: { TheLoai: true } },
                NhanPhim: true,
            },
        });
    }
    async createFilm(payload: CreateFilmDto, posterFile?: Express.Multer.File, backdropFile?: Express.Multer.File) {
        const prisma = this.prisma;

        await checkOriginalFilmNameExist(payload);
        await checkDisplayFilmNameExist(payload);

        const nhanPhim = await prisma.nHANPHIM.findFirst({
            where: { MaNhanPhim: payload.MaNhanPhim, DeletedAt: null }
        });
        if (!nhanPhim) {
            throw new BadRequestException('MaNhanPhim không tồn tại');
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

        const uploads: { posterUrl?: string; backdropUrl?: string } = {};
        if (posterFile) {
            const uploaded = await this.storageService.uploadFile(posterFile, {
                bucket: 'films',
                folder: 'posters',
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
            });
            uploads.posterUrl = uploaded.url;
        }
        if (backdropFile) {
            const uploaded = await this.storageService.uploadFile(backdropFile, {
                bucket: 'films',
                folder: 'backdrops',
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
            });
            uploads.backdropUrl = uploaded.url;
        }

        const created = await this.prisma.$transaction(async (tx) => {
            const film = await addNewFilm(tx);
            await createFilmGenreMappings(film, tx);
            return film;
        });

        return created;

        async function addNewFilm(tx: any) {
            return await tx.pHIM.create({
                data: {
                    TenGoc: payload.TenGoc,
                    MaNhanPhim: payload.MaNhanPhim,
                    TenHienThi: payload.TenHienThi,
                    TomTatNoiDung: payload.TomTatNoiDung ?? null,
                    DaoDien: payload.DaoDien ?? null,
                    DanhSachDienVien: payload.DanhSachDienVien ?? null,
                    PosterUrl: uploads.posterUrl ?? payload.PosterUrl ?? null,
                    BackdropUrl: uploads.backdropUrl ?? payload.BackdropUrl ?? null,
                    QuocGia: payload.QuocGia ?? null,
                    TrailerUrl: payload.TrailerUrl ?? null,
                    ThoiLuong: payload.ThoiLuong,
                    NgayBatDauChieu: new Date(payload.NgayBatDauChieu),
                    NgayKetThucChieu: new Date(payload.NgayKetThucChieu),
                    CreatedAt: new Date(),
                },
            });
        }

        async function createFilmGenreMappings(film: any, tx: any) {
            if (payload.TheLoais && payload.TheLoais.length) {
                const tlData = payload.TheLoais.map(ma => ({
                    MaPhim: film.MaPhim,
                    MaTheLoai: ma,
                    CreatedAt: new Date()
                }));
                await tx.pHIM_THELOAI.createMany({ data: tlData });
            }
        }

        async function checkOriginalFilmNameExist(payload: CreateFilmDto) {
            const isOriginalFilmNameExist = await prisma.pHIM.findFirst({ where: { TenGoc: payload.TenGoc } });
            if (isOriginalFilmNameExist) throw new BadRequestException('Tên gốc phim đã tồn tại');
        }

        async function checkDisplayFilmNameExist(payload: CreateFilmDto) {
            const isDisplayFilmNameExist = await prisma.pHIM.findFirst({ where: { TenHienThi: payload.TenHienThi } });
            if (isDisplayFilmNameExist) throw new BadRequestException('Tên hiển thị phim đã tồn tại');
        }
    }

    async updateFilm(id: string, updateDto: any, posterFile?: Express.Multer.File, backdropFile?: Express.Multer.File) {
        const film = await this.prisma.pHIM.findUnique({ where: { MaPhim: id, DeletedAt: null } });
        if (!film) throw new NotFoundException(`Phim với ID ${id} không tồn tại`);

        if (updateDto.TenGoc && updateDto.TenGoc !== film.TenGoc) {
            const exists = await this.prisma.pHIM.findFirst({ where: { TenGoc: updateDto.TenGoc, MaPhim: { not: id } } });
            if (exists) throw new ConflictException('Tên gốc phim đã tồn tại');
        }
        if (updateDto.TenHienThi && updateDto.TenHienThi !== film.TenHienThi) {
            const exists = await this.prisma.pHIM.findFirst({ where: { TenHienThi: updateDto.TenHienThi, MaPhim: { not: id } } });
            if (exists) throw new ConflictException('Tên hiển thị phim đã tồn tại');
        }

        const updateData: any = { UpdatedAt: new Date() };
        if (updateDto.TenGoc !== undefined) updateData.TenGoc = updateDto.TenGoc;
        if (updateDto.TenHienThi !== undefined) updateData.TenHienThi = updateDto.TenHienThi;
        if (updateDto.TomTatNoiDung !== undefined) updateData.TomTatNoiDung = updateDto.TomTatNoiDung;
        if (updateDto.DaoDien !== undefined) updateData.DaoDien = updateDto.DaoDien;
        if (updateDto.DanhSachDienVien !== undefined) updateData.DanhSachDienVien = updateDto.DanhSachDienVien;
        if (updateDto.QuocGia !== undefined) updateData.QuocGia = updateDto.QuocGia;
        if (updateDto.TrailerUrl !== undefined) updateData.TrailerUrl = updateDto.TrailerUrl;
        if (updateDto.ThoiLuong !== undefined) updateData.ThoiLuong = updateDto.ThoiLuong;
        if (updateDto.NgayBatDauChieu !== undefined) updateData.NgayBatDauChieu = new Date(updateDto.NgayBatDauChieu);
        if (updateDto.NgayKetThucChieu !== undefined) updateData.NgayKetThucChieu = new Date(updateDto.NgayKetThucChieu);

        // handle file uploads
        if (posterFile) {
            if (film.PosterUrl) {
                await this.storageService.deleteFile('films', film.PosterUrl);
            }
            const uploaded = await this.storageService.uploadFile(posterFile, {
                bucket: 'films',
                folder: 'posters',
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
            });
            updateData.PosterUrl = uploaded.url;
        }

        if (backdropFile) {
            if (film.BackdropUrl) {
                await this.storageService.deleteFile('films', film.BackdropUrl);
            }
            const uploaded = await this.storageService.uploadFile(backdropFile, {
                bucket: 'films',
                folder: 'backdrops',
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
            });
            updateData.BackdropUrl = uploaded.url;
        }

        return await this.prisma.pHIM.update({
            where: { MaPhim: id },
            data: updateData,
        });
    }

    async removeFilm(id: string) {
        const film = await this.prisma.pHIM.findUnique({ where: { MaPhim: id, DeletedAt: null } });
        if (!film) throw new NotFoundException(`Phim với ID ${id} không tồn tại`);

        if (film.PosterUrl) {
            await this.storageService.deleteFile('films', film.PosterUrl);
        }
        if (film.BackdropUrl) {
            await this.storageService.deleteFile('films', film.BackdropUrl);
        }

        return await this.prisma.pHIM.update({
            where: { MaPhim: id },
            data: {
                DeletedAt: new Date(),
                PosterUrl: null,
                BackdropUrl: null,
            },
        });
    }

    async getAllFilmFormats(filters?: FilterFilmDto) {
        const whereConditions: any = { DeletedAt: null };

        if (filters?.MaDinhDang) {
            whereConditions.MaDinhDang = filters.MaDinhDang;
        }
        if (filters?.MaNgonNgu) {
            whereConditions.MaNgonNgu = filters.MaNgonNgu;
        }

        if (filters?.MaTheLoai) {
            whereConditions.Phim = {
                PhimTheLoais: {
                    some: {
                        MaTheLoai: filters.MaTheLoai,
                        DeletedAt: null
                    }
                },
                DeletedAt: null
            };
        }

        if (filters?.MaNhanPhim) {
            whereConditions.Phim = {
                ...whereConditions.Phim,
                MaNhanPhim: filters.MaNhanPhim,
                DeletedAt: null
            };
        }

        return await this.prisma.pHIENBANPHIM.findMany({
            orderBy: { CreatedAt: 'desc' },
            where: whereConditions,
            select: {
                MaPhienBanPhim: true,
                Phim: {
                    include: {
                        NhanPhim: true,
                        PhimTheLoais: { select: { TheLoai: true } }
                    }
                },
                DinhDang: true,
                NgonNgu: true,
                GiaVe: true
            },
        });
    }

    async getFilmById(id: string) {
        return await this.prisma.pHIM.findUnique({
            where: { MaPhim: id, DeletedAt: null },
            include: {
                DanhGias: true,
                PhienBanPhims: { select: { DinhDang: true, GiaVe: true, NgonNgu: true } },
                PhimTheLoais: { select: { TheLoai: true } },
            },
        });
    }
}
