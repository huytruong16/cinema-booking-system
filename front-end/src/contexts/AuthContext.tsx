"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import apiClient from '@/lib/apiClient';
import { authService } from "@/lib/api/authService";
import { getMyProfile } from "@/services/user.service";

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
  permissions?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, _setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          _setUser(parsedUser);

          try {
            const profile = await getMyProfile();
            const permissions = profile.NhomNguoiDung?.QuyenNhomNguoiDungs?.map(q => q.Quyen) || [];
            
            const updatedUser = {
              ...parsedUser,
              username: profile.HoTen,
              avatarUrl: profile.AvatarUrl,
              soDienThoai: profile.SoDienThoai,
              permissions: permissions
            };
            _setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
          } catch (err) {
            console.error("Failed to refresh user profile", err);
          }
        }
      } catch (error) {
        console.error("Failed to load auth state from localStorage", error);
      }
      setIsLoading(false);
    };

    initAuth();
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

  const hasPermission = (permission: string) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return user.permissions?.includes(permission) || false;
  };

  const logout = async () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
    }
    router.push("/login");

    try {
      await authService.logout();
      console.log("Đã gọi API logout thành công");
    } catch (error) {
      console.warn("Lỗi API logout:", error);
    }
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
      hasPermission
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