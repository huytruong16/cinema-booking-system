import apiClient from "@/lib/apiClient";

export const customerService = {
  getAll: async () => {
    const res = await apiClient.get("/customers");
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/customers/${id}`);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/customers/${id}`);
    return res.data;
  }
};