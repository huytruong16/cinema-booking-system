import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VoucherService {
    constructor(
        readonly prisma: PrismaService,
    ) { }

    async getAllVouchers() {
        return await this.prisma.kHUYENMAI.findMany({
            orderBy: { CreatedAt: 'desc' },
            where: { DeletedAt: null },
        });
    }

    async getVoucherById(id: string) {
        return await this.prisma.kHUYENMAI.findUnique({
            where: { MaKhuyenMai: id, DeletedAt: null },
        });
    }
}
