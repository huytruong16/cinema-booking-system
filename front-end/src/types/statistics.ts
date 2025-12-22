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
}

export interface RevenueChartData {
  date: string;
  revenue: number;
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
  staffId: number;
  name: string;
  totalRevenue: number;
  totalTickets: number;
}
