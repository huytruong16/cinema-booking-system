export interface SeatMap {
  [row: string]: string[];
}

export interface Ghe {
  MaGhe: string;
  Hang: string;
  Cot: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
}

export type SeatType = LoaiGhe;

export interface LoaiGhe {
  MaLoaiGhe: string;
  LoaiGhe: string;
  HeSoGiaGhe: number;
  MauSac?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
}

export interface GheLoaiGhe {
  MaGheLoaiGhe: string;
  MaGhe: string;
  MaLoaiGhe: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
  Ghe: Ghe;
  LoaiGhe: LoaiGhe;
}

export interface GhePhongChieu {
  MaGhePhongChieu: string;
  MaGheLoaiGhe: string;
  MaPhongChieu: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
  GheLoaiGhe: GheLoaiGhe;
}

export interface GheSuatChieu {
  MaGheSuatChieu: string;
  MaGhePhongChieu: string;
  MaSuatChieu: string;
  TrangThai: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
  GhePhongChieu: GhePhongChieu;
}

export interface Showtime {
  MaSuatChieu: string;
  MaPhienBanPhim: string;
  MaPhongChieu: string;
  ThoiGianBatDau: string;
  ThoiGianKetThuc: string;
  TrangThai: 'CHUACHIEU' | 'DANGCHIEU' | 'DACHIEU' | 'DAHUY' | 'SAPCHIEU';
  CreatedAt?: string;
  UpdatedAt?: string;
  PhienBanPhim: {
    MaPhienBanPhim: string;
    MaPhim: string;
    MaDinhDang: string;
    MaNgonNgu: string;
    GiaVe: string | number;

    Phim: {
      MaPhim: string;
      TenGoc: string;
      TenHienThi: string;
      TomTatNoiDung: string;
      DaoDien?: string;
      DanhSachDienVien?: string;
      QuocGia?: string;
      TrailerUrl?: string;
      PosterUrl: string;
      BackdropUrl: string;
      ThoiLuong: number;
      DiemDanhGia: number;
      TrangThaiPhim: string;
      NgayBatDauChieu: string;
      NgayKetThucChieu?: string;

      NhanPhim: {
        MaNhanPhim: string;
        TenNhanPhim: string;
        MoTa: string;
        DoTuoiToiThieu?: number;
      };

      PhimTheLoais: {
        MaTheLoaiPhim?: string;
        MaTheLoai: string;
        TheLoai: {
          MaTheLoai: string;
          TenTheLoai: string;
        };
      }[];
    };

    DinhDang: {
      MaDinhDang: string;
      TenDinhDang: string;
      GiaVe?: string;
    };

    NgonNgu: {
      MaNgonNgu: string;
      TenNgonNgu: string;
    };
  };

  PhongChieu?: {
    MaPhongChieu: string;
    TenPhongChieu: string;
    TrangThai?: string;
    SoDoGhe: SeatMap;
  };

  GheSuatChieus?: GheSuatChieu[];
}

export interface GetShowtimesParams {
  MaPhim?: string;
  MaPhongChieu?: string;
  MaPhienBanPhim?: string;
  MaDinhDang?: string;
  MaTheLoai?: string;
  TrangThai?: string;
  TuNgay?: string;
  DenNgay?: string;
  limit?: number;
}

export interface SuatChieuSimple {
  MaSuatChieu: string;
  ThoiGianBatDau: string;
  ThoiGianKetThuc: string;
  TrangThai: string;
}

export interface PhongChieuGroup {
  MaPhongChieu: string;
  TenPhongChieu: string;
  SuatChieus: SuatChieuSimple[];
}

export interface PhienBanPhimGroup {
  MaPhienBanPhim: string;
  DinhDang: { TenDinhDang: string };
  NgonNgu: { TenNgonNgu: string };
  PhongChieu: PhongChieuGroup[];
}

export interface SuatChieuTheoNgay {
  NgayChieu: string;
  PhienBanPhim: PhienBanPhimGroup[];
}

export interface ShowtimeByMovieResponse {
  Phim: any;
  SuatChieuTheoNgay: SuatChieuTheoNgay[];
}