import api from "@/lib/apiClient";

export interface MovieVersion {
  id: string;         
  MaPhim: string;
  TenPhim: string; 
  MaDinhDang: string;
  TenDinhDang: string; 
  MaNgonNgu: string;
  TenNgonNgu: string;  
  GiaVe: number;
  TrangThai?: string;
  deletedAt?: string;
}

export interface MovieVersionResponse {
  MaPhienBanPhim: string;
  Phim: {
    MaPhim: string;
    TenHienThi: string;
    PosterUrl: string;
    ThoiLuong: number;
  };
  DinhDang: {
    MaDinhDang: string;
    TenDinhDang: string;
  };
  NgonNgu: {
    MaNgonNgu: string;
    TenNgonNgu: string;
  };
  GiaVe: string;
  DeletedAt?: string | null;
}

export interface CreateVersionDto {
  MaPhim: string;
  MaDinhDang: string;
  MaNgonNgu: string;
  GiaVe: number;
}

export interface UpdateVersionDto {
  GiaVe: number;
  TrangThai: string;
}

export const movieVersionService = {
  getAll: async () => {
    const res = await api.get("/films/format");
    return res.data;
  },

  // 1. Create
  create: async (data: CreateVersionDto) => {
    return await api.post("/films/version", data);
  },

  // 2. Update
  update: async (id: string, data: Partial<CreateVersionDto>) => {
    return await api.patch(`/films/version/${id}`, data);
  },

  // 3. Delete
  delete: async (id: string) => {
    return await api.delete(`/films/version/${id}`);
  },
  
  getFormats: async () => {
    const res = await api.get("/formats");
    return res.data;
  },
  
  getLanguages: async () => {
    const res = await api.get("/languages");
    return res.data;
  },
  
  getFilms: async () => {
      const res = await api.get("/films");
      return res.data; 
  }
};