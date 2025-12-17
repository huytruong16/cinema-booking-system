import api from "@/lib/apiClient";

export interface Language {
  MaNgonNgu: string;
  TenNgonNgu: string;
}

export const languageService = {
  getAll: async () => {
    const res = await api.get<Language[]>("/languages");
    return res.data;
  },
  create: async (data: { TenNgonNgu: string }) => {
    return await api.post("/languages", data);
  },
  update: async (id: string, data: { TenNgonNgu: string }) => {
    return await api.patch(`/languages/${id}`, data);
  },
  delete: async (id: string) => {
    return await api.delete(`/languages/${id}`);
  },
};