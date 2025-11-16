import apiClient from '@/lib/apiClient';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  gender: 'male' | 'female' | 'other' | null;
  role: {
    name: string;
  };
}

export interface UpdateProfileData {
  display_name?: string;
  gender?: 'male' | 'female' | 'other';
  avatar_url?: string | null;
}


export const getMyProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>('/profile/me');
  return response.data;
};

export const updateMyProfile = async (
  data: UpdateProfileData,
): Promise<{ message: string; data: UserProfile }> => {
  const response = await apiClient.put('/profile/me', data);
  return response.data;
};
export const changePassword = async (data: { oldPassword: string, newPassword: string }) => {
  const response = await apiClient.post('/profile/change-password', data);
  return response.data;
};