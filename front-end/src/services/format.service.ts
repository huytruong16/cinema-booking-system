import api from "@/lib/apiClient";

export interface Format {
  MaDinhDang: string;
  TenDinhDang: string;
}

export const formatService = {
  getAll: async () => {
    const res = await api.get<Format[]>("/formats");
    return res.data;
  },
  create: async (data: { TenDinhDang: string }) => {
    return await api.post("/formats", data);
  },
  update: async (id: string, data: { TenDinhDang: string }) => {
    return await api.patch(`/formats/${id}`, data);
  },
  delete: async (id: string) => {
    return await api.delete(`/formats/${id}`);
  },
};