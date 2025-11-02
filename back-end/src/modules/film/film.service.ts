import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

    async getAllFilmFormats() {
        return await this.prisma.pHIM_DINHDANG.findMany({
            orderBy: { CreatedAt: 'desc' },
            where: { DeletedAt: null },
            select: { PHIM: true, DINHDANG: true, },
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
