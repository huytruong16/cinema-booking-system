import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GenreService {
    constructor(
        readonly prisma: PrismaService,
    ) { }

    async getAllGenres() {
        return await this.prisma.tHELOAI.findMany({
            orderBy: { TenTheLoai: 'asc' },
            where: { DeletedAt: null },
        });
    }

    async getGenreById(id: string) {
        const genre = await this.prisma.tHELOAI.findUnique({
            where: { MaTheLoai: id, DeletedAt: null },
        });

        if (!genre) {
            throw new NotFoundException('Thể loại không tồn tại');
        }

        return genre;
    }
}
