"use client"; 

import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  if (pathname && (pathname.startsWith("/admin") || pathname.startsWith("/kiosk"))) {
    return null;
  }

  return <Footer />;
}