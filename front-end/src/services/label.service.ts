/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/apiClient";

export interface Label {
  MaNhanPhim: string;
  TenNhanPhim: string;
  MoTa: string;
}

export const labelService = {
  getAll: async () => (await api.get<Label[]>("/ratings")).data,
  create: async (data: any) => await api.post("/ratings", data),
  update: async (id: string, data: any) => await api.patch(`/ratings/${id}`, data),
  delete: async (id: string) => await api.delete(`/ratings/${id}`),
};