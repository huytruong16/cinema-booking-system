/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/apiClient";

export interface Seat {
  MaGhe?: string; 
  Hang: string;
  Cot: string;
  MaLoaiGhe: string;
  TrangThai?: string;
  LoaiGhe?: {
    TenLoaiGhe: string;
    GiaGoc: number;
    MauSac?: string;
  }
}

export interface ScreeningRoom {
  MaPhongChieu: string;
  TenPhongChieu: string;
  SoLuongHang: number;
  SoLuongCot: number;
  TrangThai: string;
  SoDoPhongChieu?: Record<string, string[]> | string; 
  Ghes?: Seat[]; 
}

export interface CreateRoomDto {
  TenPhongChieu: string;
  SoDoPhongChieu: Record<string, string[]>; 
  DanhSachGhe: {
      Hang: string;
      Cot: string;
      MaLoaiGhe: string;
  }[];
}

export const roomService = {
  getAll: async () => {
    const res = await api.get<ScreeningRoom[]>('/screening-rooms');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<ScreeningRoom>(`/screening-rooms/${id}`);
    return res.data;
  },
  create: async (data: CreateRoomDto) => {
    const res = await api.post('/screening-rooms', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.patch(`/screening-rooms/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/screening-rooms/${id}`);
    return res.data;
  }
};