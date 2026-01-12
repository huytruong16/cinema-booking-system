/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import { Search, X, User, Ticket, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

const AUTH_PATHS = [
  '/login',
  '/signup',
  '/forget-password',
  '/reset-password',
  '/email-verification'
];
const ADMIN_PREFIX = '/admin';
const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  if (AUTH_PATHS.includes(pathname) || pathname.startsWith(ADMIN_PREFIX) || pathname.startsWith('/kiosk')) {
    return null;
  }
  const navItems = [
    { title: 'Trang chủ', href: '/' },
    { title: 'Tìm & Lọc', href: '/filter' },
    { title: 'Lịch chiếu', href: '/showtimes' },
    { title: 'Ưu đãi', href: '/promotions' },
  ];

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchText.trim()) {
      router.push(`/filter?q=${encodeURIComponent(searchText.trim())}`);
      setSearchText("");
      setIsMenuOpen(false);
    }
  };

  const getActiveItem = () => {
    if (pathname === '/') return 'Trang chủ';
    if (pathname === '/filter') return 'Tìm & Lọc';
    if (pathname === '/showtimes') return 'Lịch chiếu';
    return '';
  };
  const activeItem = getActiveItem();

  const renderNavItem = (item: { title: string; href: string }) => {
    const isActive = (item.title === activeItem);
    const commonClasses = "px-4 py-2 text-sm rounded-md transition-colors duration-200";
    const activeClasses = "bg-black text-white";
    const inactiveClasses = "text-gray-400 hover:text-white hover:bg-transparent";

    return (
      <Link
        key={item.title}
        href={item.href}
        className={`${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}
      >
        {item.title}
      </Link>
    );
  };

  const UserDropdown = ({ isMobile = false }: { isMobile?: boolean }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`relative rounded-full ${isMobile ? 'h-9 w-9' : 'h-10 w-10'}`}>
          <Avatar className={isMobile ? 'h-9 w-9' : 'h-10 w-10'}>
            <AvatarImage src={user?.avatarUrl || 'https://theselfishmeme.co.uk/wp-content/uploads/2025/10/avatar-mac-dinh-ca-nam-va-nu-26.webp'} alt={user?.username} />
            <AvatarFallback>
              {user?.username ? user.username[0].toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-zinc-900 border-zinc-700 text-white"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.username}</p>
            <p className="text-xs leading-none text-zinc-400">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-700" />
        <DropdownMenuItem
          className="cursor-pointer hover:!bg-zinc-800 focus:!bg-zinc-800"
          onClick={() => router.push('/account/profile')}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Hồ sơ</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer hover:!bg-zinc-800 focus:!bg-zinc-800"
          onClick={() => router.push('/account/tickets')}
        >
          <Ticket className="mr-2 h-4 w-4" />
          <span>Vé của tôi</span>
        </DropdownMenuItem>
        {(user?.role === "ADMIN" || user?.role === "NHANVIEN") && (
          <DropdownMenuItem
            className="cursor-pointer hover:!bg-zinc-800 focus:!bg-zinc-800"
            onClick={() => router.push('/admin')}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Trang Admin</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-zinc-700" />
        <DropdownMenuItem
          className="cursor-pointer hover:!bg-red-600/20 focus:!bg-red-600/20 text-red-400 focus:!text-red-400"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const LoginButton = ({ isMobile = false }: { isMobile?: boolean }) => (
    <Button
      onClick={() => router.push('/login')}
      className={`bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium ${isMobile ? 'px-3 py-1.5' : 'px-4 py-2'}`}
    >
      Đăng nhập
    </Button>
  );

  return (
    <>
      <nav className="bg-[#0F0F0F] text-white flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-800">
        {/* Logo & Nav (Trái) */}
        <div className="flex items-center space-x-4 md:space-x-8">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
            <Image
              src="/images/logo_mini.png"
              alt="Movix Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-xl md:text-2xl font-bold">Movix</span>
          </Link>

          <div className="hidden md:flex items-center bg-[#1A1A1A] rounded-lg px-2 py-1">
            {navItems.map(item => renderNavItem(item))}
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <Input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleSearchSubmit}
              placeholder="Tìm kiếm phim..."
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md pl-11 pr-9 h-10 w-72 text-sm"
            />
            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 z-10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {isLoggedIn ? <UserDropdown /> : <LoginButton />}
        </div>

        {/* Auth & Menu (Mobile) (Phải) */}
        <div className="md:hidden">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push('/filter')}>
              <Search className="h-6 w-6" />
            </Button>

            {isLoggedIn ? <UserDropdown isMobile /> : <LoginButton isMobile />}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden bg-[#1A1A1A] px-4 py-3 space-y-2 border-t border-gray-800">
          {navItems.map(item => {
            const isActive = (item.title === activeItem);
            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block text-sm px-3 py-2 rounded-md ${isActive
                  ? 'bg-red-600 text-white'
                  : 'text-gray-300 hover:bg-[#2A2A2A]'
                  }`}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Navbar;