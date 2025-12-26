import api from "@/lib/apiClient";

export interface Role {
  MaNhomNguoiDung: string;
  TenNhomNguoiDung: string;
  QuyenNhomNguoiDungs: { Quyen: string }[];
}

export interface CreateRoleDto {
  TenNhomNguoiDung: string;
}

export interface UpdateRoleDto {
  TenNhomNguoiDung: string;
}

export interface AssignEmployeeDto {
  HoTen: string;
  Email: string;
  MatKhau: string;
  SoDienThoai: string;
  MaNhom: string;
}

export const roleService = {
  getAll: async () => {
    const res = await api.get<Role[]>('/user-groups');
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<Role>(`/user-groups/${id}`);
    return res.data;
  },

  create: async (data: CreateRoleDto) => {
    const res = await api.post('/user-groups', data);
    return res.data;
  },

  update: async (id: string, data: UpdateRoleDto) => {
    const res = await api.patch(`/user-groups/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/user-groups/${id}`);
    return res.data;
  },

  updatePermissions: async (groupId: string, permissions: string[]) => {
    const res = await api.patch('/user-groups/permissions', {
      groupId: groupId,
      permissions: permissions
    });
    return res.data;
  },

  getUsersInGroup: async (groupId: string) => {
    const res = await api.get(`/user-groups/${groupId}/users`);
    // API returns { data: User[], pagination: ... }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (res.data as any).data || [];
  },

  assignEmployee: async (data: AssignEmployeeDto) => {
    const res = await api.post('/users/assign-employee', data);
    return res.data;
  },

  assignGroup: async (userId: string, groupId: string) => {
    const res = await api.post('/users/assign-group', {
      userId: userId,
      groupId: groupId
    });
    return res.data;
  }
};