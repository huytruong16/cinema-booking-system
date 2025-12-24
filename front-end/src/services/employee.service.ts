/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/apiClient";

export const employeeService = {
  getAll: async () => {
    const res = await apiClient.get("/employees");
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/employees/${id}`);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.patch(`/employees/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/employees/${id}`);
    return res.data;
  }
};