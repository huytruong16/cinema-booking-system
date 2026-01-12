import apiClient from '@/lib/apiClient';
import {
  RoomStatus,
  StatisticsSummary,
  RevenueChartData,
  TopMovie,
  TopStaff,
} from '@/types/statistics';
import { TopMovieBanner } from '@/types/home-banner';
import { filmService } from './film.service';

export interface GetSummaryParams {
  range: 'day' | 'week' | 'month' | 'year';
  date?: string;
}

export interface GetRevenueChartParams {
  range: 'week' | 'month' | 'year';
  date?: string;
}

export interface GetTopMovieParams {
  range: 'day' | 'week' | 'month' | 'year' | 'all';
  limit?: number;
  date?: string;
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
      growth: raw.SoSanh?.DoanhThuVe || 0,
      comboRevenue: raw.DoanhThuCombo,
      occupancyRate: raw.TiLeLapDay
    };
  },

  getRevenueChart: async (
    params: GetRevenueChartParams
  ): Promise<RevenueChartData[]> => {
    const res = await apiClient.get<RawRevenueChartItem[]>('/statistics/revenue-chart', { params });
    return res.data.map(item => ({
      date: item.Ngay,
      revenue: item.DoanhThuVe + item.DoanhThuCombo,
      ticketRevenue: item.DoanhThuVe,
      comboRevenue: item.DoanhThuCombo
    }));
  },

  getTopMovies: async (
    params: GetTopMovieParams
  ): Promise<TopMovie[]> => {
    const queryParams: Record<string, string> = {
      range: params.range,
    };
    if (params.limit !== undefined) {
      queryParams.limit = String(params.limit);
    }
    if (params.date !== undefined) {
      queryParams.date = params.date;
    }
    const res = await apiClient.get<TopMovie[]>('/statistics/top-movies', { params: queryParams });
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
  exportRoomStatus: async (): Promise<Blob> => {
    const res = await apiClient.get<Blob>('/statistics/export/room-status', {
      responseType: 'blob',
    });
    return res.data;
  },

  exportSummary: async (params?: {
    mode?: 'day' | 'week' | 'month' | 'year';
    date?: string;
  }): Promise<Blob> => {
    const res = await apiClient.get<Blob>('/statistics/export/summary', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },

  exportRevenueChart: async (params: {
    range: 'week' | 'month' | 'year';
    date?: string;
  }): Promise<Blob> => {
    const res = await apiClient.get<Blob>('/statistics/export/revenue-chart', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },

  exportTopMovies: async (params?: {
    range?: 'day' | 'week' | 'month' | 'year' | 'all';
    limit?: number;
    date?: string;
  }): Promise<Blob> => {
    const res = await apiClient.get<Blob>('/statistics/export/top-movies', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },

  exportTopStaff: async (params: {
    range: 'day' | 'week' | 'month' | 'year';
    date?: string;
  }): Promise<Blob> => {
    const res = await apiClient.get<Blob>('/statistics/export/top-staff', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },

  exportPdfRoomStatus: async (): Promise<Blob> => {
    const res = await apiClient.get<Blob>('/statistics/export/pdf/room-status', {
      responseType: 'blob',
    });
    return res.data;
  },

  exportPdfSummary: async (params?: {
    mode?: 'day' | 'week' | 'month' | 'year';
    date?: string;
  }): Promise<Blob> => {
    const res = await apiClient.get<Blob>('/statistics/export/pdf/summary', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },

  exportPdfRevenueChart: async (params: {
    range: 'week' | 'month' | 'year';
    date?: string;
  }): Promise<Blob> => {
    const res = await apiClient.get<Blob>('/statistics/export/pdf/revenue-chart', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },

  exportPdfTopMovies: async (params?: {
    range?: 'day' | 'week' | 'month' | 'year' | 'all';
    limit?: number;
    date?: string;
  }): Promise<Blob> => {
    const res = await apiClient.get<Blob>('/statistics/export/pdf/top-movies', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },

  exportPdfTopStaff: async (params: {
    range: 'day' | 'week' | 'month' | 'year';
    date?: string;
  }): Promise<Blob> => {
    const res = await apiClient.get<Blob>('/statistics/export/pdf/top-staff', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },
  getTopMoviesForBanner: async (limit: number = 5): Promise<TopMovieBanner[]> => {
    const USE_MOCK_DATA = false;

    if (USE_MOCK_DATA) {
      const mockData: TopMovieBanner[] = [
        {
          rank: 1,
          movie: {
            id: "PHIM001",
            title: "Godzilla x Kong: Đế Chế Mới",
            subTitle: "Godzilla x Kong: The New Empire",
            posterUrl: "https://image.tmdb.org/t/p/w500/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg",
            backdropUrl: "https://image.tmdb.org/t/p/original/xRd1eJIDe7JHO5u4gtEYwGn5wtf.jpg",
            description: "Hai titan huyền thoại - Godzilla và Kong - cùng nhau đối đầu với mối đe dọa chưa từng có từ thế giới bí ẩn dưới lòng đất.",
            trailerUrl: "https://www.youtube.com/watch?v=qqrpMRDuPfc",
            year: 2024,
            status: "now_showing",
            ageRating: "T13",
            duration: "115 phút",
            country: "Mỹ",
            rating: 8.5,
            tags: ["Hành động", "Phiêu lưu", "Viễn tưởng"],
          },
          ticketsSold: 15234,
          revenue: 1523400000,
        },
        {
          rank: 2,
          movie: {
            id: "PHIM002",
            title: "Kung Fu Panda 4",
            subTitle: "Kung Fu Panda 4",
            posterUrl: "https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
            backdropUrl: "https://image.tmdb.org/t/p/original/1XDDXPXGiI8id7MrUxK36ke7gkX.jpg",
            description: "Po được chọn làm Lãnh đạo Tinh thần của Thung lũng Hòa bình và phải tìm người kế nhiệm mới để trở thành Chiến binh Rồng.",
            trailerUrl: "https://www.youtube.com/watch?v=_inKs4eeHiI",
            year: 2024,
            status: "now_showing",
            ageRating: "P",
            duration: "94 phút",
            country: "Mỹ",
            rating: 8.2,
            tags: ["Hoạt hình", "Hài hước", "Gia đình"],
          },
          ticketsSold: 12890,
          revenue: 1289000000,
        },
        {
          rank: 3,
          movie: {
            id: "PHIM003",
            title: "Quật Mộ Trùng Ma",
            subTitle: "Exhuma",
            posterUrl: "https://image.tmdb.org/t/p/w500/pM3mLrHPfgjvRJEySjKSMzXtLMk.jpg",
            backdropUrl: "https://image.tmdb.org/t/p/original/pM3mLrHPfgjvRJEySjKSMzXtLMk.jpg",
            description: "Một pháp sư nổi tiếng và thầy phong thủy được thuê để giải quyết lời nguyền đang ám ảnh một gia đình giàu có.",
            trailerUrl: "https://www.youtube.com/watch?v=GjpnqN8GMPA",
            year: 2024,
            status: "now_showing",
            ageRating: "T18",
            duration: "134 phút",
            country: "Hàn Quốc",
            rating: 8.8,
            tags: ["Kinh dị", "Bí ẩn", "Tâm lý"],
          },
          ticketsSold: 11567,
          revenue: 1156700000,
        },
        {
          rank: 4,
          movie: {
            id: "PHIM004",
            title: "Địa Đạo: Mặt Trời Trong Bóng Tối",
            subTitle: "Cu Chi: The Tunnel",
            posterUrl: "https://image.tmdb.org/t/p/w500/aSuL1HN0CRBd5mAMfbWGZCNkNKY.jpg",
            backdropUrl: "https://image.tmdb.org/t/p/original/aSuL1HN0CRBd5mAMfbWGZCNkNKY.jpg",
            description: "Câu chuyện về những người chiến sĩ trong hệ thống địa đạo Củ Chi huyền thoại.",
            trailerUrl: "https://www.youtube.com/watch?v=example",
            year: 2024,
            status: "now_showing",
            ageRating: "T16",
            duration: "128 phút",
            country: "Việt Nam",
            rating: 9.1,
            tags: ["Chiến tranh", "Lịch sử", "Hành động"],
          },
          ticketsSold: 9876,
          revenue: 987600000,
        },
        {
          rank: 5,
          movie: {
            id: "PHIM005",
            title: "Dune: Hành Tinh Cát - Phần Hai",
            subTitle: "Dune: Part Two",
            posterUrl: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9OH7Lv4gPqRWlzXpfl.jpg",
            backdropUrl: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
            description: "Paul Atreides hợp nhất với Chani và người Fremen trong khi trên con đường chiến tranh chống lại những kẻ đã tiêu diệt gia đình anh.",
            trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
            year: 2024,
            status: "now_showing",
            ageRating: "T13",
            duration: "166 phút",
            country: "Mỹ",
            rating: 8.7,
            tags: ["Viễn tưởng", "Phiêu lưu", "Hành động"],
          },
          ticketsSold: 8543,
          revenue: 854300000,
        },
      ];

      return mockData.slice(0, limit);
    }

    try {
      const topMovies = await statisticsService.getTopMovies({
        range: 'week',
        limit: limit + 10
      });

      const enrichedMovies = await Promise.all(
        topMovies.map(async (item) => {
          try {
            const movie = await filmService.getFilmById(item.Phim.MaPhim);
            if (!movie || movie.status !== 'now_showing') return null;
            return {
              movie,
              ticketsSold: item.SoVeDaBan,
              revenue: item.DoanhThu,
            };
          } catch {
            return null;
          }
        })
      );

      return enrichedMovies
        .filter((item): item is Omit<TopMovieBanner, 'rank'> => item !== null)
        .slice(0, limit)
        .map((item, index) => ({
          ...item,
          rank: index + 1,
        }));
    } catch (error) {
      console.error('Error fetching top movies for banner:', error);
      return [];
    }
  },
};
