import api from "@/lib/apiClient";

export interface Genre {
  MaTheLoai: string;
  TenTheLoai: string;
}

export const genreService = {
  getAll: async () => {
    const res = await api.get<Genre[]>("/genres");
    return res.data;
  },
  create: async (data: { TenTheLoai: string }) => {
    return await api.post("/genres", data);
  },
  update: async (id: string, data: { TenTheLoai: string }) => {
    return await api.patch(`/genres/${id}`, data);
  },
  delete: async (id: string) => {
    return await api.delete(`/genres/${id}`);
  },
};