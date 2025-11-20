import apiClient from "@/lib/apiClient"
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://cinema-booking-system-xkgg.onrender.com";
console.log("API_URL = ", API_URL);

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

export const authService = {
  async register(payload: {
    email: string;
    matkhau: string;
    hoTen: string;  
  }) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<ApiResponse<string>>(res);
  },

  async login(payload: {
    email: string;
    matkhau: string; 
  }) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    return handleResponse<AuthResponse>(res);
  },

  async verifyUser(payload: {
    email: string;
    otp: string; 
  }) {
    const res = await fetch(`${API_URL}/auth/verify-otp`, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<ApiResponse<string>>(res);
  },

  async resendVerificationCode(payload: { email: string }) { 
    const res = await fetch(`${API_URL}/auth/resend-otp`, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<ApiResponse<string>>(res);
  },

  async refreshToken() { 
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "GET", 
      credentials: 'include',
    });
    return handleResponse<ApiResponse<AuthResponse>>(res);
  },

  async forgotPassword(payload: {
    email: string;
  }) {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<ApiResponse<string>>(res);
  },

  async verifyResetOtp(payload: {
    email: string;
    otp: string;
  }) {
    const res = await fetch(`${API_URL}/auth/verify-reset-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<ApiResponse<string>>(res);
  },

  async resetPassword(payload: {
    email: string;    
    matkhauMoi: string; 
  }) {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<ApiResponse<string>>(res);
  },

  async logout(token?: string | null) {
  const config = token 
    ? { headers: { Authorization: `Bearer ${token}` } } 
    : {}; 

  const res = await apiClient.post('/auth/logout', {}, config);
  return res.data;
},
};

export interface ApiResponse<T> {
  message: string;
  error?: string;
  statusCode?: number;
  result?: T; 
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: {
      id: number;
      email: string;
      hoTen: string;
  };
}