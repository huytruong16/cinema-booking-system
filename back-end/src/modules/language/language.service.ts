import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LanguageService {
    constructor(
        readonly prisma: PrismaService,
    ) { }

    async getAllLanguages() {
        return await this.prisma.nGONNGU.findMany({
            orderBy: { CreatedAt: 'desc' },
            where: { DeletedAt: null },
        });
    }

    async getLanguageById(id: string) {
        const language = await this.prisma.nGONNGU.findUnique({
            where: { MaNgonNgu: id, DeletedAt: null },
        });

        if (!language) {
            throw new NotFoundException('Ngôn ngữ không tồn tại');
        }

        return language;
    }
}
