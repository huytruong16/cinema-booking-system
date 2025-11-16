'use client';

import React, { useState, useMemo, Suspense, useEffect } from 'react'; // Đã import useEffect
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { mockMovies, mockCombos } from '@/lib/mockData';
import ComboCard from '@/components/combo/ComboCard';
import BookingSeatMap, { SelectedSeat } from '@/components/booking/BookingSeatMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Ticket, ShoppingCart, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const movieId = searchParams.get('movieId');
  const selectedDate = searchParams.get('date');
  const selectedTime = searchParams.get('time');
  const selectedFormat = searchParams.get('format');

  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [comboQuantities, setComboQuantities] = useState<{ [key: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút = 300 giây

  const [isTimerActive, setIsTimerActive] = useState(false);

  const movie = useMemo(() => mockMovies.find(m => m.id.toString() === movieId), [movieId]);


  useEffect(() => {
    if (!isTimerActive || timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          alert("Đã hết thời gian giữ ghế. Vui lòng thử lại.");
          router.back();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, timeLeft, isTimerActive]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSeatClick = (seat: SelectedSeat) => {
    if (selectedSeats.length === 0 && !isTimerActive) {
      setIsTimerActive(true);
    }

    setSelectedSeats(prev => [...prev, seat]);
  };

  const handleSeatRemove = (seatId: string) => {
    setSelectedSeats(prev => prev.filter(s => s.id !== seatId));
  };

  const handleQuantityChange = (comboId: string, quantity: number) => {
    setComboQuantities(prevQuantities => ({
      ...prevQuantities,
      [comboId]: quantity,
    }));
  };

  const totalTicketPrice = useMemo(() => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  }, [selectedSeats]);

  const selectedCombosList = useMemo(() => {
    return Object.entries(comboQuantities)
      .map(([comboId, quantity]) => {
        const combo = mockCombos.find(c => c.id === comboId);
        return combo ? { ...combo, quantity } : null;
      })
      .filter(c => c && c.quantity > 0) as (typeof mockCombos[0] & { quantity: number })[];
  }, [comboQuantities]);

  const totalComboPrice = useMemo(() => {
    return selectedCombosList.reduce((total, combo) => total + (combo.price * combo.quantity), 0);
  }, [selectedCombosList]);

  const totalPrice = totalTicketPrice + totalComboPrice;

  if (!movie || !selectedDate || !selectedTime || !selectedFormat) {
    return (
      <div className="dark bg-background min-h-screen text-foreground flex items-center justify-center">
        <Loader2 className="animate-spin size-8 mr-2" />
        Đang tải dữ liệu suất chiếu...
      </div>
    );
  }

  return (
    <div className="dark bg-background min-h-screen text-foreground">
      {/* Thanh thông tin suất chiếu */}
      <div className="sticky top-0 z-20 bg-card border-b border-border shadow-md">
        <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()} className="h-9 w-9">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <div>
              <h2 className="text-lg font-bold text-white">{movie.title}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedDate} | {selectedTime} | {selectedFormat}
              </p>
            </div>
          </div>

          {/* Đồng hồ đếm ngược */}
          <div className={cn(
            "text-xl font-bold",
            isTimerActive && timeLeft < 60 ? "text-red-500 animate-pulse" : "text-primary"
          )}>
            Thời gian giữ ghế: {formatTime(timeLeft)}
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-8">

        {/* Cột chính */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Chọn ghế */}
          <BookingSeatMap
            selectedSeats={selectedSeats}
            onSeatClick={handleSeatClick}
            onSeatRemove={handleSeatRemove}
          />

          {/* 2. Chọn Combo */}
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

        {/* Cột phụ (Hóa đơn) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Card className="bg-card border-border text-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Tóm tắt hóa đơn</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[40vh] pr-4">
                  {/* Chi tiết phim */}
                  <div className="flex items-center gap-4">
                    <Image src={movie.posterUrl} alt={movie.title} width={80} height={120} className="rounded-md" />
                    <div>
                      <h3 className="font-semibold text-white">{movie.title}</h3>
                      <Badge variant="outline" className="mt-1">{movie.ageRating}</Badge>
                    </div>
                  </div>

                  <Separator className="my-4 bg-border" />

                  {/* Chi tiết vé */}
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

                  {/* Chi tiết combo */}
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

              {/* Tổng tiền */}
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
                  disabled={selectedSeats.length === 0 || timeLeft === 0}
                >
                  {timeLeft === 0 ? "Đã hết giờ" : "Thanh toán"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
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