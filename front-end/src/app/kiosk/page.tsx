import Link from 'next/link';
import { Printer, Ticket } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function KioskHomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <div className=" gap-6 w-full max-w-4xl ">
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
      </div>
    </div>
  );
}
