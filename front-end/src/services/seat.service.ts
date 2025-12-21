import api from "@/lib/apiClient";
import { Seat, UpdateSeatDto } from "@/types/seat-management";

export const seatService = {
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
  
  // API tạo ghế vật lý 
  createBatch: async (seats: { Hang: string; Cot: string }[]) => {
    const res = await api.post('/seats/batch', { seats });
    return res.data;
  }
};