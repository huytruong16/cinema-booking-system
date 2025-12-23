import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BankService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllBanks() {
    return await this.prisma.nGANHANG.findMany({
      orderBy: { TenNganHang: 'asc' },
    });
  }
}
