import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ShowtimeStatusEnum } from 'src/libs/common/enums/showtime-status.enum';
import {
  TicketStatusEnum,
  RefundRequestStatusEnum,
} from 'src/libs/common/enums';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import formatCurrency from 'src/libs/common/helpers/format-vn-currency';
import { GetAllShowtimeDto } from './dtos/get-showtime.dto';
import { GetShowtimeByMovieDto } from './dtos/get-showtime-by-movie.dto';
import { CreateShowtimeDto } from './dtos/create-showtime.dto';
import { UpdateShowtimeDto } from './dtos/update-showtime.dto';
import { CursorUtils } from 'src/libs/common/utils/pagination.util';

@Injectable()
export class ShowtimeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  private applyShowtimeFilters(
    filters: GetAllShowtimeDto,
    whereConditions: any,
  ) {
    if (filters.MaPhim) {
      whereConditions.PhienBanPhim = {
        MaPhim: filters.MaPhim,
        DeletedAt: null,
      };
    }

    if (filters.MaPhongChieu) {
      whereConditions.MaPhongChieu = filters.MaPhongChieu;
    }

    if (filters.MaPhienBanPhim) {
      whereConditions.MaPhienBanPhim = filters.MaPhienBanPhim;
    }

    if (filters.MaDinhDang) {
      whereConditions.PhienBanPhim = {
        ...whereConditions.PhienBanPhim,
        MaDinhDang: filters.MaDinhDang,
        DeletedAt: null,
      };
    }

    if (filters.MaTheLoai) {
      whereConditions.PhienBanPhim = {
        ...whereConditions.PhienBanPhim,
        Phim: {
          PhimTheLoais: {
            some: {
              MaTheLoai: filters.MaTheLoai,
              DeletedAt: null,
            },
          },
          DeletedAt: null,
        },
        DeletedAt: null,
      };
    }

    if (filters.TrangThai) {
      whereConditions.TrangThai = filters.TrangThai;
    }

    if (filters.TuNgay) {
      whereConditions.ThoiGianBatDau = {
        ...whereConditions.ThoiGianBatDau,
        gte: new Date(filters.TuNgay),
      };
    }

    if (filters.DenNgay) {
      whereConditions.ThoiGianBatDau = {
        ...whereConditions.ThoiGianBatDau,
        lte: new Date(
          new Date(filters.DenNgay).getTime() + 24 * 60 * 60 * 1000,
        ),
      };
    }
  }

  async getShowtimesByMovieId(movieId: string, filters: GetShowtimeByMovieDto) {
    const { TrangThai, NgayChieu } = filters;

    const film = await this.prisma.pHIM.findUnique({
      where: {
        MaPhim: movieId,
        DeletedAt: null,
      },
    });

    if (!film) {
      throw new NotFoundException('Phim không tồn tại');
    }

    const dateFilter = filterDate(NgayChieu);

    const showtimes = await this.prisma.sUATCHIEU.findMany({
      where: {
        PhienBanPhim: { MaPhim: movieId },
        DeletedAt: null,
        ...(TrangThai && { TrangThai: { in: TrangThai } }),
        ...dateFilter,
      },
      orderBy: { ThoiGianBatDau: 'asc' },
      select: {
        MaSuatChieu: true,
        ThoiGianBatDau: true,
        ThoiGianKetThuc: true,
        TrangThai: true,
        PhongChieu: {
          select: {
            MaPhongChieu: true,
            TenPhongChieu: true,
          },
        },
        PhienBanPhim: {
          select: {
            MaPhienBanPhim: true,
            DinhDang: {
              select: {
                TenDinhDang: true,
              },
            },
            NgonNgu: {
              select: {
                TenNgonNgu: true,
              },
            },
          },
        },
      },
    });

    const groupByDate: Map<number, Map<string, any>> = new Map();

    for (const s of showtimes) {
      const dateKeyObj = new Date(s.ThoiGianBatDau);
      dateKeyObj.setHours(0, 0, 0, 0);
      const dateKey = dateKeyObj.getTime();

      if (!groupByDate.has(dateKey)) {
        groupByDate.set(dateKey, new Map());
      }
      const pbpMap = groupByDate.get(dateKey)!;

      const pbpId = s.PhienBanPhim?.MaPhienBanPhim;
      if (!pbpMap.has(pbpId)) {
        pbpMap.set(pbpId, {
          MaPhienBanPhim: pbpId,
          DinhDang: s.PhienBanPhim?.DinhDang,
          NgonNgu: s.PhienBanPhim?.NgonNgu,
          PhongChieus: new Map(),
        });
      }
      const phien = pbpMap.get(pbpId)!;

      const phongId = s.PhongChieu?.MaPhongChieu;
      if (!phien.PhongChieus.has(phongId)) {
        phien.PhongChieus.set(phongId, {
          MaPhongChieu: phongId,
          TenPhongChieu: s.PhongChieu?.TenPhongChieu,
          SuatChieus: [],
        });
      }
      const phong = phien.PhongChieus.get(phongId)!;

      phong.SuatChieus.push({
        MaSuatChieu: s.MaSuatChieu,
        ThoiGianBatDau: s.ThoiGianBatDau,
        ThoiGianKetThuc: s.ThoiGianKetThuc,
        TrangThai: s.TrangThai,
      });
    }

    const showtimeAfterGroup = Array.from(groupByDate.entries()).map(
      ([dateMs, pbpMap]) => {
        const NgayChieu = new Date(Number(dateMs));
        const PhienBanPhim = Array.from(pbpMap.values()).map((phien: any) => ({
          MaPhienBanPhim: phien.MaPhienBanPhim,
          DinhDang: phien.DinhDang,
          NgonNgu: phien.NgonNgu,
          PhongChieu: Array.from(phien.PhongChieus.values()),
        }));
        return { NgayChieu, PhienBanPhim };
      },
    );

    return {
      Phim: film,
      SuatChieuTheoNgay: showtimeAfterGroup,
    };

    function filterDate(date: string | undefined) {
      let dateFilter = {};

      if (date) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);

        dateFilter = {
          ThoiGianBatDau: {
            gte: startDate,
            lt: endDate,
          },
        };
      }
      return dateFilter;
    }
  }

  async getAllShowtimes(filters: GetAllShowtimeDto) {
    const whereConditions: any = { DeletedAt: null };

    this.applyShowtimeFilters(filters, whereConditions);

    const [data, pagination] = await this.prisma.xprisma.sUATCHIEU
      .paginate({
        where: whereConditions,
        orderBy: [{ ThoiGianBatDau: 'asc' }, { MaSuatChieu: 'asc' }],
        include: {
          PhienBanPhim: {
            include: {
              Phim: {
                include: {
                  NhanPhim: true,
                  PhimTheLoais: {
                    include: {
                      TheLoai: true,
                    },
                  },
                },
              },
              DinhDang: true,
              NgonNgu: true,
            },
          },
        },
      })
      .withCursor(CursorUtils.getPrismaOptions(filters ?? {}, 'MaSuatChieu'));

    return { data, pagination };
  }

  async getShowtimeById(id: string) {
    const showtime = await this.prisma.sUATCHIEU.findUnique({
      where: { MaSuatChieu: id },
      include: {
        PhienBanPhim: {
          include: {
            Phim: {
              include: {
                NhanPhim: true,
                PhimTheLoais: {
                  include: {
                    TheLoai: true,
                  },
                },
              },
            },
            DinhDang: true,
            NgonNgu: true,
          },
        },
        PhongChieu: true,
        GheSuatChieus: {
          where: { DeletedAt: null },
          include: {
            GhePhongChieu: {
              include: {
                GheLoaiGhe: {
                  include: {
                    Ghe: true,
                    LoaiGhe: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!showtime || showtime.DeletedAt) {
      throw new NotFoundException('Suất chiếu không tồn tại');
    }

    return showtime;
  }

  async createShowtime(payload: CreateShowtimeDto) {
    return await this.prisma.$transaction(async (tx) => {
      const phienBan = await tx.pHIENBANPHIM.findFirst({
        where: {
          MaPhienBanPhim: payload.MaPhienBanPhim,
          DeletedAt: null,
        },
      });

      if (!phienBan) {
        throw new NotFoundException('Phiên bản phim không tồn tại');
      }

      const phong = await tx.pHONGCHIEU.findFirst({
        where: {
          MaPhongChieu: payload.MaPhongChieu,
          DeletedAt: null,
        },
      });

      if (!phong) {
        throw new NotFoundException('Phòng chiếu không tồn tại');
      }

      const showtime = await tx.sUATCHIEU.create({
        data: {
          MaPhienBanPhim: payload.MaPhienBanPhim,
          MaPhongChieu: payload.MaPhongChieu,
          ThoiGianBatDau: new Date(payload.ThoiGianBatDau),
          ThoiGianKetThuc: new Date(payload.ThoiGianKetThuc),
        },
      });

      const ghePhongChieus = await tx.gHE_PHONGCHIEU.findMany({
        where: {
          MaPhongChieu: payload.MaPhongChieu,
          DeletedAt: null,
        },
        select: {
          MaGhePhongChieu: true,
        },
      });

      if (ghePhongChieus.length === 0) {
        throw new Error('Phòng chiếu chưa được cấu hình ghế');
      }

      await tx.gHE_SUATCHIEU.createMany({
        data: ghePhongChieus.map((ghe) => ({
          MaSuatChieu: showtime.MaSuatChieu,
          MaGhePhongChieu: ghe.MaGhePhongChieu,
        })),
      });

      return {
        message: 'Tạo suất chiếu thành công',
        MaSuatChieu: showtime.MaSuatChieu,
        SoLuongGhe: ghePhongChieus.length,
      };
    });
  }

  async updateShowtime(id: string, updateDto: UpdateShowtimeDto) {
    return await this.prisma.$transaction(async (tx) => {
      const showtime = await tx.sUATCHIEU.findFirst({
        where: { MaSuatChieu: id, DeletedAt: null },
      });

      if (!showtime) {
        throw new NotFoundException(`Suất chiếu với ID ${id} không tồn tại`);
      }

      const updateData: any = {
        UpdatedAt: new Date(),
      };

      if (updateDto.MaPhienBanPhim !== undefined) {
        updateData.MaPhienBanPhim = updateDto.MaPhienBanPhim;
      }

      if (updateDto.ThoiGianBatDau !== undefined) {
        updateData.ThoiGianBatDau = new Date(updateDto.ThoiGianBatDau);
      }

      if (updateDto.ThoiGianKetThuc !== undefined) {
        updateData.ThoiGianKetThuc = new Date(updateDto.ThoiGianKetThuc);
      }

      if (updateDto.TrangThai !== undefined) {
        updateData.TrangThai = updateDto.TrangThai;
      }

      if (
        updateDto.MaPhongChieu !== undefined &&
        updateDto.MaPhongChieu !== showtime.MaPhongChieu
      ) {
        const phongMoi = await tx.pHONGCHIEU.findFirst({
          where: {
            MaPhongChieu: updateDto.MaPhongChieu,
            DeletedAt: null,
          },
        });

        if (!phongMoi) {
          throw new NotFoundException('Phòng chiếu mới không tồn tại');
        }

        await tx.gHE_SUATCHIEU.updateMany({
          where: {
            MaSuatChieu: id,
            DeletedAt: null,
          },
          data: {
            DeletedAt: new Date(),
          },
        });

        const ghePhongChieus = await tx.gHE_PHONGCHIEU.findMany({
          where: {
            MaPhongChieu: updateDto.MaPhongChieu,
            DeletedAt: null,
          },
          select: {
            MaGhePhongChieu: true,
          },
        });

        if (ghePhongChieus.length === 0) {
          throw new Error('Phòng chiếu mới chưa được cấu hình ghế');
        }

        await tx.gHE_SUATCHIEU.createMany({
          data: ghePhongChieus.map((ghe) => ({
            MaSuatChieu: id,
            MaGhePhongChieu: ghe.MaGhePhongChieu,
            TrangThai: 'CONTRONG',
          })),
        });

        updateData.MaPhongChieu = updateDto.MaPhongChieu;
      }

      const updated = await tx.sUATCHIEU.update({
        where: { MaSuatChieu: id },
        data: updateData,
      });

      return {
        message: 'Cập nhật suất chiếu thành công',
        showtime: updated,
      };
    });
  }

  async removeShowtime(id: string) {
    const showtime = await this.prisma.sUATCHIEU.findFirst({
      where: { MaSuatChieu: id, DeletedAt: null },
    });

    if (!showtime) {
      throw new NotFoundException(`Suất chiếu với ID ${id} không tồn tại`);
    }

    await this.prisma.sUATCHIEU.update({
      where: { MaSuatChieu: id },
      data: {
        DeletedAt: new Date(),
      },
    });

    return { message: 'Xóa suất chiếu thành công' };
  }

  async cancelShowtime(id: string, LyDoHuy?: string) {
    const showtime = await this.prisma.sUATCHIEU.findFirst({
      where: { MaSuatChieu: id, DeletedAt: null },
      include: {
        PhienBanPhim: {
          include: {
            Phim: true,
          },
        },
        PhongChieu: true,
        GheSuatChieus: {
          include: {
            GhePhongChieu: {
              include: {
                GheLoaiGhe: {
                  include: {
                    Ghe: true,
                  },
                },
              },
            },
            Ves: {
              include: {
                HoaDon: {
                  include: {
                    Ves: {
                      include: {
                        GheSuatChieu: {
                          include: {
                            GhePhongChieu: {
                              include: {
                                GheLoaiGhe: {
                                  include: {
                                    Ghe: true,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    HoaDonCombos: {
                      include: {
                        Combo: true,
                      },
                    },
                    HoaDonKhuyenMais: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!showtime) {
      throw new NotFoundException(`Suất chiếu với ID ${id} không tồn tại`);
    }

    if (showtime.TrangThai === ShowtimeStatusEnum.DAHUY) {
      throw new BadRequestException('Suất chiếu đã bị hủy trước đó');
    }

    if (showtime.TrangThai === ShowtimeStatusEnum.DANGCHIEU) {
      throw new BadRequestException('Không thể hủy suất chiếu đang diễn ra');
    }

    if (showtime.TrangThai === ShowtimeStatusEnum.DACHIEU) {
      throw new BadRequestException('Không thể hủy suất chiếu đã kết thúc');
    }

    const invoiceMap: Record<string, any> = {};
    for (const gs of showtime.GheSuatChieus || []) {
      for (const ve of gs.Ves || []) {
        if (ve && ve.HoaDon && ve.HoaDon.MaHoaDon) {
          invoiceMap[ve.HoaDon.MaHoaDon] = ve.HoaDon;
        }
      }
    }

    const mailsToSend: any[] = [];

    await this.prisma.$transaction(
      async (tx) => {
        await tx.sUATCHIEU.update({
          where: { MaSuatChieu: id },
          data: { TrangThai: ShowtimeStatusEnum.DAHUY, UpdatedAt: new Date() },
        });

        const ticketIds: string[] = [];

        for (const gs of showtime.GheSuatChieus || []) {
          for (const ve of gs.Ves || []) {
            if (
              ve &&
              ve.MaVe &&
              ve.TrangThaiVe !== TicketStatusEnum.DAHOAN &&
              ve.TrangThaiVe !== TicketStatusEnum.CHUAHOANTIEN
            ) {
              ticketIds.push(ve.MaVe);
            }
          }
        }

        if (ticketIds.length) {
          await tx.vE.updateMany({
            where: {
              MaVe: { in: ticketIds },
              DeletedAt: null,
            },
            data: {
              TrangThaiVe: TicketStatusEnum.CHOHOANTIEN,
              UpdatedAt: new Date(),
            },
          });
        }

        const invoiceIds = Object.keys(invoiceMap);
        if (invoiceIds.length) {
          const existingRefunds = await tx.yEUCAUHOANVE.findMany({
            where: { MaHoaDon: { in: invoiceIds }, DeletedAt: null },
            select: { MaHoaDon: true },
          });
          const existingSet = new Set(
            existingRefunds.map((r: any) => r.MaHoaDon),
          );

          for (const invoiceId of invoiceIds) {
            if (existingSet.has(invoiceId)) continue;
            await tx.yEUCAUHOANVE.create({
              data: {
                MaHoaDon: invoiceId,
                TrangThai: RefundRequestStatusEnum.DANGCHO,
                LyDoHoan: 'Suất chiếu bị hủy',
                SoTaiKhoan: '',
                TenChuTaiKhoan: '',
                SoTien: invoiceMap[invoiceId].TongTien || 0,
                CreatedAt: new Date(),
              },
            });
            const inv = invoiceMap[invoiceId];
            mailsToSend.push({ invoiceId, inv });
          }
        }

        return { message: 'Hủy suất chiếu thành công' };
      },
      { timeout: 600000 },
    );

    for (const m of mailsToSend) {
      const invoiceId = m.invoiceId;
      const inv = m.inv;
      try {
        const tickets = (inv.Ves || []).map((ve: any) => {
          const seatGhe = ve.GheSuatChieu?.GhePhongChieu?.GheLoaiGhe?.Ghe;
          const seatCode = seatGhe ? `${seatGhe.Hang}${seatGhe.Cot}` : '??';
          return {
            Code: ve.Code,
            SeatCode: seatCode,
            Price: formatCurrency(Number(ve.GiaVe || 0)),
          };
        });

        const combos = (inv.HoaDonCombos || []).map((c: any) => ({
          Name: c.Combo?.TenCombo || c.TenCombo || 'Combo',
          Quantity: c.SoLuong || 1,
          Price: formatCurrency(Number(c.DonGia || 0)),
          Total: formatCurrency(Number((c.DonGia || 0) * (c.SoLuong || 1))),
        }));

        const refundAmount = formatCurrency(Number(inv.TongTien || 0));
        const discountValue = (inv.HoaDonKhuyenMais || []).reduce(
          (s: number, a: any) => s + Number(a.GiaTriGiam || 0),
          0,
        );
        const discountAmount = discountValue
          ? formatCurrency(discountValue)
          : '';

        this.mailService.sendShowtimeCancellationEmail(inv.Email, {
          BookingCode: inv.Code || invoiceId,
          MovieName: showtime.PhienBanPhim?.Phim?.TenHienThi || '',
          CinemaRoom: showtime.PhongChieu?.TenPhongChieu || '',
          ShowTime: new Date(showtime.ThoiGianBatDau).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
          Tickets: tickets,
          Combos: combos,
          RefundAmount: refundAmount,
          DiscountAmount: discountAmount,
          CancellationReason: LyDoHuy ?? 'Suất chiếu bị hủy',
        });
      } catch {}
    }
  }
}
