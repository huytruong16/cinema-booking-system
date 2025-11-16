"use client";

import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, MoreVertical } from "lucide-react";

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

  return (
    <header className="w-full flex items-center justify-between gap-4 py-3 px-2 md:px-0 bg-[#262626] mb-5 rounded-md">
      <div className="flex-1 flex px-10 font-semibold text-xl gap-4">
        Trình quản lý Admin
      </div>

      <div className="flex items-center gap-3">
        {/* Notification */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            className="p-2 relative"
            onClick={() => setOpen((s) => !s)}
            aria-expanded={open}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center rounded-full bg-rose-500 text-[10px] font-medium leading-none px-1.5 py-0.5">
                {unreadCount}
              </span>
            )}
          </Button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0b0b0c] border border-slate-800 rounded-md shadow-lg z-50">
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Thông báo</div>
                  <button
                    className="text-xs text-slate-400 hover:text-white"
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    Đánh dấu đã đọc
                  </button>
                </div>

                <div className="mt-2 max-h-56 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-sm text-slate-400 py-4 text-center">Không có thông báo</div>
                  ) : (
                    <ul className="flex flex-col">
                      {notifications.map((n) => (
                        <li
                          key={n.id}
                          className={`px-2 py-2 rounded-md hover:bg-slate-800 flex items-start gap-2 ${
                            n.read ? "opacity-70" : "bg-slate-900"
                          }`}
                        >
                          <div className="flex-1">
                            <div className="text-sm">{n.title}</div>
                            {n.time && <div className="text-xs text-slate-500">{n.time}</div>}
                          </div>
                          <div>
                            <button className="text-xs text-slate-400">x</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-medium">{userName}</span>
            <span className="text-xs text-slate-400">Administrator</span>
          </div>
          <Avatar>
            <AvatarImage src={avatarUrl} alt={userName} />
            <AvatarFallback>NK</AvatarFallback>
          </Avatar>

          <Button variant="ghost" className="p-2 hidden md:inline-flex mr-2">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
