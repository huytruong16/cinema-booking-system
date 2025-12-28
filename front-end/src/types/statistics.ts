export interface RoomStatus {
  PhongChieu: {
    MaPhongChieu: string;
    TenPhongChieu: string;
  };
  TrangThai: 'TRONG' | 'DANG_CHIEU' | 'SAP_CHIEU';
  GheDaDat?: number;
  TongGhe?: number;
  SuatChieuTiepTheo?: {
    MaSuatChieu: string;
    MaPhim: string;
    TenPhim: string;
    ThoiGianBatDau: string;
    ThoiGianKetThuc: string;
    SoPhutConLai: number;
  };
}

export interface StatisticsSummary {
  totalRevenue: number;
  totalTickets: number;
  growth: number;
  comboRevenue: number;
  occupancyRate: number;
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  ticketRevenue: number;
  comboRevenue: number;
}

export interface TopMovie {
  Phim: {
    MaPhim: string;
    TenHienThi: string;
    PosterUrl?: string;
  };
  DoanhThu: number;
  SoVeDaBan: number;
}

export interface TopStaff {
  staffId: string;
  name: string;
  totalRevenue: number;
  totalTickets: number;
}
