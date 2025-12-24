import api from "@/lib/apiClient";

export const roleService = {
  updatePermissions: async (groupId: string, permissions: string[]) => {
    const res = await api.patch('/users/groups/permissions', {
      groupId,
      permissions
    });
    return res.data;
  },

  getAll: async () => {
    try {
        // Nếu sau này Backend bổ sung API GET /groups, bạn chỉ cần bỏ comment dòng dưới:
        // const res = await api.get<Role[]>('/groups'); 
        // return res.data;
        return []; 
    } catch (error) {
        return [];
    }
  }
};