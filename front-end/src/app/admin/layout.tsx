/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import clsx from "clsx";
import React, { useState, useEffect } from "react"; 
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminTopbar from "@/components/layout/AdminTopbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, isLoading } = useAuth(); 
  const router = useRouter();

  const allowedRoles: string[] = ["ADMIN", "NHANVIEN"];

  useEffect(() => {
    if (isLoading) {
      return; 
    }

    if (!user) {    
      router.push("/login"); 
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.push("/"); 
    }

  }, [user, isLoading, router, allowedRoles]); 
  if (isLoading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen bg-[#141414] text-white items-center justify-center">
        <p className="text-md italic">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="dark flex min-h-screen bg-[#141414] text-white overflow-hidden">
      <AdminSidebar open={sidebarOpen} onToggle={setSidebarOpen} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={clsx(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out min-w-0",
          sidebarOpen ? "md:ml-64" : "ml-16"
        )}
      >
        <div className="sticky top-0 z-20 bg-[#141414] flex items-center p-4 pl-12">
          <AdminTopbar />
        </div>

        <main className="flex-1 pl-12 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
