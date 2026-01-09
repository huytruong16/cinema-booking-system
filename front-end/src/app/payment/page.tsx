'use client';
import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Ticket, ArrowLeft, CheckCircle2, XCircle, Loader2, QrCode, Clock, Film, Utensils, Tag, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { promotionService } from '@/services/promotion.service';
import { voucherService } from '@/services/voucher.service';
import { invoiceService } from '@/services/invoice.service';
import { transactionService } from '@/services/transaction.service';
import { UserPromotion } from '@/types/promotion';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

function PaymentContent() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [bookingData, setBookingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  

  const [myVouchers, setMyVouchers] = useState<UserPromotion[]>([]);
  const [selectedVouchers, setSelectedVouchers] = useState<UserPromotion[]>([]);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [isCheckingCode, setIsCheckingCode] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [waitingCountdown, setWaitingCountdown] = useState(600); // 10 minutes

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

  const refreshVouchers = async () => {
    if (isLoggedIn) {
      try {
        const data = await promotionService.getMyPromotions();
        const available = data.filter(v => v.status === 'ACTIVE' && !v.isUsed);
        setMyVouchers(available);
      } catch (error) {
        console.error("Failed to load vouchers", error);
      }
    }
  };

  useEffect(() => {
    refreshVouchers();
  }, [isLoggedIn]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showWaitingModal && waitingCountdown > 0) {
      interval = setInterval(() => {
        setWaitingCountdown((prev) => prev - 1);
      }, 1000);
    } else if (showWaitingModal && waitingCountdown === 0) {
      setShowWaitingModal(false);
      toast.error("Hết thời gian thanh toán.");
    }
    return () => clearInterval(interval);
  }, [showWaitingModal, waitingCountdown]);

  useEffect(() => {
    if (!showWaitingModal || !transactionId) return;

    const checkStatus = async () => {
      try {
        const transaction = await transactionService.getById(transactionId);
        if (transaction.TrangThai === 'THANHCONG') {
          toast.success("Thanh toán thành công!");
          sessionStorage.removeItem('pendingBooking');
          router.push('/payment/success');
        } else if (transaction.TrangThai === 'THATBAI' || transaction.TrangThai === 'HUY') {
          toast.error("Thanh toán thất bại hoặc bị hủy.");
          setShowWaitingModal(false);
        }
      } catch (error) {
        console.error("Error checking transaction status:", error);
      }
    };

    const interval = setInterval(checkStatus, 3000); 
    return () => clearInterval(interval);
  }, [showWaitingModal, transactionId, router]);

  const handlePayment = async () => {
    if (!bookingData) return;
    setIsProcessing(true);

    try {
      // Validate data integrity
      const invalidSeats = bookingData.seats.filter((s: any) => !s.uuid);
      if (invalidSeats.length > 0) {
        toast.error("Dữ liệu ghế không hợp lệ. Vui lòng đặt lại vé.");
        return;
      }

      // Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!bookingData.customerInfo.email || !emailRegex.test(bookingData.customerInfo.email)) {
        toast.error("Email không hợp lệ. Vui lòng kiểm tra lại thông tin.");
        return;
      }

      const payload = {
        Email: bookingData.customerInfo.email,
        LoaiGiaoDich: "TRUCTUYEN" as const,
        MaGheSuatChieus: bookingData.seats.map((s: any) => s.uuid),
        Combos: bookingData.combos ? bookingData.combos.map((c: any) => ({
          MaCombo: c.id,
          SoLuong: c.quantity
        })) : [],
        MaVouchers: selectedVouchers.map(v => v.userPromotionId)
      };

      console.log("Sending payment payload:", payload);

      const res: any = await invoiceService.create(payload);
      
      if (res.GiaoDichUrl) {
        setTransactionId(res.MaGiaoDich);
        window.location.href = res.GiaoDichUrl;
        setShowWaitingModal(true);
        setWaitingCountdown(600);
      } else {
        toast.error("Không nhận được đường dẫn thanh toán.");
      }

    } catch (error: any) {
      console.error("Payment error:", error);
      const message = error?.response?.data?.message || "Có lỗi xảy ra khi tạo giao dịch.";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveCode = async () => {
    if (!inputCode.trim()) return;
    setIsCheckingCode(true);
    try {
        const voucher = await voucherService.getByCode(inputCode);
        if (voucher) {
             const exists = myVouchers.find(v => v.id === voucher.MaKhuyenMai);
             if (exists) {
                 toast.info("Bạn đã lưu voucher này rồi.");
                 return;
             }
             await promotionService.savePromotion(voucher.MaKhuyenMai);
             toast.success("Lưu voucher thành công!");
             setInputCode("");
             await refreshVouchers();
        } else {
            toast.error("Mã khuyến mãi không tồn tại.");
        }
    } catch (error: any) {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
        toast.error((error as any).response?.data?.message || "Lỗi khi lưu mã.");
    } finally {
        setIsCheckingCode(false);
    }
  };

  const toggleVoucher = (voucher: UserPromotion) => {
    const isSelected = selectedVouchers.find(v => v.userPromotionId === voucher.userPromotionId);
    if (isSelected) {
        setSelectedVouchers(prev => prev.filter(v => v.userPromotionId !== voucher.userPromotionId));
    } else {
        const ticketTotal = bookingData.seats.reduce((t: number, s: any) => t + s.price, 0);
        const comboTotal = bookingData.combos.reduce((t: number, c: any) => t + (c.price * c.quantity), 0);
        
        const baseAmount = voucher.targetType === 'VE' ? ticketTotal : comboTotal;
        if (baseAmount < voucher.minOrderValue) {
            toast.error(`Đơn hàng chưa đủ điều kiện tối thiểu (${voucher.minOrderValue.toLocaleString('vi-VN')}đ) cho voucher này.`);
            return;
        }

        setSelectedVouchers(prev => [...prev, voucher]);
    }
  };

  const { ticketTotal, comboTotal, finalPrice, discountAmount } = useMemo(() => {
    if (!bookingData) return { ticketTotal: 0, comboTotal: 0, finalPrice: 0, discountAmount: 0 };

    const tTotal = bookingData.seats.reduce((t: number, s: any) => t + s.price, 0);
    const cTotal = bookingData.combos ? bookingData.combos.reduce((t: number, c: any) => t + (c.price * c.quantity), 0) : 0;
    
    let totalDiscount = 0;

    selectedVouchers.forEach(v => {
        let discount = 0;
        const base = v.targetType === 'VE' ? tTotal : cTotal;
        
        if (base >= v.minOrderValue) {
            if (v.discountType === 'PERCENTAGE') {
                discount = (base * v.value) / 100;
                if (v.maxDiscount) discount = Math.min(discount, v.maxDiscount);
            } else {
                discount = v.value;
            }
        }
        totalDiscount += discount;
    });

    const totalPrice = tTotal + cTotal;
    const final = Math.max(0, totalPrice - totalDiscount);

    return {
        ticketTotal: tTotal,
        comboTotal: cTotal,
        finalPrice: final,
        discountAmount: totalPrice - final
    };
  }, [bookingData, selectedVouchers]);

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
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Tag className="h-4 w-4 text-primary" /> Vé khuyến mãi
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsVoucherModalOpen(true)} className="bg-transparent border-zinc-700 hover:bg-zinc-800 text-primary hover:text-primary">
                    <Plus className="h-3 w-3 mr-1"/> Chọn Voucher
                </Button>
              </CardHeader>
              <CardContent>
                {selectedVouchers.length > 0 ? (
                    <div className="space-y-2">
                        {selectedVouchers.map(v => (
                             <div key={v.userPromotionId} className="bg-green-900/10 border border-green-500/20 rounded-lg p-3 flex justify-between items-center group">
                                <div>
                                    <div className="font-bold text-green-500 text-sm flex items-center gap-2">
                                        <CheckCircle2 className="h-3 w-3"/> {v.code}
                                    </div>
                                    <div className="text-xs text-zinc-400 mt-0.5">{v.description}</div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-zinc-500 hover:text-red-400" onClick={() => toggleVoucher(v)}>
                                    <XCircle className="h-4 w-4"/>
                                </Button>
                             </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-zinc-500 italic py-2">Chưa áp dụng khuyến mãi nào.</div>
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
                            <span className="text-white">{ticketTotal.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="flex justify-between text-sm text-zinc-400">
                            <span>Tổng tiền Combo</span>
                            <span className="text-white">{comboTotal.toLocaleString('vi-VN')}đ</span>
                        </div>
                        
                        {discountAmount > 0 && (
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
                            onClick={handlePayment}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Đang xử lý...
                              </>
                            ) : (
                              "Thanh toán ngay"
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
          </div>

        </div>
        {/* Voucher Selection Modal */}
        <Dialog open={isVoucherModalOpen} onOpenChange={setIsVoucherModalOpen}>
            <DialogContent className="bg-[#1C1C1C] border-zinc-800 text-white sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Chọn Voucher</DialogTitle>
                    <DialogDescription>Chọn mã khuyến mãi từ ví của bạn</DialogDescription>
                </DialogHeader>

                <div className="flex gap-2 mb-4">
                     <Input 
                        placeholder="Nhập mã code để lưu..." 
                        className="bg-zinc-900 border-zinc-700" 
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                     />
                     <Button onClick={handleSaveCode} disabled={isCheckingCode || !inputCode} className="shrink-0 bg-zinc-800 hover:bg-zinc-700">
                         {isCheckingCode ? <Loader2 className="h-4 w-4 animate-spin"/> : "Lưu"}
                     </Button>
                </div>

                <ScrollArea className="h-[300px] -mr-4 pr-4">
                    <div className="space-y-3">
                         {myVouchers.length === 0 && (
                             <div className="text-center text-zinc-500 py-8">Bạn chưa có voucher nào khả dụng.</div>
                         )}
                         {myVouchers.map(v => {
                            const isSelected = !!selectedVouchers.find(sv => sv.userPromotionId === v.userPromotionId);
                            // Valid check for display
                            const baseAmount = v.targetType === 'VE' ? ticketTotal : comboTotal;
                            const disable = baseAmount < v.minOrderValue;

                            return (
                                <div key={v.userPromotionId} 
                                    className={cn(
                                        "p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-colors",
                                        isSelected ? "bg-primary/10 border-primary/50" : "bg-zinc-900 border-zinc-800 hover:border-zinc-700",
                                        disable && "opacity-50 cursor-not-allowed"
                                    )}
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                    onClick={() => !disable && toggleVoucher(v)}
                                >
                                    <div className="h-10 w-10 shrink-0 rounded bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-400">
                                        {v.discountType === 'PERCENTAGE' ? '%' : '$'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between">
                                            <div className="font-bold truncate">{v.code}</div>
                                            <div className={cn(
                                                "h-5 w-5 rounded-full border flex items-center justify-center",
                                                isSelected ? "bg-primary border-primary text-white" : "border-zinc-600"
                                            )}>
                                                {isSelected && <CheckCircle2 className="h-3 w-3" />}
                                            </div>
                                        </div>
                                        <div className="text-xs text-zinc-400 line-clamp-1">{v.description}</div>
                                        <div className="text-[10px] text-zinc-500 mt-1">Đơn tối thiểu: {v.minOrderValue.toLocaleString('vi-VN')}đ • {v.targetType === 'VE' ? 'Vé' : 'Combo'}</div>
                                    </div>
                                </div>
                            );
                         })}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button onClick={() => setIsVoucherModalOpen(false)} className="bg-primary hover:bg-primary/90 text-white w-full">Xong</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={showWaitingModal} onOpenChange={setShowWaitingModal}>
            <DialogContent className="bg-[#1C1C1C] border-zinc-800 text-white sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-center text-xl">Đang chờ thanh toán</DialogTitle>
                    <DialogDescription className="text-center text-zinc-400">
                        Vui lòng hoàn tất thanh toán tại cổng thanh toán
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex flex-col items-center justify-center space-y-6 py-4">
                    <div className="bg-yellow-500/10 p-6 rounded-full animate-pulse">
                        <Clock className="w-12 h-12 text-yellow-500" />
                    </div>

                    <div className="text-center space-y-2">
                        <p className="text-zinc-300">Hệ thống đang chờ xác nhận giao dịch...</p>
                        <div className="text-3xl font-bold text-primary">{finalPrice.toLocaleString('vi-VN')} ₫</div>
                    </div>

                    <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20">
                        <Clock className="h-4 w-4" />
                        <span className="font-bold">
                            Thời gian còn lại: {Math.floor(waitingCountdown / 60)}:{(waitingCountdown % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                    
                    <Button variant="destructive" className="w-full dark" onClick={() => window.location.reload()}>
                        Đã thanh toán xong? Kiểm tra lại
                    </Button>
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