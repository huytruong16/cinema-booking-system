'use client';
import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Ticket, ArrowLeft, CheckCircle2, XCircle, Loader2, QrCode, Clock, Film, Utensils } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { mockPromotions } from '@/lib/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function PaymentContent() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<typeof mockPromotions[0] | null>(null);
  const [promoError, setPromoError] = useState("");

  const [showQRModal, setShowQRModal] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const loadData = () => {
      try {
        const data = sessionStorage.getItem('pendingBooking');
        if (!data) {
          toast.error("Dữ liệu đặt vé không tồn tại hoặc đã hết hạn.");
          setTimeout(() => router.push('/'), 1000);
          return;
        }
        setBookingData(JSON.parse(data));
      } catch (e) {
        console.error("Lỗi đọc dữ liệu:", e);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(loadData, 100);
    return () => clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showQRModal && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (showQRModal && countdown === 0) {
      toast.success("Thanh toán thành công!");
      sessionStorage.removeItem('pendingBooking'); 
      router.push('/payment/success');
    }
    return () => clearInterval(interval);
  }, [showQRModal, countdown, router]);

  const handleApplyPromo = () => {
    setPromoError("");
    const promo = mockPromotions.find(p => p.code.toUpperCase() === promoCode.toUpperCase());
    
    if (!promo) {
      setPromoError("Mã không hợp lệ.");
      setAppliedPromo(null);
      return;
    }
    if (promo.minOrder && bookingData && bookingData.totalPrice < promo.minOrder) {
      setPromoError(`Đơn tối thiểu ${promo.minOrder.toLocaleString('vi-VN')}đ.`);
      setAppliedPromo(null);
      return;
    }
    setAppliedPromo(promo);
    toast.success("Áp dụng mã thành công!");
  };

  const finalPrice = useMemo(() => {
    if (!bookingData) return 0;
    let discount = 0;
    if (appliedPromo) {
      if (appliedPromo.type === 'PERCENT') {
        discount = (bookingData.totalPrice * appliedPromo.value) / 100;
        if (appliedPromo.maxDiscount) discount = Math.min(discount, appliedPromo.maxDiscount);
      } else {
        discount = appliedPromo.value;
      }
    }
    return Math.max(0, bookingData.totalPrice - discount);
  }, [bookingData, appliedPromo]);

  const discountAmount = bookingData ? bookingData.totalPrice - finalPrice : 0;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0F0F0F] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Đang tải thông tin thanh toán...</span>
      </div>
    );
  }

  if (!bookingData) return null;

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>

        <h1 className="text-3xl font-bold mb-8">Xác nhận thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            <Card className="bg-[#1C1C1C] border-zinc-800 overflow-hidden relative group">
               {/* Hiệu ứng nền nhẹ */}
               <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none"></div>

               <div className="flex flex-col sm:flex-row">
                  {/* Ảnh Poster */}
                  <div className="relative w-full sm:w-48 h-64 sm:h-auto shrink-0">
                      <Image 
                          src={bookingData.movie.posterUrl} 
                          alt={bookingData.movie.title} 
                          fill 
                          className="object-cover"
                      />
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col relative z-10">
                      <div className="mb-4">
                          <h2 className="text-3xl font-bold text-white mb-1 leading-tight">{bookingData.movie.title}</h2>
                          <div className="flex flex-wrap gap-2 text-sm mt-2">
                             <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">{bookingData.movie.ageRating || "T18"}</Badge>
                             <Badge variant="outline" className="border-zinc-700 text-zinc-400">{bookingData.format}</Badge>
                          </div>
                      </div>

                      <Separator className="bg-zinc-800 mb-5" />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* Suất chiếu */}
                          <div>
                              <span className="text-zinc-500 text-xs uppercase tracking-wider font-bold block mb-1.5">Thời gian</span>
                              <div className="flex items-center gap-2.5">
                                   <div className="bg-zinc-800 p-2 rounded-md"><Clock className="w-4 h-4 text-zinc-300" /></div>
                                   <div>
                                     <span className="block text-white font-semibold text-lg">{bookingData.time}</span>
                                     <span className="block text-zinc-400 text-xs">{bookingData.date}</span>
                                   </div>
                              </div>
                          </div>

                          {/* Phòng chiếu */}
                          <div>
                              <span className="text-zinc-500 text-xs uppercase tracking-wider font-bold block mb-1.5">Phòng chiếu</span>
                               <div className="flex items-center gap-2.5">
                                   <div className="bg-zinc-800 p-2 rounded-md"><Film className="w-4 h-4 text-zinc-300" /></div>
                                   <span className="text-white font-medium text-lg">{bookingData.roomName || "Phòng 1"}</span>
                              </div>
                          </div>

                           {/* Ghế (Highlight) */}
                          <div className="sm:col-span-2 bg-primary/10 border border-primary/20 rounded-lg p-4">
                              <span className="text-primary text-xs uppercase tracking-wider font-bold block mb-2">Ghế đã chọn</span>
                              <div className="flex items-center gap-3">
                                   <Ticket className="w-6 h-6 text-primary" />
                                   <span className="text-white text-2xl font-bold tracking-wide">
                                     {bookingData.seats.map((s: any) => s.id).join(', ')}
                                   </span>
                              </div>
                          </div>
                          {bookingData.combos && bookingData.combos.length > 0 && (
                              <div className="sm:col-span-2">
                                   <span className="text-zinc-500 text-xs uppercase tracking-wider font-bold block mb-2">Combo bắp nước</span>
                                   <div className="flex flex-wrap gap-3">
                                      {bookingData.combos.map((combo: any) => (
                                          <div key={combo.id} className="flex items-center gap-2 bg-zinc-800/60 rounded-full pl-3 pr-4 py-1.5 border border-zinc-700">
                                              <Utensils className="w-3.5 h-3.5 text-yellow-500" />
                                              <span className="text-sm text-zinc-200">
                                                  <span className="font-bold text-white mr-1">{combo.quantity}x</span> 
                                                  {combo.name}
                                              </span>
                                          </div>
                                      ))}
                                   </div>
                              </div>
                          )}
                      </div>
                  </div>
               </div>
            </Card>

            <Card className="bg-[#1C1C1C] border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Ticket className="h-4 w-4 text-primary" /> Mã khuyến mãi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input 
                    placeholder="Nhập mã giảm giá" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white uppercase"
                  />
                  <Button onClick={handleApplyPromo} disabled={!promoCode} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700">
                    Áp dụng
                  </Button>
                </div>
                {promoError && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><XCircle className="h-3 w-3"/> {promoError}</p>}
                {appliedPromo && (
                  <div className="mt-3 bg-green-900/20 border border-green-500/30 rounded-md p-3 flex justify-between items-center">
                    <div className="text-green-400 text-sm flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4"/> 
                      <span>Đã giảm: <strong>{discountAmount.toLocaleString('vi-VN')}đ</strong> ({appliedPromo.code})</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-zinc-400 hover:text-white" onClick={() => { setAppliedPromo(null); setPromoCode(""); }}>Xóa</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
                
                {bookingData.customerInfo && (
                    <Card className="bg-[#1C1C1C] border-zinc-800">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-400">Thông tin nhận vé</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-1">
                            <p><span className="text-zinc-500">Họ tên:</span> <span className="text-white font-medium">{bookingData.customerInfo.name}</span></p>
                            <p><span className="text-zinc-500">Email:</span> <span className="text-white">{bookingData.customerInfo.email}</span></p>
                            <p><span className="text-zinc-500">SĐT:</span> <span className="text-white">{bookingData.customerInfo.phone}</span></p>
                        </CardContent>
                    </Card>
                )}

                <Card className="bg-[#1C1C1C] border-zinc-800 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-white">Chi tiết thanh toán</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm text-zinc-400">
                            <span>Tổng tiền vé</span>
                            <span className="text-white">{bookingData.seats.reduce((t: number, s: any) => t + s.price, 0).toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="flex justify-between text-sm text-zinc-400">
                            <span>Tổng tiền Combo</span>
                            <span className="text-white">{bookingData.combos.reduce((t: number, c: any) => t + (c.price * c.quantity), 0).toLocaleString('vi-VN')}đ</span>
                        </div>
                        
                        {appliedPromo && (
                            <div className="flex justify-between text-sm text-green-500">
                                <span>Giảm giá</span>
                                <span>- {discountAmount.toLocaleString('vi-VN')}đ</span>
                            </div>
                        )}
                        
                        <Separator className="bg-zinc-800 my-2" />
                        
                        <div className="flex justify-between items-end">
                            <span className="text-zinc-300 font-medium">Thành tiền</span>
                            <span className="text-3xl font-bold text-primary">{finalPrice.toLocaleString('vi-VN')}đ</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            className="w-full h-12 text-lg bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-900/20"
                            onClick={() => { setCountdown(30); setShowQRModal(true); }}
                        >
                            Thanh toán ngay
                        </Button>
                    </CardFooter>
                </Card>
            </div>
          </div>

        </div>
        <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
            <DialogContent className="bg-[#1C1C1C] border-zinc-800 text-white sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-center text-xl">Quét mã thanh toán</DialogTitle>
                    <DialogDescription className="text-center text-zinc-400">
                        Tự động chuyển trang sau khi hoàn tất
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex flex-col items-center justify-center space-y-6 py-4">
                    {/* QR Code */}
                    <div className="bg-white p-4 rounded-xl shadow-white/5 shadow-2xl relative group">
                        <Image 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=Movix_Pay_${finalPrice}`} 
                            alt="Payment QR" 
                            width={220} 
                            height={220} 
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-xl">
                            <QrCode className="text-black w-10 h-10" />
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="flex flex-col items-center space-y-2">
                        <div className="text-3xl font-bold text-primary">{finalPrice.toLocaleString('vi-VN')} ₫</div>
                        <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20">
                            <Clock className="h-4 w-4 animate-pulse" />
                            <span className=" font-bold">
                                Còn lại: {countdown}s
                            </span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#0F0F0F] text-white">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}