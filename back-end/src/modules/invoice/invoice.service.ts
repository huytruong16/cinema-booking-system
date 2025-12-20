import { Injectable, NotFoundException, BadRequestException, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dtos/create-invoice.dto';
import { CursorUtils } from 'src/libs/common/utils/pagination.util';
import { DiscountTypeEnum, PromoStatusEnum, RoleEnum, SeatStatusEnum, TicketStatusEnum, TransactionEnum, TransactionStatusEnum, TransactionTypeEnum } from 'src/libs/common/enums';
import { PayosService } from 'src/libs/common/services/payos.service';
import VoucherTargetEnum from 'src/libs/common/enums/voucher_target.enum';
import { ConfigService } from '@nestjs/config';
import { GetInvoiceDto } from './dtos/get-invoice.dto';
import GetInvoiceResponseDto from './dtos/get-invoice-response.dto';
import { TicketsService } from '../tickets/tickets.service';

@Injectable({ scope: Scope.REQUEST })
export class InvoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payosService: PayosService,
    private readonly configService: ConfigService,
    private readonly ticketsService: TicketsService,
    @Inject(REQUEST) private readonly request: any,
  ) { }

  async getAllInvoices(filters?: GetInvoiceDto) {
    const [data, pagination] = await this.prisma.xprisma.hOADON.paginate({
      where: {
        ...filters?.search ? {
          OR: [
            { Email: { contains: filters.search } },
            { Code: { contains: filters.search } },
          ]
        } : undefined,
        ...filters?.status ? {
          GiaoDichs: {
            some: { TrangThai: filters.status }
          }
        } : undefined,
        ...filters?.date ? {
          NgayLap: {
            gte: new Date(new Date(filters.date).setHours(0, 0, 0, 0)),
            lt: new Date(new Date(filters.date).setHours(23, 59, 59, 0))
          }
        } : undefined,
        DeletedAt: null
      },
      orderBy: [
        { CreatedAt: 'desc' },
        { MaHoaDon: 'desc' }
      ],
      select: {
        MaHoaDon: true,
        Code: true,
        Email: true,
        NgayLap: true,
        TongTien: true,
        GiaoDichs: {
          select: {
            MaGiaoDich: true,
            Code: true,
            TrangThai: true,
            LoaiGiaoDich: true,
            PhuongThuc: true,
            NgayGiaoDich: true,
            NoiDung: true
          }
        },
        HoaDonCombos: {
          select: {
            SoLuong: true,
            DonGia: true,
            Combo: {
              select: {
                TenCombo: true,
              }
            }
          }
        },
        Ves: {
          select: {
            GiaVe: true,
            TrangThaiVe: true,
            GheSuatChieu: {
              select: {
                SuatChieu: {
                  select: {
                    PhienBanPhim: {
                      select: {
                        Phim: {
                          select: {
                            TenHienThi: true,
                            PosterUrl: true,
                          }
                        }
                      }
                    },
                    PhongChieu: {
                      select: {
                        TenPhongChieu: true,
                      }
                    },
                    ThoiGianBatDau: true,
                  }
                },
                GhePhongChieu: {
                  select: {
                    GheLoaiGhe: {
                      select: {
                        Ghe: {
                          select: {
                            Hang: true,
                            Cot: true,
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        HoaDonKhuyenMais: {
          select: {
            GiaTriGiam: true,
            KhuyenMaiKH: {
              select: {
                KhuyenMai: {
                  select: {
                    TenKhuyenMai: true,
                    DoiTuongApDung: true,
                  }
                }
              }
            }
          }
        }
      },
    }).withCursor(CursorUtils.getPrismaOptions(filters ?? {}, 'MaHoaDon'));

    const mappedData: GetInvoiceResponseDto[] = data.map((invoice) => this.mapToInvoiceResponse(invoice));

    return { data: mappedData, pagination };
  }

  async getInvoiceById(id: string) {
    const invoice = await this.prisma.hOADON.findUnique(
      {
        where: { MaHoaDon: id, DeletedAt: null },
        include: {
          GiaoDichs: true,
          HoaDonKhuyenMais: {
            include: {
              KhuyenMaiKH: {
                include: {
                  KhuyenMai: true
                }
              }
            }
          },
          HoaDonCombos: {
            select: {
              SoLuong: true,
              DonGia: true,
              Combo: {
                select: {
                  TenCombo: true,
                }
              },
            }
          },
          Ves: {
            include: {
              GheSuatChieu: {
                include: {
                  SuatChieu: {
                    include: {
                      PhienBanPhim: {
                        include: {
                          Phim: true
                        }
                      },
                      PhongChieu: true
                    }
                  },
                  GhePhongChieu: {
                    include: {
                      GheLoaiGhe: {
                        select: {
                          Ghe: {
                            select: {
                              Hang: true,
                              Cot: true,
                            }
                          }
                        }
                      }
                    }
                  }
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

    return this.mapToInvoiceResponse(invoice);
  }

  private mapToInvoiceResponse(invoice: any): GetInvoiceResponseDto {
    const firstTicket = invoice.Ves[0];
    const showtime = firstTicket?.GheSuatChieu?.SuatChieu;
    const film = showtime?.PhienBanPhim?.Phim;
    const room = showtime?.PhongChieu;
    const transaction = invoice.GiaoDichs?.find((e: any) => e.LoaiGiaoDich === TransactionTypeEnum.MUAVE);

    return {
      MaHoaDon: invoice.MaHoaDon,
      Code: invoice.Code,
      Email: invoice.Email,
      Phim: {
        TenPhim: film?.TenHienThi,
        PosterUrl: film?.PosterUrl,
      },
      ThoiGianChieu: showtime?.ThoiGianBatDau,
      PhongChieu: room?.TenPhongChieu,
      Ves: invoice.Ves.map((v: any) => {
        const ghe = v.GheSuatChieu?.GhePhongChieu?.GheLoaiGhe?.Ghe;
        return {
          SoGhe: ghe ? `${ghe.Hang}${ghe.Cot}` : '',
          TrangThai: v.TrangThaiVe as TicketStatusEnum,
          DonGia: Number(v.GiaVe)
        };
      }),
      Combos: (invoice.HoaDonCombos ?? []).map((hdc: any) => ({
        TenCombo: hdc.Combo?.TenCombo,
        SoLuong: hdc.SoLuong,
        DonGia: Number(hdc.DonGia)
      })),
      KhuyenMais: (invoice.HoaDonKhuyenMais ?? []).map((hdkm: any) => ({
        TenKhuyenMai: hdkm.KhuyenMaiKH?.KhuyenMai?.TenKhuyenMai,
        LoaiKhuyenMai: hdkm.KhuyenMaiKH?.KhuyenMai?.DoiTuongApDung as VoucherTargetEnum,
        SoTienGiam: Number(hdkm.GiaTriGiam)
      })),
      NgayLap: invoice.NgayLap,
      GiaoDich: {
        MaGiaoDich: transaction.MaGiaoDich,
        Code: transaction.Code,
        NgayGiaoDich: transaction.NgayGiaoDich,
        PhuongThuc: transaction.PhuongThuc,
        TrangThai: transaction.TrangThai,
        LoaiGiaoDich: transaction.LoaiGiaoDich,
        NoiDung: transaction.NoiDung
      },
      TongTien: Number(invoice.TongTien)
    };
  }

  async createInvoice(request: CreateInvoiceDto) {
    const { Email, MaGheSuatChieus, Combos, MaVouchers } = request;
    const prisma = this.prisma;
    const userId = this.request?.user?.id

    let user;

    if (userId) {
      user = await prisma.nGUOIDUNGPHANMEM.findUnique({
        where: { MaNguoiDung: userId }
      });
    }

    if ((!user || user.VaiTro !== RoleEnum.KHACHHANG) && !Email) {
      throw new BadRequestException('Email không được để trống');
    }

    if (user && request.LoaiGiaoDich === TransactionEnum.TRUCTIEP && user.VaiTro === RoleEnum.KHACHHANG) {
      throw new BadRequestException('Khách hàng mua vé trực tuyến chỉ được phép giao dịch trực tuyến');
    }

    let customer = await getCustomer();

    await checkSameShowtime();
    await checkAvailableUserVoucher();

    let total = 0;
    let discountTotal = 0;

    const seatPrices: { id: string, price: number }[] = await getSeatPrice();
    const comboPrices: { id: string, price: number }[] = await getComboPrice();
    const voucherPrices: { id: string, price: number }[] = await getVoucherPrice();

    const totalAfterDiscount = Math.max(0, total - discountTotal);

    const genCode = () => Math.floor(1000000000 + Math.random() * 9000000000);
    const emailToUse = Email || user!.Email;

    const transactionCode = genCode();

    const created = await prisma.$transaction(async (tx) => {
      const hoaDon = await tx.hOADON.create({
        data: {
          Email: emailToUse,
          MaKhachHang: (customer) ? customer.MaKhachHang : null,
          Code: genCode().toString(),
          NgayLap: new Date(),
          TongTien: totalAfterDiscount.toString(),
        }
      });

      if (Combos?.length) {
        await tx.hOADONCOMBO.createMany({
          data: comboPrices.map((c) => ({
            MaHoaDon: hoaDon.MaHoaDon,
            MaCombo: c.id,
            SoLuong: Combos.find(x => x.MaCombo === c.id)?.SoLuong || 1,
            DonGia: c.price.toString(),
          })),
        });
      }

      if (seatPrices.length) {
        await tx.vE.createMany({
          data: seatPrices.map((s) => ({
            MaGheSuatChieu: s.id,
            GiaVe: s.price.toString(),
            MaHoaDon: hoaDon.MaHoaDon,
            Code: genCode().toString(),
          })),
        });
      }

      await tx.gHE_SUATCHIEU.updateMany({
        where: {
          MaGheSuatChieu: {
            in: seatPrices.map(s => s.id),
          },
        },
        data: { TrangThai: SeatStatusEnum.DADAT, UpdatedAt: new Date() },
      });

      return hoaDon;
    });

    if (created && voucherPrices.length) {
      await prisma.hOADON_KHUYENMAI.createMany({
        data: voucherPrices.map((v) => ({
          MaHoaDon: created.MaHoaDon,
          MaKhuyenMaiKH: v.id,
          GiaTriGiam: v.price,
        })),
      });

      await prisma.kHUYENMAI_KHACHHANG.updateMany({
        where: {
          MaKhuyenMaiKH: { in: voucherPrices.map(v => v.id) }
        },
        data: {
          DaSuDung: true,
          UpdatedAt: new Date()
        },
      });
    }

    let paymentData: { paymentLinkId: string, checkoutUrl: string, description: string } | undefined;

    if (request.LoaiGiaoDich === TransactionEnum.TRUCTUYEN) {
      paymentData =
        await this.payosService.getPaymentLinkUrl(transactionCode, totalAfterDiscount, `${created.Code}`);
    }

    let transaction;

    if (paymentData) {
      transaction = await this.prisma.gIAODICH.create({
        data: {
          MaHoaDon: created.MaHoaDon,
          PhuongThuc: request.LoaiGiaoDich,
          TongTien: totalAfterDiscount.toString(),
          NgayGiaoDich: new Date(),
          LoaiGiaoDich: TransactionTypeEnum.MUAVE,
          Code: transactionCode.toString(),
          LinkId: paymentData ? paymentData.paymentLinkId : '',
          GiaoDichUrl: paymentData ? paymentData.checkoutUrl : '',
          MaNhanVien: (user && user.VaiTro === RoleEnum.NHANVIEN) ? user.MaNguoiDung : null,
          NoiDung: paymentData ? paymentData.description : null
        }
      });
    } else {
      throw new BadRequestException('Không tạo được giao dịch thanh toán, vui lòng thử lại sau');
    }

    return {
      "MaGiaoDich": transaction.MaGiaoDich,
      "GiaoDichUrl": paymentData?.checkoutUrl
    };

    async function checkAvailableUserVoucher() {
      if (MaVouchers && MaVouchers.length > 0) {
        if (!customer) {
          throw new BadRequestException('Chỉ khách hàng mới có thể sử dụng voucher');
        }
        const customerVouchers = await prisma.kHUYENMAI_KHACHHANG.findMany({
          where: {
            MaKhuyenMaiKH: { in: MaVouchers },
            MaKhachHang: customer.MaKhachHang,
            DaSuDung: false,
            DeletedAt: null
          }
        });

        if (MaVouchers.length !== customerVouchers.length) {
          throw new NotFoundException('Một hoặc vài voucher không tồn tại cho khách hàng này');
        }
      }
    }

    async function checkSameShowtime() {
      const seats = await prisma.gHE_SUATCHIEU.findMany({
        where: {
          MaGheSuatChieu: { in: MaGheSuatChieus },
          DeletedAt: null,
        }
      });

      const isSameShowtime: boolean = seats.every(seat => seat.MaSuatChieu === seats[0].MaSuatChieu);
      if (!isSameShowtime) {
        throw new BadRequestException('Các ghế phải thuộc cùng một suất chiếu');
      }
    }

    async function getCustomer() {
      let customer;
      switch (user?.VaiTro) {
        case RoleEnum.KHACHHANG:
          customer = await prisma.kHACHHANG.findFirst({
            where: { MaNguoiDung: user.MaNguoiDung }
          });
          break;
        case RoleEnum.NHANVIEN:
          const tmpUser = await prisma.nGUOIDUNGPHANMEM.findFirst({
            where: { Email: Email }
          });
          if (tmpUser && tmpUser.VaiTro === RoleEnum.KHACHHANG) {
            customer = await prisma.kHACHHANG.findFirst({
              where: { MaNguoiDung: tmpUser.MaNguoiDung }
            });
          }
          break;
      }
      return customer;
    }

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

        if (vouchers.some(v => v.KhuyenMai.TrangThai === PromoStatusEnum.KHONGCONHOATDONG || v.KhuyenMai.DeletedAt != null || new Date() < v.KhuyenMai.NgayBatDau || new Date() > v.KhuyenMai.NgayKetThuc)) {
          throw new NotFoundException('Một hoặc vài voucher không hoạt động');
        }

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
          const price = Number(c.GiaTien);
          total += price * (Combos.find(x => x.MaCombo === c.MaCombo)?.SoLuong || 1);
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

  async checkIn(code: string) {
    const invoice = await this.prisma.hOADON.findFirst({
      where: {
        Code: code,
      },
      include: {
        Ves: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Hóa đơn không tồn tại');
    }

    let ticketCodeAvailableList: string[] = [];
    for (const ticket of invoice.Ves) {
      if (ticket.TrangThaiVe === TicketStatusEnum.CHUASUDUNG) {
        ticketCodeAvailableList.push(ticket.Code);
      }
    }

    return await this.ticketsService.generateTicketsPdf(ticketCodeAvailableList);
  }
}