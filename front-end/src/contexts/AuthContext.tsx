"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import apiClient from '@/lib/apiClient';

type VaiTro = "KHACHHANG" | "NHANVIEN" | "ADMIN";

type TrangThaiNguoiDung = "CHUAKICHHOAT" | "CONHOATDONG" | "KHONGHOATDONG";

interface AuthUser {
  id: number; 
  username: string; 
  email: string; 
  role: VaiTro; 
  trangThai: TrangThaiNguoiDung;
  soDienThoai?: string | null; 
  avatarUrl?: string | null; 
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, _setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        _setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load auth state from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  const setUser = (newUser: AuthUser | null) => {
    _setUser(newUser);
    if (typeof window !== 'undefined') {
      if (newUser) {
        localStorage.setItem("user", JSON.stringify(newUser));
      } else {
        localStorage.removeItem("user");
      }
    }
  };

  const login = (user: AuthUser) => {
    setUser(user);    
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout", {});
    } catch (error) {
        console.error("Lỗi khi gọi API logout, nhưng vẫn đăng xuất client", error);
    }
    setUser(null);   
    router.push("/");
  };
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      isLoggedIn, 
      setUser, 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};