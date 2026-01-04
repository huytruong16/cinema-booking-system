import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const params = [
  {
    TenThamSo: 'MaxTicketsPerOrder',
    GiaTri: '10',
    KieuDuLieu: 'number',
  },
  {
    TenThamSo: 'SupportEmail',
    GiaTri: 'support@example.com',
    KieuDuLieu: 'string',
  },
  {
    TenThamSo: 'DefaultLanguage',
    GiaTri: 'vi',
    KieuDuLieu: 'string',
  },
  {
    TenThamSo: 'RefundWindowHours',
    GiaTri: '240',
    KieuDuLieu: 'number',
  },
  {
    TenThamSo: 'SeatHoldDuration',
    GiaTri: '5',
    KieuDuLieu: 'number',
  },
];

async function seed() {
  try {
    for (const p of params) {
      try {
        await prisma.tHAMSO.upsert({
          where: { TenThamSo: p.TenThamSo },
          update: {
            GiaTri: p.GiaTri,
            KieuDuLieu: p.KieuDuLieu,
            UpdatedAt: new Date(),
          },
          create: {
            TenThamSo: p.TenThamSo,
            GiaTri: p.GiaTri,
            KieuDuLieu: p.KieuDuLieu,
          },
        });
      } catch {}
    }
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  void seed();
}

export default seed;
