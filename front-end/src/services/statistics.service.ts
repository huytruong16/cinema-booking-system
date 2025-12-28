import apiClient from '@/lib/apiClient';
import {
  RoomStatus,
  StatisticsSummary,
  RevenueChartData,
  TopMovie,
  TopStaff,
} from '@/types/statistics';

export interface GetSummaryParams {
  range: 'day' | 'week' | 'month' | 'year' | 'all';
  date?: string;
}

export interface GetRevenueChartParams {
  range: 'week' | 'month' | 'year';
  date?: string;
}

export interface GetTopMovieParams {
  range: 'day' | 'week' | 'month' | 'year' | 'all';
  limit?: number;
}

export interface GetTopStaffParams {
  range: 'day' | 'week' | 'month' | 'year' | 'all';
  limit?: number;
}
interface RawSummaryResponse {
    LoaiThongKe: string;
    NgayBatDau: string;
    NgayKetThuc: string;
    TongDoanhThu: number;
    DoanhThuVe: number;
    SoVeDaBan: number;
    TiLeLapDay: number;
    DoanhThuCombo: number;
    SoSanh: {
        DoanhThuVe: number;
        SoVeDaBan: number;
    }
}

interface RawRevenueChartItem {
    Ngay: string;
    DoanhThuVe: number;
    DoanhThuCombo: number;
}

interface RawTopStaffItem {
    NhanVien: {
        MaNhanVien: string;
        NguoiDungPhanMem: {
            HoTen: string;
        };
    };
    DoanhThu: number;
    SoLuotGiaoDich: number;
}

interface RawRoomStatus {
    PhongChieu: {
        MaPhongChieu: string;
        TenPhongChieu: string;
    };
    TrangThai: string;
    GheDaDat?: number;
    TongGhe?: number;
    SuatChieuHienTai?: {
        MaSuatChieu: string;
        MaPhim: string;
        TenPhim: string;
        ThoiGianBatDau: string;
        ThoiGianKetThuc: string;
    };
}

export const statisticsService = {

  getSummary: async (params: GetSummaryParams): Promise<StatisticsSummary> => {
    const res = await apiClient.get<RawSummaryResponse>('/statistics/summary', { params });
    const raw = res.data;
    return {
        totalRevenue: raw.TongDoanhThu,
        totalTickets: raw.SoVeDaBan,
        growth: raw.SoSanh?.DoanhThuVe || 0
    };
  },

  getRevenueChart: async (
    params: GetRevenueChartParams
  ): Promise<RevenueChartData[]> => {
    const res = await apiClient.get<RawRevenueChartItem[]>('/statistics/revenue-chart', { params });
    return res.data.map(item => ({
        date: item.Ngay,
        revenue: item.DoanhThuVe + item.DoanhThuCombo
    }));
  },

  getTopMovies: async (
    params: GetTopMovieParams
  ): Promise<TopMovie[]> => {
    const res = await apiClient.get<TopMovie[]>('/statistics/top-movies', { params });
    return res.data;
  },

  getTopStaff: async (
    params: GetTopStaffParams
  ): Promise<TopStaff[]> => {
    const res = await apiClient.get<RawTopStaffItem[]>('/statistics/top-staff', { params });
    return res.data.map(item => ({
        staffId: item.NhanVien.MaNhanVien,
        name: item.NhanVien.NguoiDungPhanMem.HoTen,
        totalRevenue: item.DoanhThu,
        totalTickets: item.SoLuotGiaoDich
    }));
  },

  getRoomStatus: async (): Promise<RoomStatus[]> => {
    const res = await apiClient.get<RawRoomStatus[]>('/statistics/room-status');
    return res.data.map(item => {
        let status: 'TRONG' | 'DANG_CHIEU' | 'SAP_CHIEU' = 'TRONG';
        if (item.TrangThai === 'DANGCHIEU') status = 'DANG_CHIEU';
        else if (item.TrangThai === 'SAPCHIEU') status = 'SAP_CHIEU';
        
        return {
            PhongChieu: item.PhongChieu,
            TrangThai: status,
            GheDaDat: item.GheDaDat,
            TongGhe: item.TongGhe,
            SuatChieuTiepTheo: item.SuatChieuHienTai ? {
                ...item.SuatChieuHienTai,
                SoPhutConLai: 0 
            } : undefined
        };
    });
  },
};
