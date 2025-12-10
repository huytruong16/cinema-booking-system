/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutGrid,
  Film,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Ticket, 
  Armchair, 
  ShoppingCart,
  Percent, 
  UserCog,
  Book, 
  Database,
  Tags,
  Type,
  Languages,
  Sticker,
  ChevronDown,
  Layers,
  Receipt,
  DollarSign,
  ShieldCheck
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
};

const operationalNavItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutGrid },
  { id: "pos", label: "Bán vé & Soát vé (POS)", href: "/admin/pos", icon: Ticket }, 
  { id: "invoices", label: "Quản lý hoàn vé", href: "/admin/refund-management", icon: Receipt },
  { id: "invoice", label: "Quản lý hóa đơn", href: "/admin/invoice-management", icon: DollarSign }, 
];

const contentManagementNavItems: NavItem[] = [
  { id: "movies", label: "Quản lý phim", href: "/admin/movie-management", icon: Film },
  { id: "versions", label: "Phiên bản phim", href: "/admin/movie-version-management", icon: Layers },
  { id: "showtimes", label: "Quản lý lịch chiếu", href: "/admin/showtime-management", icon: Calendar },
  { id: "rooms", label: "Quản lý phòng chiếu", href: "/admin/room-management", icon: Armchair },
];

const masterDataNavItems: NavItem[] = [
  { id: "genres", label: "Thể loại", href: "/admin/master-data/genre", icon: Tags },
  { id: "formats", label: "Định dạng", href: "/admin/master-data/format", icon: Type },
  { id: "languages", label: "Ngôn ngữ", href: "/admin/master-data/language", icon: Languages },
  { id: "labels", label: "Nhãn phim", href: "/admin/master-data/label", icon: Sticker },
];

const systemManagementNavItems: NavItem[] = [
  { id: "combos", label: "Quản lý Combo", href: "/admin/combo-management", icon: ShoppingCart },
  { id: "promotions", label: "Quản lý khuyến mãi", href: "/admin/promotion-management", icon: Percent },
  { id: "users", label: "Quản lý nhân viên", href: "/admin/user-management", icon: UserCog },
  { id: "report", label: "Báo cáo thống kê", href: "/admin/report", icon: Book },
  { id: "roles", label: "Phân quyền (Roles)", href: "/admin/role-management", icon: ShieldCheck },
];

const NavItemLink = ({ item, active, open, onClick, className }: {
  item: NavItem,
  active: string,
  open: boolean,
  onClick: (id: string) => void,
  className?: string
}) => {
  const { id, label, href, icon: Icon } = item;
  const pathname = usePathname();
  const isActive = id === active || (href !== "/admin" && pathname?.startsWith(href));

  return (
    <li>
      <Link
        href={href}
        onClick={() => onClick(id)}
        title={!open ? label : undefined}
        className={clsx(
          "flex items-center gap-3 w-full text-md rounded-md px-2 py-2 transition-colors duration-150 whitespace-nowrap",
          isActive ? "bg-slate-800 text-white" : "text-slate-200 hover:bg-slate-800",
          className
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        {open && <span className="truncate">{label}</span>}
      </Link>
    </li>
  );
};

const NavGroup = ({ label, icon: Icon, items, active, open, onClick, isExpanded, onToggleExpand }: {
    label: string,
    icon: any,
    items: NavItem[],
    active: string,
    open: boolean,
    onClick: (id: string) => void,
    isExpanded: boolean,
    onToggleExpand: () => void
}) => {
    const hasActiveChild = items.some(i => i.id === active);

    return (
        <li>
            <button
                onClick={onToggleExpand}
                className={clsx(
                    "flex items-center gap-3 w-full text-md rounded-md px-2 py-2 transition-colors duration-150 whitespace-nowrap justify-between group",
                    hasActiveChild ? "text-white bg-slate-800/50" : "text-slate-200 hover:bg-slate-800"
                )}
                title={!open ? label : undefined}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {open && <span className="truncate font-medium">{label}</span>}
                </div>
                {open && (
                    <ChevronDown className={clsx("h-4 w-4 transition-transform duration-200", isExpanded && "rotate-180")} />
                )}
            </button>

            {open && isExpanded && (
                <ul className="mt-1 ml-4 space-y-1 border-l border-slate-700 pl-2">
                    {items.map(item => (
                        <NavItemLink 
                            key={item.id} 
                            item={item} 
                            active={active} 
                            open={open} 
                            onClick={onClick} 
                            className="text-sm py-1.5"
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

interface AdminSidebarProps {
  className?: string;
  avatarUrl?: string;
  userName?: string;
  defaultActive?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  onSelect?: (id: string) => void;
}

export default function AdminSidebar({
  className = "",
  avatarUrl = "/images/placeholder-avatar.png",
  userName = "Administrator",
  defaultActive = "dashboard",
  defaultOpen = true,
  open: openProp,
  onToggle,
  onSelect,
}: AdminSidebarProps) {

  const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen);
  const open = typeof openProp === "boolean" ? openProp : internalOpen;
 
  const [isMasterDataExpanded, setIsMasterDataExpanded] = useState(false);

  const [active, setActive] = useState<string>(defaultActive);
  const pathname = usePathname();

  const { user, logout } = useAuth();
  const role = user?.role; 

  const visibleOperationalNavItems = useMemo(() => operationalNavItems, []);
  const visibleContentManagementNavItems = useMemo(() => role === "ADMIN" ? contentManagementNavItems : [], [role]);
  
  const visibleMasterDataNavItems = useMemo(() => role === "ADMIN" ? masterDataNavItems : [], [role]); 
  
  const visibleSystemManagementNavItems = useMemo(() => role === "ADMIN" ? systemManagementNavItems : [], [role]);

  useEffect(() => {
    if (!pathname) return;
    
    const allVisibleNavItems = [
      ...visibleOperationalNavItems, 
      ...visibleContentManagementNavItems, 
      ...visibleMasterDataNavItems, 
      ...visibleSystemManagementNavItems
    ];

    const matched = allVisibleNavItems.find((n) => {
      if (n.href === "/admin") return pathname === "/admin" || pathname === "/admin/";
      return pathname.startsWith(n.href);
    });
    
    if (matched) {
        setActive(matched.id);
        if (visibleMasterDataNavItems.some(i => i.id === matched.id)) {
            setIsMasterDataExpanded(true);
        }
    }
  }, [pathname, visibleOperationalNavItems, visibleContentManagementNavItems, visibleMasterDataNavItems, visibleSystemManagementNavItems]); 

  const [showLabels, setShowLabels] = useState<boolean>(open);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    if (open) {
      t = setTimeout(() => setShowLabels(true), 160); 
    } else {
      setShowLabels(false);
      setIsMasterDataExpanded(false); 
    }
    return () => t && clearTimeout(t);
  }, [open]);

  const handleToggle = () => {
    if (typeof openProp === "boolean") {
      onToggle?.(!openProp);
    } else {
      setInternalOpen((v) => {
        const next = !v;
        onToggle?.(next);
        return next;
      });
    }
  };

  const handleSelect = (id: string) => {
    setActive(id);
    onSelect?.(id);
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Đăng xuất thành công!");
  };

  const currentUserName = user?.username || userName;
  const currentUserAvatar = (user as any)?.avatarUrl || avatarUrl; 
  const userFallback = currentUserName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const roleDisplayName = role === "ADMIN" ? "Administrator" : (role === "NHANVIEN" ? "Nhân viên" : "Guest");

  return (
    <aside
      className={clsx(
        "fixed top-0 left-0 h-screen bg-[#262626] text-white flex flex-col p-4 border-r border-slate-800 z-40 transition-all duration-300 ease-in-out",
        open ? "w-64" : "w-18",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={currentUserAvatar} alt={currentUserName} />
            <AvatarFallback>{userFallback}</AvatarFallback>
          </Avatar>
          {showLabels && (
            <div className="overflow-hidden transition-opacity duration-150 flex-1">
              <div className="text-md font-medium whitespace-nowrap truncate">{currentUserName}</div>
              <div className="text-sm text-slate-300 whitespace-nowrap">{roleDisplayName}</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 flex-1 overflow-y-auto no-scrollbar">
        <ul className="flex flex-col gap-1">
        
          {showLabels && <li className="px-2 py-2 text-xs font-semibold text-slate-400 uppercase">Nghiệp vụ</li>}
          {visibleOperationalNavItems.map((item) => (
            <NavItemLink key={item.id} item={item} active={active} open={showLabels} onClick={handleSelect} />
          ))}

          {visibleContentManagementNavItems.length > 0 && (
            <>
              {showLabels && <li className="px-2 py-2 text-xs font-semibold text-slate-400 uppercase mt-3">Quản lý Nội dung</li>}
              {!showLabels && <div className="my-2 h-px bg-slate-700" />}
              {visibleContentManagementNavItems.map((item) => (
                <NavItemLink key={item.id} item={item} active={active} open={showLabels} onClick={handleSelect} />
              ))}
            </>
          )}

          {/* Khu vực Danh mục chung */}
          {visibleMasterDataNavItems.length > 0 && (
             <>
                {showLabels && <li className="px-2 py-2 text-xs font-semibold text-slate-400 uppercase mt-3">Danh mục</li>}
                {!showLabels && <div className="my-2 h-px bg-slate-700" />}
                <NavGroup 
                    label="Danh mục chung" 
                    icon={Database} 
                    items={visibleMasterDataNavItems}
                    active={active}
                    open={showLabels}
                    onClick={handleSelect}
                    isExpanded={isMasterDataExpanded}
                    onToggleExpand={() => {
                        if (!showLabels) {
                            handleToggle(); 
                            setTimeout(() => setIsMasterDataExpanded(true), 200);
                        } else {
                            setIsMasterDataExpanded(!isMasterDataExpanded);
                        }
                    }}
                />
             </>
          )}

          {visibleSystemManagementNavItems.length > 0 && (
            <>
              {showLabels && <li className="px-2 py-2 text-xs font-semibold text-slate-400 uppercase mt-3">Hệ thống</li>}
              {!showLabels && <div className="my-2 h-px bg-slate-700" />}
              {visibleSystemManagementNavItems.map((item) => (
                <NavItemLink key={item.id} item={item} active={active} open={showLabels} onClick={handleSelect} />
              ))}
            </>
          )}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto">
        <div className="my-4 h-px bg-slate-700" />
        <Button variant="ghost" className="w-full justify-start gap-3 text-white hover:bg-red-600 hover:text-white" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          {showLabels && <span>Đăng xuất</span>}
        </Button>
      </div>

      <Button variant="secondary" size="icon" onClick={handleToggle} className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 rounded-full shadow-md bg-slate-800 hover:bg-slate-700 border border-slate-600">
        {open ? <ChevronLeft className="h-4 w-4 text-white" /> : <ChevronRight className="h-4 w-4 text-white" />}
      </Button>
    </aside>
  );
}