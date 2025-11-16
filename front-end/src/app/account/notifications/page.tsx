"use client";

import React, { useState, useEffect } from "react";
import { Bell, Film, AlertTriangle, KeyRound, Check, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types/notification"; 
import { Skeleton } from "@/components/ui/skeleton";

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "new_comment",
    title: "Bình luận mới",
    message: "Huy Lê đã bình luận về phim John Wick 4.",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    link: "/movies/john-wick-4",
    actor: {
      name: "Huy Lê",
      avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    },
  },
  {
    id: "2",
    type: "favorite_added",
    title: "Đã thêm vào yêu thích",
    message: "Bạn đã thêm Interstellar vào danh sách yêu thích của mình.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 giờ trước
    isRead: false,
    link: "/account/favorites",
    actor: {
      name: "Interstellar",
      avatarUrl:
        "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    },
  },
  {
    id: "3",
    type: "new_login",
    title: "Đăng nhập mới",
    message: "Phát hiện đăng nhập mới từ thiết bị Chrome trên Windows.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 ngày trước
    isRead: true,
    link: "/account/profile",
  },
  {
    id: "4",
    type: "system_alert",
    title: "Bảo trì hệ thống",
    message: "Hệ thống sẽ bảo trì vào lúc 3:00 AM. Vui lòng quay lại sau.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), 
    isRead: true,
  },
    {
    id: "5",
    type: "new_comment",
    title: "Bình luận mới",
    message: "Một người dùng khác đã trả lời bình luận của bạn.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), 
    isRead: true,
    link: "/movies/john-wick-4",
  },
];


function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " năm trước";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " tháng trước";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ngày trước";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ trước";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " phút trước";
  return Math.floor(seconds) + " giây trước";
}

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  const className = "w-5 h-5";
  switch (type) {
    case "new_comment":
      return <Film className={cn(className, "text-blue-400")} />;
    case "favorite_added":
      return <Film className={cn(className, "text-red-400")} />;
    case "new_login":
      return <KeyRound className={cn(className, "text-yellow-400")} />;
    case "system_alert":
      return <AlertTriangle className={cn(className, "text-orange-400")} />;
    default:
      return <Bell className={cn(className, "text-gray-400")} />;
  }
};

const NotificationItem = ({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick: (notification: Notification) => void;
}) => (
  <div
    className={cn(
      "flex items-start gap-4 p-4 border-b border-zinc-800 cursor-pointer",
      !notification.isRead
        ? "bg-zinc-800/30 hover:bg-zinc-800/60"
        : "hover:bg-zinc-800/60"
    )}
    onClick={() => onClick(notification)}
  >
    {/* Icon/Avatar */}
    <div className="w-11 h-11 flex-shrink-0">
      {notification.actor ? (
        <Avatar className="w-11 h-11">
          <AvatarImage
            src={notification.actor.avatarUrl}
            alt={notification.actor.name}
          />
          <AvatarFallback>{notification.actor.name[0]}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-11 h-11 rounded-full bg-zinc-700 flex items-center justify-center">
          <NotificationIcon type={notification.type} />
        </div>
      )}
    </div>

    {/* Content */}
    <div className="flex-1 min-w-0">
      <p
        className={cn(
          "text-base font-medium",
          !notification.isRead ? "text-white" : "text-gray-300"
        )}
      >
        {notification.title}
      </p>
      <p
        className={cn(
          "text-sm text-gray-400 mt-1",
          !notification.isRead && "text-gray-300"
        )}
      >
        {notification.message}
      </p>
      <p
        className={cn(
          "text-sm mt-2",
          !notification.isRead ? "text-red-400 font-medium" : "text-gray-500"
        )}
      >
        {formatTimeAgo(notification.createdAt)}
      </p>
    </div>

    {/* Read Dot */}
    {!notification.isRead && (
      <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 self-center" />
    )}
  </div>
);

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [isLoading, setIsLoading] = useState(false); 
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const router = useRouter();

  // useEffect(() => {
  //   setIsLoading(true);
  //   apiClient.get('/notifications') // Fetch all notifications
  //     .then(res => setNotifications(res.data))
  //     .catch(err => console.error("Failed to fetch notifications", err))
  //     .finally(() => setIsLoading(false));
  // }, []);

  const handleNotificationClick = (notification: Notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
    );

    // Điều hướng
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.isRead : true
  );

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Thông báo</h1>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
            Cài đặt
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300"
            onClick={markAllAsRead}
          >
            <Check className="w-4 h-4 mr-2" />
            Đọc tất cả
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={filter === "all" ? "default" : "secondary"}
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full",
            filter === "all"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
          )}
        >
          Tất cả
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "secondary"}
          onClick={() => setFilter("unread")}
          className={cn(
            "rounded-full",
            filter === "unread"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
          )}
        >
          Chưa đọc
        </Button>
      </div>

      {/* Notification List */}
      <div className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
        {isLoading ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-20 w-full bg-zinc-800" />
            <Skeleton className="h-20 w-full bg-zinc-800" />
            <Skeleton className="h-20 w-full bg-zinc-800" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center text-gray-400">
            <Bell className="w-12 h-12" />
            <p className="mt-4 text-lg">
              {filter === "unread"
                ? "Bạn không có thông báo chưa đọc."
                : "Không có thông báo nào."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {filteredNotifications.map((noti) => (
              <NotificationItem
                key={noti.id}
                notification={noti}
                onClick={handleNotificationClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}