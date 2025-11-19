import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComboService {
    constructor(readonly prisma: PrismaService) { }

    async getAllCombos() {
        return await this.prisma.cOMBO.findMany({
            orderBy: { CreatedAt: 'desc' },
            where: { DeletedAt: null },
            include: {
                HoaDonCombos: false,
            },
        });
    }

    async getComboById(id: string) {
        return await this.prisma.cOMBO.findUnique({
            where: { MaCombo: id, DeletedAt: null },
            include: {
                HoaDonCombos: false,
            },
        });
    }
}
