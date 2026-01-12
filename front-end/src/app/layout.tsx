import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";
import NavBar from "@/components/layout/NavBar";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movix - Rạp chiếu phim hàng đầu UIT",
  description: "Movix- Rạp chiếu phim hàng đầu UIT",
  icons: {
    icon: "/images/logo_mini.png",
    shortcut: "/images/logo_mini.png",
    apple: "/images/logo_mini.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <NavBar />
          {children}
          <Toaster />
          <ConditionalFooter />
        </AuthProvider>


      </body>
    </html>
  );
}
