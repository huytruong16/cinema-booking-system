import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) { }

  async getAllInvoices() {
    return this.prisma.hOADON.findMany(
      {
        where: { DeletedAt: null },
        orderBy: { CreatedAt: 'desc' },
        include: {
          HoaDonCombos: {
            include: {
              Combo: true,
            }
          },
          Ves: true
        },
      }
    );
  }

  async getInvoiceById(id: string) {
    const invoice = await this.prisma.hOADON.findUnique(
      {
        where: { MaHoaDon: id, DeletedAt: null },
        include: {
          HoaDonCombos: {
            include: {
              Combo: true
            }
          },
          Ves: {
            include: {
              GheSuatChieu: {
                include: {
                  GhePhongChieu: {
                    include: {
                      GheLoaiGhe: {
                        include: {
                          LoaiGhe: true,
                          Ghe: true
                        }
                      }
                    }
                  },
                  SuatChieu: {
                    include: {
                      PhienBanPhim: {
                        include: {
                          Phim: {
                            include: {
                              PhimTheLoais: {
                                include: {
                                  TheLoai: true
                                }
                              }
                            }
                          },
                          DinhDang: true,
                          NgonNgu: true
                        }
                      },
                      PhongChieu: true,
                    }
                  }
                }
              }
            }
          },
          GiaoDichs: true,
          HoaDonKhuyenMais: {
            include: {
              KhuyenMaiKH: {
                include: {
                  KhuyenMai: true,
                }
              }
            }
          },
        },
      }
    );

    if (!invoice) {
      throw new NotFoundException('Hóa đơn không tồn tại');
    }

    return invoice;
  }
}