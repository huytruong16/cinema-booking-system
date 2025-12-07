import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RefundRequestService {
    constructor(
        readonly prisma: PrismaService,
    ) { }
    async getAllRefundRequests() {
        return await this.prisma.yEUCAUHOANVE.findMany({
            orderBy: { CreatedAt: 'desc' },
            where: { DeletedAt: null },
            include: { Ve: true },
        });
    }

    async getRefundRequestById(id: string): Promise<any> {
        const refundRequest = await this.prisma.yEUCAUHOANVE.findUnique({
            where: { MaYeuCau: id, DeletedAt: null },
            include: {
                Ve: {
                    include: {
                        GheSuatChieu: {
                            include: {
                                SuatChieu: true
                            }
                        }
                    }
                },
                GiaoDich: true
            },
        });
        if (!refundRequest) {
            throw new NotFoundException('Yêu cầu hoàn vé không tồn tại');
        }
        return refundRequest;
    }
}