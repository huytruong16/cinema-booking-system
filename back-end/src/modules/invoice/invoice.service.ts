import { Injectable, NotFoundException, BadRequestException, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dtos/create-invoice.dto';
import { DiscountTypeEnum, PromoStatusEnum, RoleEnum, SeatStatusEnum, TransactionEnum, TransactionStatusEnum, TransactionTypeEnum } from 'src/libs/common/enums';
import { PayosService } from 'src/libs/common/services/payos.service';
import VoucherTargetEnum from 'src/libs/common/enums/voucher_target.enum';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.REQUEST })
export class InvoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payosService: PayosService,
    private readonly configService: ConfigService,
    @Inject(REQUEST) private readonly request: any,
  ) { }

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

  async createInvoice(request: CreateInvoiceDto) {
    const { Email, MaGheSuatChieus, Combos, MaVouchers } = request;
    const prisma = this.prisma;
    const userId = this.request?.user.id

    const user = await prisma.nGUOIDUNGPHANMEM.findUnique({
      where: { MaNguoiDung: userId }
    });

    if ((!user || user.VaiTro !== RoleEnum.KHACHHANG) && Email) {
      throw new BadRequestException('Email không được để trống');
    }

    let total = 0;
    let discountTotal = 0;

    const seatPrices: { id: string, price: number }[] = await getSeatPrice();
    const comboPrices: { id: string, price: number }[] = await getComboPrice();
    const voucherPrices: { id: string, price: number }[] = await getVoucherPrice();

    const totalAfterDiscount = Math.max(0, total - discountTotal);

    const genCode = () => Math.floor(1000000000 + Math.random() * 9000000000);
    const emailToUse = Email || user!.Email;

    const code = genCode();

    const created = await prisma.$transaction(async (tx) => {
      const hoaDon = await tx.hOADON.create({
        data: {
          Email: emailToUse,
          Code: genCode().toString(),
          NgayLap: new Date(),
          TongTien: totalAfterDiscount.toString(),
        }
      });

      if (Combos && Combos.length > 0) {
        for (const c of comboPrices) {
          await tx.hOADONCOMBO.create({
            data: {
              MaHoaDon: hoaDon.MaHoaDon,
              MaCombo: c.id,
              SoLuong: Combos.find(x => x.MaCombo === c.id)?.SoLuong || 1,
              DonGia: c.price.toString()
            }
          });
        }
      }

      for (const s of seatPrices) {
        await tx.vE.create({
          data: {
            MaGheSuatChieu: s.id,
            GiaVe: s.price.toString(),
            MaHoaDon: hoaDon.MaHoaDon
          }
        });

        await tx.gHE_SUATCHIEU.update({
          where: { MaGheSuatChieu: s.id },
          data: { TrangThai: SeatStatusEnum.DADAT }
        });

        for (const v of voucherPrices) {
          await tx.hOADON_KHUYENMAI.create({
            data: {
              MaHoaDon: hoaDon.MaHoaDon,
              MaKhuyenMaiKH: v.id,
              GiaTriGiam: v.price,
            }
          });
        }
      }

      return hoaDon;
    });

    const paymentData: { paymentLinkId: string, checkoutUrl: string } =
      await this.payosService.getPaymentLinkUrl(code, totalAfterDiscount, `${created.Code}`);

    await this.prisma.gIAODICH.create({
      data: {
        MaHoaDon: created.MaHoaDon,
        PhuongThuc: TransactionEnum.TRUCTUYEN,
        TongTien: totalAfterDiscount.toString(),
        NgayGiaoDich: new Date(),
        LoaiGiaoDich: TransactionTypeEnum.MUAVE,
        Code: code.toString(),
        LinkId: paymentData.paymentLinkId,
        GiaoDichUrl: paymentData.checkoutUrl,
      }
    });

    return this.getInvoiceById(created.MaHoaDon);

    async function getVoucherPrice() {
      const voucherPrices: { id: string; price: number }[] = [];
      if (MaVouchers && MaVouchers.length > 0) {
        const vouchers = await prisma.kHUYENMAI_KHACHHANG.findMany({
          where: {
            MaKhuyenMaiKH: { in: MaVouchers },
            DeletedAt: null
          },
          include: {
            KhuyenMai: true
          }
        });

        if (vouchers.length !== MaVouchers.length) {
          throw new NotFoundException('Một hoặc vài voucher không tồn tại');
        }

        const seatSubtotal = seatPrices.reduce((s, x) => s + x.price, 0);
        const comboSubtotal = comboPrices.reduce((s, x) => s + x.price, 0);

        for (const v of vouchers) {
          const now = new Date();
          const promo = v.KhuyenMai;
          const valid = v.DaSuDung === false &&
            promo.TrangThai === PromoStatusEnum.CONHOATDONG &&
            now >= promo.NgayBatDau &&
            now <= promo.NgayKetThuc;

          if (!valid) continue;

          const base = promo.DoiTuongApDung === VoucherTargetEnum.VE ? seatSubtotal :
            promo.DoiTuongApDung === VoucherTargetEnum.COMBO ? comboSubtotal : 0;

          if (base < Number(promo.GiaTriDonToiThieu)) continue;

          let applied = 0;
          const value = Number(promo.GiaTri);
          const cap = Number(promo.GiaTriGiamToiDa);

          if (promo.LoaiGiamGia === DiscountTypeEnum.CODINH) {
            applied = value;
          } else if (promo.LoaiGiamGia === DiscountTypeEnum.PHANTRAM) {
            applied = Math.floor((base * value) / 100);
          }

          if (applied <= 0) continue;
          if (cap > 0) applied = Math.min(applied, cap);
          voucherPrices.push({ id: v.MaKhuyenMaiKH, price: applied });
          discountTotal += applied;
        }
      }
      return voucherPrices;
    }

    async function getComboPrice() {
      const combos = (Combos && Combos.length > 0)
        ? await prisma.cOMBO.findMany({
          where: { MaCombo: { in: Combos.map(c => c.MaCombo) }, DeletedAt: null }
        })
        : [];

      if (Combos && Combos.length !== combos.length) {
        throw new NotFoundException('Một hoặc vài combo không tồn tại');
      }

      const comboPrices = (Combos && Combos.length > 0) ? (() => {
        const comboPrices = combos.map(c => {
          const price = Number(c.GiaTien) * (Combos.find(x => x.MaCombo === c.MaCombo)?.SoLuong || 1);
          total += price;
          return { id: c.MaCombo, price };
        });
        return comboPrices;
      })() : [];
      return comboPrices;
    }

    async function getSeatPrice() {
      const gheSuatChieus = await prisma.gHE_SUATCHIEU.findMany({
        where: {
          MaGheSuatChieu: { in: MaGheSuatChieus },
          DeletedAt: null,
        },
        include: {
          GhePhongChieu: {
            include: {
              GheLoaiGhe: {
                include: { Ghe: true, LoaiGhe: true }
              }
            }
          },
          SuatChieu: {
            include: {
              PhienBanPhim: true
            }
          }
        }
      });

      if (gheSuatChieus.length !== MaGheSuatChieus.length) {
        throw new NotFoundException('Một hoặc vài ghế không tồn tại');
      }

      const notAvailable = gheSuatChieus.find(g => g.TrangThai !== SeatStatusEnum.CONTRONG);
      if (notAvailable) {
        throw new BadRequestException(`Không thể đặt ghế ${notAvailable.GhePhongChieu.GheLoaiGhe.Ghe.Hang}${notAvailable.GhePhongChieu.GheLoaiGhe.Ghe.Cot}`);
      }

      const seatPrices = gheSuatChieus.map(g => {
        const base = Number((g.SuatChieu as any).PhienBanPhim.GiaVe);
        const heSo = Number((g.GhePhongChieu as any).GheLoaiGhe.LoaiGhe.HeSoGiaGhe);
        const price = base * heSo;
        total += price;
        return { id: g.MaGheSuatChieu, price };
      });
      return seatPrices;
    }
  }
  async updateTransactionStatus(webhookBody: any) {
    const data = this.payosService.verifyPaymentWebhookData(webhookBody);

    if (data.code === '00') {
      const linkId = data.paymentLinkId;

      const transaction = await this.prisma.gIAODICH.findFirst({
        where: {
          LinkId: linkId,
          DeletedAt: null
        }
      });

      if (!transaction) {
        throw new NotFoundException('Giao dịch không tồn tại');
      }

      if (transaction.TrangThai !== TransactionStatusEnum.THANHCONG) {
        await this.prisma.gIAODICH.update({
          where: { MaGiaoDich: transaction.MaGiaoDich },
          data: {
            TrangThai: TransactionStatusEnum.THANHCONG,
            UpdatedAt: new Date()
          }
        });
      }
    }

    return { success: true };
  }

}