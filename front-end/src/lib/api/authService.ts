import apiClient from "@/lib/apiClient";

export interface ApiResponse<T> {
  message: string;
  error?: string;
  statusCode?: number;
  result?: T; 
}

export interface AuthResponse {
  accessToken: string;
  user: {
      MaNguoiDung: string;
      Email: string;
      HoTen: string;
      VaiTro: string;
      AvatarUrl?: string;
  };
}

export const authService = {
  async register(payload: {
    email: string;
    matkhau: string;
    hoTen: string;  
  }) {
    const response = await apiClient.post('/auth/register', payload);
    return response.data;
  },

  async login(payload: {
    email: string;
    matkhau: string; 
  }) {
    const response = await apiClient.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },

  async verifyUser(payload: {
    email: string;
    otp: string; 
  }) {
    const response = await apiClient.post('/auth/verify-otp', payload);
    return response.data;
  },

  async resendVerificationCode(payload: { email: string }) { 
    const response = await apiClient.post('/auth/resend-otp', payload);
    return response.data;
  },

  async refreshToken() { 
    const response = await apiClient.get('/auth/refresh');
    return response.data;
  },

  async forgotPassword(payload: {
    email: string;
  }) {
    const response = await apiClient.post('/auth/forgot-password', payload);
    return response.data;
  },

  async verifyResetOtp(payload: {
    email: string;
    otp: string;
  }) {
    const response = await apiClient.post('/auth/verify-reset-otp', payload);
    return response.data;
  },

  async resetPassword(payload: {
    email: string;    
    matkhauMoi: string; 
  }) {
    const response = await apiClient.post('/auth/reset-password', payload);
    return response.data;
  },

  async logout() {
    const response = await apiClient.post('/auth/logout');
    
    if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
    }
    return response.data;
  },
};