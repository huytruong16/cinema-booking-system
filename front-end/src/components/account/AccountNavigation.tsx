"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, List, History, Bell, User, LogOut , Ticket} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext"; 

const navItems = [
  { href: "/account/profile", label: "Tài khoản", icon: User },
  { href: "/account/tickets", label: "Vé của tôi", icon: Ticket },
  { href: "/account/notifications", label: "Thông báo", icon: Bell },
];

export function AccountNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  
  const { user, logout } = useAuth(); 

  const currentItem = navItems.find((item) => item.href === pathname);

  const handleNavigate = (value: string) => {
    router.push(value);
  };

  const UserProfile = () => (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={user?.avatarUrl || 'https://theselfishmeme.co.uk/wp-content/uploads/2025/10/avatar-mac-dinh-ca-nam-va-nu-26.webp'} alt={user?.username} />
        <AvatarFallback>
          {user?.username?.[0] || user?.username?.[0] || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="text-sm overflow-hidden">
        <p className="font-semibold text-white truncate">
          { user?.username}
        </p>
        <p className="text-gray-400 truncate">{user?.email}</p>
      </div>
    </div>
  );

  const LogoutButton = () => (
    <Button
      variant="ghost"
      className="w-full justify-start text-gray-400 hover:bg-zinc-800 hover:text-white"
      onClick={logout} 
    >
      <LogOut className="w-4 h-4 mr-2" />
      Thoát
    </Button>
  );

  return (
    <>
      {/* desktop */}
      <aside className="hidden lg:flex w-72 flex-shrink-0 bg-zinc-900 text-gray-300 flex-col p-6">
        <h2 className="text-xl font-semibold text-white mb-6">
          Quản lý tài khoản
        </h2>

        {/* Nav Links Desktop */}
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-zinc-800 text-white" // Active
                  : "text-gray-400 hover:bg-zinc-800 hover:text-white",
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout  */}
        <div className="mt-auto space-y-6">
          <UserProfile />
          <LogoutButton />
        </div>
      </aside>

      {/* MOBILE */}
      <div className="lg:hidden w-full bg-zinc-950 px-4 pt-4 md:px-8">
        <Select value={pathname} onValueChange={handleNavigate}>
          <SelectTrigger className="w-full bg-zinc-900 border-zinc-700">
            <SelectValue placeholder="Chọn trang..." asChild>
              <div className="flex items-center gap-3">
                {currentItem?.icon && <currentItem.icon className="w-4 h-4" />}
                <span className="text-white">
                  {currentItem?.label || "Quản lý tài khoản"}
                </span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 text-white border-zinc-700">
            {navItems.map((item) => (
              <SelectItem
                key={item.href}
                value={item.href}
                className="focus:color-mute-foreground"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-gray-400" />
                  {item.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}