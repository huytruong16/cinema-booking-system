/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/apiClient";
import { Movie } from "@/types/movie";

export interface BackendFilm {
  MaPhim: string;
  TenGoc: string;
  TenHienThi: string;
  TomTatNoiDung: string;
  DaoDien: string;
  DanhSachDienVien: string;
  QuocGia: string;
  TrailerUrl: string;
  PosterUrl: string;
  BackdropUrl: string;
  ThoiLuong: number;
  NgayBatDauChieu: string;
  NgayKetThucChieu: string;
  DiemDanhGia: number;
  TrangThaiPhim: string; 
  MaNhanPhim: string;
  NhanPhim?: { 
    TenNhanPhim: string;
    MoTa?: string;
  };
  PhienBanPhims?: {
    GiaVe: string;
    DinhDang: { TenDinhDang: string };
  }[];
  PhimTheLoais?: {
    TheLoai: { TenTheLoai: string };
  }[];
  DanhGias?: {
    NoiDung: string;
    Diem: number;
    CreatedAt: string;
  }[];
}

export interface CreateFilmDto {
    TenGoc: string;
    TenHienThi: string;
    TomTatNoiDung: string;
    DaoDien: string;
    DanhSachDienVien: string;
    QuocGia: string;
    TrailerUrl: string;
    ThoiLuong: number;
    NgayBatDauChieu: string;
    NgayKetThucChieu: string;
    MaNhanPhim: string;
    TheLoais: string[]; 
    posterFile?: File | null;
    backdropFile?: File | null;
}

export interface Genre {
    MaTheLoai: string;
    TenTheLoai: string;
}

export interface Label {
    MaNhanPhim: string;
    TenNhanPhim: string;
}

const mapToFrontendMovie = (film: BackendFilm): Movie => {
  let status: "now_showing" | "coming_soon" | "ended" = "ended";
  if (film.TrangThaiPhim === "DANGCHIEU") status = "now_showing";
  else if (film.TrangThaiPhim === "SAPCHIEU") status = "coming_soon";
  else if (film.TrangThaiPhim === "NGUNGCHIEU") status = "ended";

  const price = film.PhienBanPhims && film.PhienBanPhims.length > 0 
    ? parseInt(film.PhienBanPhims[0].GiaVe) 
    : 0;

  const tags = film.PhimTheLoais?.map((item) => item.TheLoai.TenTheLoai) || [];

  return {
    id: film.MaPhim,
    title: film.TenHienThi,
    subTitle: film.TenGoc,
    posterUrl: film.PosterUrl,
    backdropUrl: film.BackdropUrl,
    description: film.TomTatNoiDung,
    trailerUrl: film.TrailerUrl,
    year: new Date(film.NgayBatDauChieu).getFullYear(),
    status: status,
    ageRating: "T18", 
    duration: `${film.ThoiLuong} phút`,
    actorList: film.DanhSachDienVien,
    country: film.QuocGia,
    rating: film.DiemDanhGia,
    price: price,
    tags: tags, 
    views: 0,
    startDate: new Date(film.NgayBatDauChieu),
    endDate: new Date(film.NgayKetThucChieu),
  };
};

export const filmService = {
  getAllFilms: async (): Promise<Movie[]> => {
    try {
      const response = await api.get<any>('/films');
      const films = Array.isArray(response.data) ? response.data : response.data.data || [];
      return films.map(mapToFrontendMovie);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phim:", error);
      return [];
    }
  },

  getFilmById: async (id: string): Promise<Movie | null> => {
    try {
      const response = await api.get<BackendFilm>(`/films/${id}`);
      return mapToFrontendMovie(response.data);
    } catch (error) {
      console.error(`Lỗi get film ${id}:`, error);
      return null;
    }
  },

  getAll: async (): Promise<BackendFilm[]> => {
      const res = await api.get<BackendFilm[]>('/films');
      return res.data;
  },

  create: async (data: CreateFilmDto) => {
      const formData = new FormData();

      const append = (key: string, value: any) => {
          if (value !== undefined && value !== null && value !== '') {
              formData.append(key, value);
          }
      };

      append('TenGoc', data.TenGoc);
      append('TenHienThi', data.TenHienThi);
      append('TomTatNoiDung', data.TomTatNoiDung);
      append('DaoDien', data.DaoDien);
      append('DanhSachDienVien', data.DanhSachDienVien);
      append('QuocGia', data.QuocGia);
      append('TrailerUrl', data.TrailerUrl);
      append('ThoiLuong', data.ThoiLuong?.toString());
      append('MaNhanPhim', data.MaNhanPhim);

      if (data.NgayBatDauChieu) append('NgayBatDauChieu', new Date(data.NgayBatDauChieu).toISOString());
      if (data.NgayKetThucChieu) append('NgayKetThucChieu', new Date(data.NgayKetThucChieu).toISOString());
      
      if (data.TheLoais && Array.isArray(data.TheLoais)) {
          formData.append('TheLoais', JSON.stringify(data.TheLoais));
      } else {
          formData.append('TheLoais', JSON.stringify([]));
      }

      if (data.posterFile instanceof File) formData.append('posterFile', data.posterFile);
      if (data.backdropFile instanceof File) formData.append('backdropFile', data.backdropFile);

      const res = await api.post('/films', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
  },

  update: async (id: string, data: Partial<CreateFilmDto>) => {
    const formData = new FormData();

    const append = (key: string, value: any) => {
        if (value !== undefined && value !== null) {
            formData.append(key, value);
        }
    };

    if (data.TenGoc) append('TenGoc', data.TenGoc);
    if (data.TenHienThi) append('TenHienThi', data.TenHienThi);
    
    if (data.TomTatNoiDung !== undefined) formData.append('TomTatNoiDung', data.TomTatNoiDung || '');
    if (data.DaoDien !== undefined) formData.append('DaoDien', data.DaoDien || '');
    if (data.DanhSachDienVien !== undefined) formData.append('DanhSachDienVien', data.DanhSachDienVien || '');
    if (data.QuocGia !== undefined) formData.append('QuocGia', data.QuocGia || '');
    if (data.TrailerUrl !== undefined) formData.append('TrailerUrl', data.TrailerUrl || '');
    
    if (data.ThoiLuong !== undefined && data.ThoiLuong !== null) append('ThoiLuong', data.ThoiLuong.toString());
    if (data.MaNhanPhim) append('MaNhanPhim', data.MaNhanPhim);

    if (data.NgayBatDauChieu) {
        const dateVal = typeof data.NgayBatDauChieu === 'string' ? new Date(data.NgayBatDauChieu) : data.NgayBatDauChieu;
        formData.append('NgayBatDauChieu', dateVal.toISOString());
    }
    if (data.NgayKetThucChieu) {
        const dateVal = typeof data.NgayKetThucChieu === 'string' ? new Date(data.NgayKetThucChieu) : data.NgayKetThucChieu;
        formData.append('NgayKetThucChieu', dateVal.toISOString());
    }
    
    if (data.TheLoais && Array.isArray(data.TheLoais)) {
        data.TheLoais.forEach((tl: string) => {
            formData.append('TheLoais', tl); 
        });
    }

    if (data.posterFile instanceof File) {
        formData.append('posterFile', data.posterFile);
    }
    if (data.backdropFile instanceof File) {
        formData.append('backdropFile', data.backdropFile);
    }

    const res = await api.patch(`/films/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
},

  delete: async (id: string) => {
      const res = await api.delete(`/films/${id}`);
      return res.data;
  },

  getAllGenres: async () => {
      const res = await api.get<Genre[]>('/genres'); 
      return res.data;
  },
  
  getAllLabels: async () => {
      const res = await api.get<Label[]>('/ratings'); 
      return res.data;
  }
};