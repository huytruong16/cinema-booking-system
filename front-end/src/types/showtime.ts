export interface ShowtimeSeat {
  MaGheSuatChieu: string;
  MaGhePhongChieu: string;
  TrangThai: string; // 'CONTRONG', 'DADAT'
  GhePhongChieu: {
    MaGhePhongChieu: string;
    MaGheLoaiGhe: string;
    GheLoaiGhe: {
      MaGheLoaiGhe: string;
      MaLoaiGhe: string;
      MaGhe: string;
      Ghe: {
        MaGhe: string;
        Hang: string;
        Cot: string;
      };
      LoaiGhe: {
        MaLoaiGhe: string;
        LoaiGhe: string;
        HeSoGiaGhe: number;
      };
    };
  };
}

export interface Showtime {
  MaSuatChieu: string;
  MaPhienBanPhim: string;
  MaPhongChieu: string;
  ThoiGianBatDau: string; 
  ThoiGianKetThuc: string; 
  TrangThai: 'CHUACHIEU' | 'DANGCHIEU' | 'DACHIEU' | 'DAHUY' | 'SAPCHIEU';
  PhienBanPhim: {
    MaPhienBanPhim: string;
    MaPhim: string;
    MaDinhDang: string;
    MaNgonNgu: string;
    GiaVe: string;
    Phim: {
      MaPhim: string;
      TenGoc: string;
      TenHienThi: string;
      TomTatNoiDung: string;
      PosterUrl: string;
      BackdropUrl: string;
      ThoiLuong: number;
      DiemDanhGia: number;
      TrangThaiPhim: string;
      NhanPhim: {
        MaNhanPhim: string;
        TenNhanPhim: string; 
        MoTa: string;
      };
    };
    DinhDang: {
      MaDinhDang: string;
      TenDinhDang: string; 
    };
    NgonNgu: {
      MaNgonNgu: string;
      TenNgonNgu: string; 
    };
  };
  PhongChieu: {
    MaPhongChieu: string;
    TenPhongChieu: string; 
  };
  GheSuatChieus?: ShowtimeSeat[];
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
}