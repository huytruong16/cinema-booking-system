'use client';

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { mockMovies, mockCombos, mockShowtimes } from '@/lib/mockData';
import ComboCard from '@/components/combo/ComboCard';
import BookingSeatMap, { SelectedSeat } from '@/components/booking/BookingSeatMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Ticket, ShoppingCart, Loader2, Calendar, Clock, Film } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const getAvailableDates = () => mockShowtimes.map(d => d.date);
const getAvailableFormats = () => [...new Set(mockShowtimes.flatMap(d => d.types.map(t => t.type)))];

const getAvailableTimes = (date: string, format: string) => {
  const day = mockShowtimes.find(d => d.date === date);
  if (!day) return [];
  const type = day.types.find(t => t.type === format);
  return type ? type.times : [];
};

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [movieId] = useState(() => searchParams.get('movieId'));
  const movie = useMemo(() => mockMovies.find(m => m.id.toString() === movieId), [movieId]);

  const [selectedDate, setSelectedDate] = useState(() => searchParams.get('date') || getAvailableDates()[0]);
  const [selectedFormat, setSelectedFormat] = useState(() => searchParams.get('format') || getAvailableFormats()[0]);
  const [selectedTime, setSelectedTime] = useState(() => searchParams.get('time') || "");

  const availableTimes = useMemo(() => getAvailableTimes(selectedDate, selectedFormat), [selectedDate, selectedFormat]);
  useEffect(() => {
    if (!selectedTime || (!availableTimes.includes(selectedTime) && availableTimes.length > 0)) {
      setSelectedTime(availableTimes[0]);
    }
  }, [availableTimes, selectedTime]);

  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [comboQuantities, setComboQuantities] = useState<{ [key: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ fullName: "", email: "", phone: "", agreed: false });
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!isTimerActive || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Đã hết thời gian giữ ghế.");
          router.back();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft, router]);

  const formatCountdown = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleSeatClick = (seat: SelectedSeat) => {
    if (selectedSeats.length === 0 && !isTimerActive) setIsTimerActive(true);
    setSelectedSeats(prev => [...prev, seat]);
  };

  const handleSeatRemove = (id: string) => {
    setSelectedSeats(prev => prev.filter(s => s.id !== id));
  };

  const handleQuantityChange = (id: string, qty: number) => {
    setComboQuantities(prev => ({ ...prev, [id]: qty }));
  };

  const totalTicketPrice = useMemo(() => selectedSeats.reduce((sum, s) => sum + s.price, 0), [selectedSeats]);

  const selectedCombosList = useMemo(() => {
    return Object.entries(comboQuantities)
      .map(([id, q]) => {
        const c = mockCombos.find(mc => mc.id === id);
        return c ? { ...c, quantity: q } : null;
      })
      .filter(c => c && c.quantity > 0) as (typeof mockCombos[0] & { quantity: number })[];
  }, [comboQuantities]);

  const totalComboPrice = useMemo(() => selectedCombosList.reduce((sum, c) => sum + (c.price * c.quantity), 0), [selectedCombosList]);
  const totalPrice = totalTicketPrice + totalComboPrice;

  const handlePaymentClick = () => {
    if (user) {
      proceedToPayment({ name: user.username || "Khách hàng", email: user.email, phone: user.soDienThoai || "", isGuest: false });
    } else {
      setShowGuestModal(true);
    }
  };

  const handleGuestSubmit = () => {
    if (!guestInfo.fullName || !guestInfo.email || !guestInfo.phone) {
      toast.error("Vui lòng nhập đủ thông tin.");
      return;
    }
    if (!guestInfo.agreed) {
      toast.error("Vui lòng đồng ý điều khoản.");
      return;
    }
    proceedToPayment({ name: guestInfo.fullName, email: guestInfo.email, phone: guestInfo.phone, isGuest: true });
  };

  const proceedToPayment = (customerInfo: any) => {
    setIsNavigating(true);
    const bookingData = {
      movie,
      date: selectedDate,
      time: selectedTime,
      format: selectedFormat,
      seats: selectedSeats,
      combos: selectedCombosList,
      totalPrice,
      customerInfo
    };
    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    router.push('/payment');
  };

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F0F0F] text-white gap-4">
        <p className="text-red-500 text-lg">Không tìm thấy thông tin phim hoặc đường dẫn bị lỗi.</p>
        <Button onClick={() => router.push('/')} variant="outline">Về trang chủ</Button>
      </div>
    );
  }

  return (
    <div className="dark bg-background min-h-screen text-foreground pb-20 relative">

      {isNavigating && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin size-10 text-primary mb-2" />
            <span className="text-white font-medium">Đang chuyển đến trang thanh toán...</span>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-30 bg-[#1C1C1C] border-b border-zinc-800 shadow-md py-3 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-zinc-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </Button>
              <h2 className="text-lg font-bold text-white truncate max-w-[200px]">{movie.title}</h2>
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-[140px] h-9 bg-zinc-800 border-zinc-700 text-xs">
                  <Calendar className="w-3 h-3 mr-2 text-zinc-400" />
                  <SelectValue placeholder="Ngày" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 text-white border-zinc-700">
                  {getAvailableDates().map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger className="w-[130px] h-9 bg-zinc-800 border-zinc-700 text-xs">
                  <Film className="w-3 h-3 mr-2 text-zinc-400" />
                  <SelectValue placeholder="Định dạng" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 text-white border-zinc-700">
                  {getAvailableFormats().map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="w-[100px] h-9 bg-zinc-800 border-zinc-700 text-xs">
                  <Clock className="w-3 h-3 mr-2 text-zinc-400" />
                  <SelectValue placeholder="Giờ" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 text-white border-zinc-700">
                  {availableTimes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={cn(
            "text-xl font-bold",
            isTimerActive && timeLeft < 60 ? "text-red-500 animate-pulse" : "text-primary"
          )}>
            {isTimerActive ? `Giữ ghế: ${formatCountdown(timeLeft)}` : "Thời gian giữ ghế: 05:00"}
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-8">
        <div className="lg:col-span-2 space-y-8">
          <BookingSeatMap
            selectedSeats={selectedSeats}
            onSeatClick={handleSeatClick}
            onSeatRemove={handleSeatRemove}
          />

          <Card className="bg-card/50 border border-border text-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Chọn Combo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockCombos.map(combo => (
                  <ComboCard
                    key={combo.id}
                    combo={combo}
                    initialQuantity={comboQuantities[combo.id] || 0}
                    onQuantityChange={handleQuantityChange}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Card className="bg-card border-border text-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Tóm tắt hóa đơn</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[40vh] pr-4">
                  <div className="flex items-center gap-4">
                    <Image src={movie.posterUrl} alt={movie.title} width={80} height={120} className="rounded-md" />
                    <div>
                      <h3 className="font-semibold text-white">{movie.title}</h3>
                      <Badge variant="outline" className="mt-1">{movie.ageRating}</Badge>
                    </div>
                  </div>

                  <Separator className="my-4 bg-border" />

                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Ticket className="size-5 text-primary" />
                      Vé đã chọn ({selectedSeats.length})
                    </h4>
                    {selectedSeats.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Vui lòng chọn ghế...</p>
                    ) : (
                      <div className="space-y-1 text-sm">
                        {selectedSeats.map(seat => (
                          <div key={seat.id} className="flex justify-between items-center">
                            <span className={cn(
                              "font-medium",
                              seat.type === 'vip' && "text-yellow-400",
                              seat.type === 'doi' && "text-purple-400",
                            )}>
                              Ghế {seat.id} ({seat.type === 'doi' ? 'Đôi' : seat.type === 'vip' ? 'VIP' : 'Thường'})
                            </span>
                            <span className="text-muted-foreground">{seat.price.toLocaleString('vi-VN')} ₫</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator className="my-4 bg-border" />

                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <ShoppingCart className="size-5 text-primary" />
                      Combo đã chọn ({selectedCombosList.length})
                    </h4>
                    {selectedCombosList.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Chưa chọn combo...</p>
                    ) : (
                      <div className="space-y-1 text-sm">
                        {selectedCombosList.map(combo => (
                          <div key={combo.id} className="flex justify-between items-center">
                            <span>{combo.name} (x{combo.quantity})</span>
                            <span className="text-muted-foreground">{(combo.price * combo.quantity).toLocaleString('vi-VN')} ₫</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              <div className="p-6 border-t border-border space-y-4">
                <div className="flex justify-between text-lg font-medium">
                  <span>Tiền vé</span>
                  <span>{totalTicketPrice.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between text-lg font-medium">
                  <span>Tiền combo</span>
                  <span>{totalComboPrice.toLocaleString('vi-VN')} ₫</span>
                </div>
                <Separator className="bg-border" />
                <div className="flex justify-between text-2xl font-bold text-primary">
                  <span>TỔNG CỘNG</span>
                  <span>{totalPrice.toLocaleString('vi-VN')} ₫</span>
                </div>

                <Button
                  size="lg"
                  className="w-full text-lg h-12 bg-red-600 hover:bg-red-700 text-white"
                  disabled={selectedSeats.length === 0 || timeLeft === 0 || isNavigating}
                  onClick={handlePaymentClick}
                >
                  {timeLeft === 0 ? "Đã hết giờ" : "Thanh toán"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showGuestModal} onOpenChange={setShowGuestModal}>
        <DialogContent className="bg-[#1C1C1C] border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thông tin người nhận vé</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Bạn chưa đăng nhập. Vui lòng nhập thông tin để nhận vé điện tử.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                placeholder="Nhập họ tên"
                className="bg-zinc-900 border-zinc-700"
                value={guestInfo.fullName}
                onChange={(e) => setGuestInfo({ ...guestInfo, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (để nhận vé)</Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập email"
                className="bg-zinc-900 border-zinc-700"
                value={guestInfo.email}
                onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Nhập số điện thoại"
                className="bg-zinc-900 border-zinc-700"
                value={guestInfo.phone}
                onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
              />
            </div>

            <div className="flex flex-row items-start gap-3">
              <Checkbox
                id="terms"
                checked={guestInfo.agreed}
                onCheckedChange={(checked) => setGuestInfo({ ...guestInfo, agreed: checked as boolean })}
                className="mt-0.5 border-white/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
              />
              <Label htmlFor="terms" className="text-sm text-zinc-400 leading-snug cursor-pointer font-normal">
                Đảm bảo mua vé đúng số tuổi quy định.
              </Label>
            </div>
            <div className="flex flex-row items-start gap-3">
              <Checkbox
                id="terms"
                className="mt-0.5 border-white/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
              />
              <Label htmlFor="terms" className="text-sm text-zinc-400 leading-snug cursor-pointer font-normal">
                Đồng ý với điều khoản của rạp.
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowGuestModal(false)} className="bg-foreground">Hủy</Button>
            <Button onClick={handleGuestSubmit} className="bg-primary hover:bg-primary/90">Tiếp tục</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="dark bg-background min-h-screen text-foreground flex items-center justify-center">
        <Loader2 className="animate-spin size-8 mr-2" />
        Đang tải trang...
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  );
}