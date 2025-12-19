'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from "next/link";
import { CheckCircle2, Home, Ticket, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const code = searchParams.get('code');
  const id = searchParams.get('id');
  const cancel = searchParams.get('cancel');
  const status = searchParams.get('status');
  const orderCode = searchParams.get('orderCode');

  const isSuccess = code === '00' && status === 'PAID' && cancel === 'false';

  useEffect(() => {
    if (isSuccess) {
      sessionStorage.removeItem('pendingBooking');
    }
  }, [isSuccess]);

  if (isSuccess) {
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
                  <span className="text-white font-mono font-medium">#{orderCode || id?.slice(0, 8)}</span>
               </div>
               <div className="flex justify-between">
                  <span className="text-zinc-500 text-sm">Trạng thái</span>
                  <span className="text-green-500 text-sm font-medium">Đã thanh toán</span>
               </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Link href="/account/tickets" className="w-full">
                <Button className="w-full h-11">
                  <Ticket className="mr-2 h-4 w-4" /> Xem vé của tôi
                </Button>
              </Link>
              <Link href="/" className="w-full">
                <Button variant="destructive" className=" bg-destructive hover:bg-primary w-full h-11">
                  <Home className="mr-2 h-4 w-4" /> Về trang chủ
                </Button>
              </Link>
            </div>

          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1C1C1C] border-zinc-800 text-center shadow-2xl">
        <CardContent className="pt-10 pb-10 px-6 flex flex-col items-center">
          
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 rounded-full"></div>
            <XCircle className="h-24 w-24 text-red-500 relative z-10" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Thanh toán thất bại</h1>
          <p className="text-zinc-400 mb-8">
            Giao dịch đã bị hủy hoặc xảy ra lỗi trong quá trình thanh toán.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <Link href="/payment" className="w-full">
              <Button className="w-full bg-red-600 hover:bg-red-700 h-11">
                Thử lại
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

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#0F0F0F] text-white">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
