import apiClient from "@/lib/apiClient";

export const customerService = {
  getAll: async () => {
    const res = await apiClient.get("/customers", {
      params: {
        fromCreatedAt: '2000-01-01',
        toCreatedAt: '2100-12-31',
        limit: 100
      }
    });
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