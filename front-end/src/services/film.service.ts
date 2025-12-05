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
      const response = await api.get<BackendFilm[]>('/films');
      return response.data.map(mapToFrontendMovie);
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
  }
};