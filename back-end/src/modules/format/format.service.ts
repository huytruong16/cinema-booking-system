import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FormatService {
    constructor(
        readonly prisma: PrismaService,
    ) { }

    async getAllFormats() {
        return await this.prisma.dINHDANG.findMany({
            orderBy: { TenDinhDang: 'asc' },
            where: { DeletedAt: null },
        });
    }

    async getFormatById(id: string) {
        const format = await this.prisma.dINHDANG.findUnique({
            where: { MaDinhDang: id, DeletedAt: null },
        });

        if (!format) {
            throw new NotFoundException('Định dạng không tồn tại');
        }

        return format;
    }
}
