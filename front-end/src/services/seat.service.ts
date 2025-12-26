/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/apiClient";
import { Seat, UpdateSeatDto } from "@/types/seat-management";

export const seatService = {
  create: async (data: { Hang: string; Cot: string }) => {
    return await api.post('/seats', [data]); 
  },
  
  // GET /seats 
  getAll: async () => {
    const res = await api.get<Seat[]>('/seats');
    return res.data;
  },

  // PATCH /seats/:id
  update: async (id: string, data: UpdateSeatDto) => {
    const res = await api.patch(`/seats/${id}`, data);
    return res.data;
  },
  
  getAllBase: async () => {
    const res = await api.get<any[]>('/seats/base');
    return res.data;
  },

  createSeatType: async (data: { MaGhe: string; MaLoaiGhe: string }) => {
    return await api.post('/seats/seat-type', data);
  },

  createBatch: async (seats: { Hang: string; Cot: string }[]) => {
    const res = await api.post('/seats', seats);
    return res.data;
  },

  createSeatTypeBatch: async (data: { MaGhe: string; MaLoaiGhe: string }[]) => {
    const res = await api.post('/seats/seat-type', data);
    return res.data;
  },
};