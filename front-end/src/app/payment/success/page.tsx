'use client';

import Link from "next/link";
import { CheckCircle2, Home, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1C1C1C] border-zinc-800 text-center shadow-2xl">
        <CardContent className="pt-10 pb-10 px-6 flex flex-col items-center">
          
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 rounded-full"></div>
            <CheckCircle2 className="h-24 w-24 text-green-500 relative z-10" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Thanh toán thành công!</h1>
          <p className="text-zinc-400 mb-8">
            Cảm ơn bạn đã đặt vé tại Movix. Vé của bạn đã được gửi đến email và lưu trong hồ sơ.
          </p>

          <div className="w-full bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 mb-8 text-left">
             <div className="flex justify-between mb-2">
                <span className="text-zinc-500 text-sm">Mã đơn hàng</span>
                <span className="text-white font-mono font-medium">#MVX-{Math.floor(100000 + Math.random() * 900000)}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-zinc-500 text-sm">Phương thức</span>
                <span className="text-white text-sm">Ví MoMo</span>
             </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Link href="/account/tickets" className="w-full">
              <Button className="w-full bg-primary hover:bg-primary/90 h-11">
                <Ticket className="mr-2 h-4 w-4" /> Xem vé của tôi
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white h-11">
                <Home className="mr-2 h-4 w-4" /> Về trang chủ
              </Button>
            </Link>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}