import api from "@/lib/apiClient";
import { SeatType, CreateSeatTypeDto } from "@/types/seat-management";

export const seatTypeService = {
  // GET /seat-types
  getAll: async () => {
    const res = await api.get<SeatType[]>('/seat-types');
    return res.data;
  },

  // POST /seat-types
  create: async (data: CreateSeatTypeDto) => {
    const res = await api.post('/seat-types', data);
    return res.data;
  },

  // PATCH /seat-types/:id
  update: async (id: string, data: Partial<CreateSeatTypeDto>) => {
    const res = await api.patch(`/seat-types/${id}`, data);
    return res.data;
  },

  // DELETE /seat-types/:id
  delete: async (id: string) => {
    const res = await api.delete(`/seat-types/${id}`);
    return res.data;
  }
};