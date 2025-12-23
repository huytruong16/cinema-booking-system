import Link from 'next/link';
import { Printer, Ticket } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function KioskHomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <div className="grid gap-6 w-full max-w-4xl grid-cols-1 md:grid-cols-2">
        <Link href="/kiosk/print" className="group">
          <Card className="h-full bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer group-hover:border-primary/50">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-6 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                <Printer className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="text-2xl text-white">In Vé Đã Đặt</CardTitle>
              <CardDescription>Dành cho khách hàng đã đặt vé online</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="#" className="group cursor-not-allowed opacity-50">
          <Card className="h-full bg-zinc-900 border-zinc-800">
            <CardHeader className="text-center">
              <div className="mx-auto bg-zinc-800 p-6 rounded-full mb-4">
                <Ticket className="w-12 h-12 text-zinc-500" />
              </div>
              <CardTitle className="text-2xl text-zinc-400">Mua Vé Tự Động</CardTitle>
              <CardDescription>Tính năng đang phát triển</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
