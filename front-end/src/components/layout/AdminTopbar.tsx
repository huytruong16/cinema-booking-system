"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, MoreVertical, LogOut, Home, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotificationItem {
  id: string;
  title: string;
  time?: string;
  read?: boolean;
}

interface AdminTopbarProps {
  userName?: string;
  avatarUrl?: string;
  notifications?: NotificationItem[];
}

export default function AdminTopbar({
  userName = "Nguyễn Quang Khải",
  avatarUrl = "/images/placeholder-avatar.png",
  notifications = [],
}: AdminTopbarProps) {
  const [open, setOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  const displayName = user?.username || userName;
  const displayAvatar = user?.avatarUrl || avatarUrl;

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (logout) await logout();
    router.push('/login');
  };

  return (
    <header className="w-full flex items-center justify-between gap-4 py-3 px-2 md:px-0 bg-[#262626] mb-5 rounded-md">
      <div className="flex-1 flex px-10 font-semibold text-xl gap-4">
        Trình quản lý Admin
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-xs text-slate-400">Administrator</span>
              </div>
              <Avatar>
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" className="p-2 hidden md:inline-flex mr-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-56 bg-[#1C1C1C] border-slate-800 text-slate-200 mr-4" align="end">
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-800" />
            
            <DropdownMenuItem 
              onClick={() => router.push('/')}
              className="cursor-pointer focus:bg-slate-800 focus:text-white"
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Về trang chủ</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800" />
            
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}