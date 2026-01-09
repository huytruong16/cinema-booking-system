import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomStatusDto } from './dtos/room-status.dto';
import {
  ScreeningRoomStatusEnum,
  SeatStatusEnum,
  StaffStatusEnum,
  TicketStatusEnum,
  TransactionStatusEnum,
  TransactionTypeEnum,
} from 'src/libs/common/enums';
import { SummaryDto } from './dtos/summary.dto';
import {
  GetSummaryQueryDto,
  SummaryRangeEnum,
} from './dtos/get-summary-query.dto';
import {
  GetRevenueChartQueryDto,
  RevenueChartRangeEnum,
} from './dtos/get-revenue-chart-query.dto';
import { RevenueChartDto } from './dtos/revenue-chart.dto';
import VoucherTargetEnum from 'src/libs/common/enums/voucher_target.enum';
import {
  GetTopMovieDto,
  TopMovieRangeEnum,
} from './dtos/get-top-movie.dto-query';
import { TopMovieDto } from './dtos/top-movie.dto';
import {
  GetTopStaffQueryDto,
  TopStaffRangeEnum,
} from './dtos/get-top-staff-query.dto';
import { TopStaffDto } from './dtos/top-staff.dto';
import { Workbook } from 'exceljs';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) { }

  async getRoomStatus(): Promise<RoomStatusDto[]> {
    const now = new Date();

    const rooms = await this.prisma.pHONGCHIEU.findMany({
      where: { DeletedAt: null },
      include: {
        SuatChieus: {
          where: { DeletedAt: null },
          include: {
            GheSuatChieus: {
              where: { DeletedAt: null },
            },
            PhienBanPhim: {
              include: {
                Phim: true,
              },
            },
          },
          orderBy: {
            ThoiGianBatDau: 'asc',
          },
        },
      },
    });

    const roomStatusList: RoomStatusDto[] = [];

    for (const room of rooms) {
      const currentShowtime = room.SuatChieus.find(
        (sc) =>
          sc.ThoiGianBatDau <= now &&
          now <= sc.ThoiGianKetThuc &&
          sc.DeletedAt === null,
      );

      const nextShowtime = room.SuatChieus.find(
        (sc) => sc.ThoiGianBatDau > now && sc.DeletedAt === null,
      );

      const roomStatusData: RoomStatusDto = {
        PhongChieu: {
          MaPhongChieu: room.MaPhongChieu,
          TenPhongChieu: room.TenPhongChieu,
        },
        TrangThai: ScreeningRoomStatusEnum.TRONG,
      };

      if (currentShowtime) {
        const bookedSeats = currentShowtime.GheSuatChieus.filter(
          (gs) => gs.TrangThai !== SeatStatusEnum.CONTRONG,
        ).length;
        const totalSeatsInShowtime = currentShowtime.GheSuatChieus.length;

        roomStatusData.TrangThai = ScreeningRoomStatusEnum.DANGCHIEU;
        roomStatusData.GheDaDat = bookedSeats;
        roomStatusData.TongGhe = totalSeatsInShowtime;
        roomStatusData.SuatChieuHienTai = {
          MaSuatChieu: currentShowtime.MaSuatChieu,
          MaPhim: currentShowtime.PhienBanPhim?.MaPhim || '',
          TenPhim: currentShowtime.PhienBanPhim?.Phim?.TenHienThi || '',
          ThoiGianBatDau: currentShowtime.ThoiGianBatDau.toISOString(),
          ThoiGianKetThuc: currentShowtime.ThoiGianKetThuc.toISOString(),
        };
      } else if (nextShowtime) {
        const timeDiffMs =
          nextShowtime.ThoiGianBatDau.getTime() - now.getTime();
        const timeDiffMinutes = Math.floor(timeDiffMs / (1000 * 60));

        if (timeDiffMinutes < 30) {
          roomStatusData.TrangThai = ScreeningRoomStatusEnum.SAPCHIEU;
        } else {
          roomStatusData.TrangThai = ScreeningRoomStatusEnum.TRONG;
        }
        const bookedSeats = nextShowtime.GheSuatChieus.filter(
          (gs) => gs.TrangThai !== SeatStatusEnum.CONTRONG,
        ).length;

        roomStatusData.GheDaDat = bookedSeats;
        roomStatusData.TongGhe = nextShowtime.GheSuatChieus.length;
        roomStatusData.SuatChieuTiepTheo = {
          MaSuatChieu: nextShowtime.MaSuatChieu,
          MaPhim: nextShowtime.PhienBanPhim?.MaPhim || '',
          TenPhim: nextShowtime.PhienBanPhim?.Phim?.TenHienThi || '',
          ThoiGianBatDau: nextShowtime.ThoiGianBatDau.toISOString(),
          ThoiGianKetThuc: nextShowtime.ThoiGianKetThuc.toISOString(),
          SoPhutConLai: timeDiffMinutes,
        };
      }

      roomStatusList.push(roomStatusData);
    }

    return roomStatusList;
  }

  async getSummary(filter: GetSummaryQueryDto): Promise<SummaryDto> {
    const targetDate = filter.date ? new Date(filter.date) : new Date();
    await this.generateDailyRevenueReport(targetDate.toISOString());

    const y = targetDate.getFullYear();
    const m = targetDate.getMonth();
    const d = targetDate.getDate();

    let start: Date;
    let end: Date;
    let prevStart: Date;
    let prevEnd: Date;

    switch (filter.range) {
      case SummaryRangeEnum.DAY: {
        start = new Date(y, m, d, 0, 0, 0, 0);
        end = new Date(y, m, d + 1, 0, 0, 0, 0);
        prevStart = new Date(y, m, d - 1, 0, 0, 0, 0);
        prevEnd = new Date(y, m, d, 0, 0, 0, 0);
        break;
      }
      case SummaryRangeEnum.WEEK: {
        const dayOfWeek = targetDate.getDay();
        const offsetToMonday = (dayOfWeek + 6) % 7;
        const monday = new Date(y, m, d - offsetToMonday, 0, 0, 0, 0);
        start = monday;
        end = new Date(monday.getTime());
        end.setDate(monday.getDate() + 7);
        prevStart = new Date(monday.getTime());
        prevStart.setDate(monday.getDate() - 7);
        prevEnd = monday;
        break;
      }
      case SummaryRangeEnum.YEAR: {
        start = new Date(y, 0, 1, 0, 0, 0, 0);
        end = new Date(y + 1, 0, 1, 0, 0, 0, 0);
        prevStart = new Date(y - 1, 0, 1, 0, 0, 0, 0);
        prevEnd = new Date(y, 0, 1, 0, 0, 0, 0);
        break;
      }
      case SummaryRangeEnum.MONTH: {
        start = new Date(y, m, 1, 0, 0, 0, 0);
        end = new Date(y, m + 1, 1, 0, 0, 0, 0);
        prevStart = new Date(y, m - 1, 1, 0, 0, 0, 0);
        prevEnd = new Date(y, m, 1, 0, 0, 0, 0);
        break;
      }
    }

    const reports = await this.prisma.bAOCAODOANHTHU.findMany({
      where: { DeletedAt: null, Ngay: { gte: start, lt: end } },
    });
    const revenue = reports.reduce(
      (sum, r) => sum + Number(r.DoanhThuVe || 0),
      0,
    );
    const comboRevenue = reports.reduce(
      (sum, r) => sum + Number(r.DoanhThuCombo || 0),
      0,
    );

    const prevReports = await this.prisma.bAOCAODOANHTHU.findMany({
      where: { DeletedAt: null, Ngay: { gte: prevStart, lt: prevEnd } },
    });
    const prevRevenue = prevReports.reduce(
      (sum, r) => sum + Number(r.DoanhThuVe || 0),
      0,
    );

    const ticketsSold = await this.prisma.vE.count({
      where: {
        DeletedAt: null,
        TrangThaiVe: {
          in: [TicketStatusEnum.CHUASUDUNG, TicketStatusEnum.DASUDUNG],
        },
        HoaDon: {
          DeletedAt: null,
          NgayLap: { gte: start, lt: end },
        },
      },
    });

    const prevTicketsSold = await this.prisma.vE.count({
      where: {
        DeletedAt: null,
        TrangThaiVe: {
          in: [TicketStatusEnum.CHUASUDUNG, TicketStatusEnum.DASUDUNG],
        },
        HoaDon: {
          DeletedAt: null,
          NgayLap: { gte: prevStart, lt: prevEnd },
        },
      },
    });

    const showtimes = await this.prisma.sUATCHIEU.findMany({
      where: {
        DeletedAt: null,
        ThoiGianBatDau: { gte: start, lt: end },
      },
      include: {
        GheSuatChieus: {
          where: { DeletedAt: null },
        },
      },
    });

    let totalSeats = 0;
    let bookedSeats = 0;
    for (const st of showtimes) {
      totalSeats += st.GheSuatChieus.length;
      bookedSeats += st.GheSuatChieus.filter(
        (gs) => gs.TrangThai === SeatStatusEnum.DADAT,
      ).length;
    }
    const occupancyRate =
      totalSeats === 0
        ? 0
        : Number(((bookedSeats / totalSeats) * 100).toFixed(1));

    const revenueChangePercent =
      prevRevenue > 0
        ? Number((((revenue - prevRevenue) / prevRevenue) * 100).toFixed(1))
        : 0;
    const ticketsDiff = ticketsSold - prevTicketsSold;

    return {
      LoaiThongKe: filter.range,
      NgayBatDau: start.toISOString(),
      NgayKetThuc: end.toISOString(),
      TongDoanhThu: revenue + comboRevenue,
      DoanhThuVe: revenue,
      SoVeDaBan: ticketsSold,
      TiLeLapDay: occupancyRate,
      DoanhThuCombo: comboRevenue,
      SoSanh: {
        DoanhThuVe: revenueChangePercent,
        SoVeDaBan: ticketsDiff,
      },
    };
  }

  async getRevenueChart(
    filter: GetRevenueChartQueryDto,
  ): Promise<RevenueChartDto[]> {
    const baseDate = filter.date ? new Date(filter.date) : new Date();
    const y = baseDate.getFullYear();
    const m = baseDate.getMonth();
    const d = baseDate.getDate();
    await this.generateDailyRevenueReport(baseDate.toISOString());

    let start: Date;
    let end: Date;

    switch (filter.range) {
      case RevenueChartRangeEnum.WEEK: {
        const dayOfWeek = baseDate.getDay();
        const offsetToMonday = (dayOfWeek + 6) % 7;
        const monday = new Date(y, m, d - offsetToMonday, 0, 0, 0, 0);
        start = monday;
        end = new Date(monday.getTime());
        end.setDate(monday.getDate() + 7);
        break;
      }
      case RevenueChartRangeEnum.MONTH: {
        start = new Date(y, m, 1, 0, 0, 0, 0);
        end = new Date(y, m + 1, 1, 0, 0, 0, 0);
        break;
      }
      case RevenueChartRangeEnum.YEAR: {
        start = new Date(y, 0, 1, 0, 0, 0, 0);
        end = new Date(y + 1, 0, 1, 0, 0, 0, 0);
        break;
      }
    }

    const reports = await this.prisma.bAOCAODOANHTHU.findMany({
      where: { DeletedAt: null, Ngay: { gte: start, lt: end } },
      orderBy: { Ngay: 'asc' },
    });

    const reportMap: Record<
      string,
      { ticketRevenue: number; comboRevenue: number }
    > = {};
    for (const r of reports) {
      const key = r.Ngay.toISOString().split('T')[0];
      reportMap[key] = {
        ticketRevenue: Number(r.DoanhThuVe || 0),
        comboRevenue: Number(r.DoanhThuCombo || 0),
      };
    }

    const res: RevenueChartDto[] = [];
    for (
      let ts = start.getTime();
      ts < end.getTime();
      ts += 24 * 60 * 60 * 1000
    ) {
      const base = new Date(ts);
      const key = base.toISOString().split('T')[0];
      const label = `${base.getDate().toString().padStart(2, '0')}/${(base.getMonth() + 1).toString().padStart(2, '0')}`;
      const data = reportMap[key] || { ticketRevenue: 0, comboRevenue: 0 };
      res.push({
        Ngay: label,
        DoanhThuVe: data.ticketRevenue,
        DoanhThuCombo: data.comboRevenue,
      });
    }

    return res;
  }

  async getTopMovies(query: GetTopMovieDto): Promise<TopMovieDto[]> {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();

    let start: Date | undefined;
    let end: Date | undefined;

    switch (query.range) {
      case TopMovieRangeEnum.DAY: {
        start = new Date(y, m, d, 0, 0, 0, 0);
        end = new Date(y, m, d + 1, 0, 0, 0, 0);
        break;
      }
      case TopMovieRangeEnum.WEEK: {
        const dayOfWeek = now.getDay();
        const offsetToMonday = (dayOfWeek + 6) % 7;
        const monday = new Date(y, m, d - offsetToMonday, 0, 0, 0, 0);
        start = monday;
        end = new Date(monday.getTime());
        end.setDate(monday.getDate() + 7);
        break;
      }
      case TopMovieRangeEnum.MONTH:
        start = new Date(y, m, 1, 0, 0, 0, 0);
        end = new Date(y, m + 1, 1, 0, 0, 0, 0);
        break;
      case TopMovieRangeEnum.YEAR:
        start = new Date(y, 0, 1, 0, 0, 0, 0);
        end = new Date(y + 1, 0, 1, 0, 0, 0, 0);
        break;
      case TopMovieRangeEnum.ALL:
        start = undefined;
        end = undefined;
        break;
    }

    const whereClause: any = {
      DeletedAt: null,
      TrangThaiVe: { not: TicketStatusEnum.DAHOAN },
      HoaDon: {},
    };
    if (start && end) {
      whereClause.HoaDon.NgayLap = { gte: start, lt: end };
    }

    const tickets = await this.prisma.vE.findMany({
      where: whereClause,
      select: {
        GiaVe: true,
        GheSuatChieu: {
          select: {
            SuatChieu: {
              select: {
                PhienBanPhim: {
                  select: {
                    Phim: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const agg: Record<string, { revenue: number; ticketsSold: number }> = {};
    for (const t of tickets) {
      const pbp = t.GheSuatChieu?.SuatChieu?.PhienBanPhim;
      const maPhim = pbp?.Phim?.MaPhim;
      if (!maPhim) continue;

      if (!agg[maPhim]) agg[maPhim] = { revenue: 0, ticketsSold: 0 };
      agg[maPhim].revenue += Number(t.GiaVe || 0);
      agg[maPhim].ticketsSold += 1;
    }

    const capped = Math.max(
      1,
      Math.min(
        50,
        Number.isFinite(Number(query.limit)) ? Number(query.limit) : 5,
      ),
    );

    const ranked = Object.entries(agg)
      .map(([id, v]) => ({
        id,
        revenue: v.revenue,
        ticketsSold: v.ticketsSold,
      }))
      .sort((a, b) => b.revenue - a.revenue || b.ticketsSold - a.ticketsSold)
      .slice(0, capped);

    const movieIds = ranked.map((r) => r.id);
    const movies = movieIds.length
      ? await this.prisma.pHIM.findMany({
        where: { MaPhim: { in: movieIds }, DeletedAt: null },
      })
      : [];

    const movieMap: Record<string, any> = {};
    for (const m of movies) movieMap[m.MaPhim] = m;

    return ranked.map((r) => ({
      Phim: movieMap[r.id] ?? null,
      DoanhThu: r.revenue,
      SoVeDaBan: r.ticketsSold,
    }));
  }

  async getTopStaff(query: GetTopStaffQueryDto): Promise<TopStaffDto[]> {
    const now = query.date ? new Date(query.date) : new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();

    let start: Date;
    let end: Date;

    switch (query.range) {
      case TopStaffRangeEnum.WEEK: {
        const dayOfWeek = now.getDay();
        const offsetToMonday = (dayOfWeek + 6) % 7;
        const monday = new Date(y, m, d - offsetToMonday, 0, 0, 0, 0);
        start = monday;
        end = new Date(monday.getTime());
        end.setDate(monday.getDate() + 7);
        break;
      }
      case TopStaffRangeEnum.MONTH:
        start = new Date(y, m, 1, 0, 0, 0, 0);
        end = new Date(y, m + 1, 1, 0, 0, 0, 0);
        break;
      case TopStaffRangeEnum.DAY:
        start = new Date(y, m, d, 0, 0, 0, 0);
        end = new Date(y, m, d + 1, 0, 0, 0, 0);
        break;
      case TopStaffRangeEnum.YEAR:
        start = new Date(y, 0, 1, 0, 0, 0, 0);
        end = new Date(y + 1, 0, 1, 0, 0, 0, 0);
        break;
    }

    const transactions = await this.prisma.gIAODICH.findMany({
      where: {
        DeletedAt: null,
        TrangThai: TransactionStatusEnum.THANHCONG,
        LoaiGiaoDich: TransactionTypeEnum.MUAVE,
        MaNhanVien: { not: null },
        NgayGiaoDich: { gte: start, lt: end },
      },
      include: {
        NhanVien: {
          include: {
            NguoiDungPhanMem: true,
          },
        },
      },
    });

    const agg: Record<string | number, { sales: number; count: number }> = {};
    for (const gd of transactions) {
      const staffId = gd.MaNhanVien ?? gd.NhanVien?.MaNhanVien;
      if (!staffId) continue;
      if (!agg[staffId]) agg[staffId] = { sales: 0, count: 0 };
      agg[staffId].sales += Number(gd.TongTien || 0);
      agg[staffId].count += 1;
    }

    const staffList = await this.prisma.nHANVIEN.findMany({
      where: { DeletedAt: null, TrangThai: StaffStatusEnum.CONLAM },
      include: { NguoiDungPhanMem: true },
    });

    const result: TopStaffDto[] = staffList.map((s) => {
      const staff = s;
      const stats = agg[staff.MaNhanVien] || { sales: 0, count: 0 };
      return {
        NhanVien: staff,
        DoanhThu: stats.sales,
        SoLuotGiaoDich: stats.count,
      };
    });

    result.sort(
      (a, b) => b.DoanhThu - a.DoanhThu || b.SoLuotGiaoDich - a.SoLuotGiaoDich,
    );

    return result;
  }

  async generateDailyRevenueReport(dateIso?: string) {
    const target = dateIso ? new Date(dateIso) : new Date();

    const y = target.getFullYear();
    const m = target.getMonth();
    const d = target.getDate();

    const start = new Date(y, m, d, 0, 0, 0, 0);
    const end = new Date(y, m, d + 1, 0, 0, 0, 0);

    const invoices = await this.prisma.hOADON.findMany({
      where: { DeletedAt: null, NgayLap: { gte: start, lt: end } },
      include: { Ves: true },
    });

    const ticketRevenue = invoices.reduce((sum, inv) => {
      const invTotal = (inv.Ves || [])
        .filter((v) => v.TrangThaiVe !== TicketStatusEnum.DAHOAN)
        .reduce((s, v) => s + Number(v.GiaVe || 0), 0);
      return sum + invTotal;
    }, 0);

    const combos = await this.prisma.hOADONCOMBO.findMany({
      where: {
        DeletedAt: null,
        HoaDon: { DeletedAt: null, NgayLap: { gte: start, lt: end } },
      },
    });

    const comboRevenue = combos.reduce((sum, c) => {
      const lineTotal = Number(c.SoLuong || 0) * Number(c.DonGia || 0);
      return sum + lineTotal;
    }, 0);

    const discounts = await this.prisma.hOADON_KHUYENMAI.findMany({
      where: {
        DeletedAt: null,
        HoaDon: { DeletedAt: null, NgayLap: { gte: start, lt: end } },
      },
      include: {
        KhuyenMaiKH: { include: { KhuyenMai: true } },
      },
    });

    let ticketDiscount = 0;
    let comboDiscount = 0;

    for (const km of discounts) {
      const targetType = km.KhuyenMaiKH?.KhuyenMai?.DoiTuongApDung;
      const value = Number(km.GiaTriGiam || 0);
      if (targetType === VoucherTargetEnum.VE) ticketDiscount += value;
      else if (targetType === VoucherTargetEnum.COMBO) comboDiscount += value;
    }

    const netTicketRevenue = Math.max(0, ticketRevenue - ticketDiscount);
    const netComboRevenue = Math.max(0, comboRevenue - comboDiscount);

    const upsert = await this.prisma.bAOCAODOANHTHU.upsert({
      where: { Ngay: start },
      update: {
        DoanhThuVe: netTicketRevenue,
        DoanhThuCombo: netComboRevenue,
        UpdatedAt: new Date(),
      },
      create: {
        Ngay: start,
        DoanhThuVe: netTicketRevenue,
        DoanhThuCombo: netComboRevenue,
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      },
    });

    return upsert;
  }

  async generateMissingDailyReports() {
    const lastReport = await this.prisma.bAOCAODOANHTHU.findFirst({
      where: { DeletedAt: null },
      orderBy: { Ngay: 'desc' },
    });

    let earliest: Date;
    if (lastReport) earliest = lastReport.Ngay;
    else earliest = new Date(2025, 0, 1);

    const today = new Date();

    if (earliest > today) return;

    while (earliest <= today) {
      await this.generateDailyRevenueReport(earliest.toISOString());
      earliest.setDate(earliest.getDate() + 1);
    }

    return;
  }
}

@Injectable()
export class StatisticsExportService {
  constructor(private readonly statisticsService: StatisticsService) { }

  async exportRoomStatus(): Promise<Buffer> {
    const data = await this.statisticsService.getRoomStatus();
    const wb = new Workbook();
    const ws = wb.addWorksheet('Room Status');

    ws.columns = [
      { header: 'Mã phòng', key: 'ma', width: 15 },
      { header: 'Tên phòng', key: 'ten', width: 20 },
      { header: 'Trạng thái', key: 'trangThai', width: 15 },
      { header: 'Ghế đã đặt', key: 'gheDaDat', width: 15 },
      { header: 'Tổng ghế', key: 'tongGhe', width: 15 },
      { header: 'Phim hiện tại', key: 'phim', width: 30 },
    ];

    data.forEach((r) => {
      ws.addRow({
        ma: r.PhongChieu.MaPhongChieu,
        ten: r.PhongChieu.TenPhongChieu,
        trangThai: r.TrangThai,
        gheDaDat: r.GheDaDat ?? '',
        tongGhe: r.TongGhe ?? '',
        phim: r.SuatChieuHienTai?.TenPhim ?? '',
      });
    });

    return Buffer.from(await wb.xlsx.writeBuffer());
  }

  async exportSummary(query: GetSummaryQueryDto): Promise<Buffer> {
    const s = await this.statisticsService.getSummary(query);
    const wb = new Workbook();
    const ws = wb.addWorksheet('Summary');

    ws.columns = [
      { header: 'Chỉ số', key: 'label', width: 30 },
      { header: 'Giá trị', key: 'value', width: 25 },
    ];

    ws.addRows([
      { label: 'Tổng doanh thu', value: s.TongDoanhThu },
      { label: 'Doanh thu vé', value: s.DoanhThuVe },
      { label: 'Doanh thu combo', value: s.DoanhThuCombo },
      { label: 'Số vé đã bán', value: s.SoVeDaBan },
      { label: 'Tỉ lệ lấp đầy (%)', value: s.TiLeLapDay },
      { label: 'So sánh doanh thu (%)', value: s.SoSanh.DoanhThuVe },
      { label: 'Chênh lệch số vé', value: s.SoSanh.SoVeDaBan },
    ]);

    return Buffer.from(await wb.xlsx.writeBuffer());
  }

  async exportRevenueChart(query: GetRevenueChartQueryDto): Promise<Buffer> {
    const data = await this.statisticsService.getRevenueChart(query);
    const wb = new Workbook();
    const ws = wb.addWorksheet('Revenue Chart');

    ws.columns = [
      { header: 'Ngày', key: 'ngay', width: 15 },
      { header: 'Doanh thu vé', key: 've', width: 20 },
      { header: 'Doanh thu combo', key: 'combo', width: 20 },
    ];

    data.forEach((d) => {
      ws.addRow({
        ngay: d.Ngay,
        ve: d.DoanhThuVe,
        combo: d.DoanhThuCombo,
      });
    });

    return Buffer.from(await wb.xlsx.writeBuffer());
  }

  async exportTopMovies(query: GetTopMovieDto): Promise<Buffer> {
    const data = await this.statisticsService.getTopMovies(query);
    const wb = new Workbook();
    const ws = wb.addWorksheet('Top Movies');

    ws.columns = [
      { header: 'Tên phim', key: 'ten', width: 30 },
      { header: 'Doanh thu', key: 'doanhThu', width: 20 },
      { header: 'Số vé bán', key: 'soVe', width: 15 },
    ];

    data.forEach((m) => {
      ws.addRow({
        ten: m.Phim?.TenHienThi ?? '',
        doanhThu: m.DoanhThu,
        soVe: m.SoVeDaBan,
      });
    });

    return Buffer.from(await wb.xlsx.writeBuffer());
  }

  async exportTopStaff(query: GetTopStaffQueryDto): Promise<Buffer> {
    const data = await this.statisticsService.getTopStaff(query);
    const wb = new Workbook();
    const ws = wb.addWorksheet('Top Staff');

    ws.columns = [
      { header: 'Nhân viên', key: 'ten', width: 30 },
      { header: 'Doanh thu', key: 'doanhThu', width: 20 },
      { header: 'Số giao dịch', key: 'soGd', width: 20 },
    ];

    data.forEach((s) => {
      ws.addRow({
        ten: s.NhanVien?.NguoiDungPhanMem.HoTen ?? '',
        doanhThu: s.DoanhThu,
        soGd: s.SoLuotGiaoDich,
      });
    });

    return Buffer.from(await wb.xlsx.writeBuffer());
  }
}
