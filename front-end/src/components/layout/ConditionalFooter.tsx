"use client"; 

import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  if (
    pathname &&
    (pathname.startsWith("/admin") ||
      pathname.startsWith("/kiosk") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/signup") ||
      pathname.startsWith("/forget-password") ||
      pathname.startsWith("/reset-password") ||
      pathname.startsWith("/email-verification"))
  ) {
    return null;
  }

  return <Footer />;
}