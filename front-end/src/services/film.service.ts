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
  TrangThaiPhim: "DANGCHIEU" | "SAPCHIEU" | "NGUNGCHIEU";
  MaNhanPhim: string;
  PhienBanPhims?: {
    GiaVe: string;
    DinhDang: { TenDinhDang: string };
  }[];
}

const mapToFrontendMovie = (film: BackendFilm): Movie => {
  let status: "now_showing" | "coming_soon" | "ended" = "ended";
  if (film.TrangThaiPhim === "DANGCHIEU") status = "now_showing";
  else if (film.TrangThaiPhim === "SAPCHIEU") status = "coming_soon";

  const price = film.PhienBanPhims && film.PhienBanPhims.length > 0 
    ? parseInt(film.PhienBanPhims[0].GiaVe) 
    : 0;

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
    views: 0,
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
  }
};