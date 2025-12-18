'use client';

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { mockCombos } from '@/lib/mockData';
import ComboCard from '@/components/combo/ComboCard';
import BookingSeatMap, { SelectedSeat, SeatRenderMeta } from '@/components/booking/BookingSeatMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Ticket, ShoppingCart, Loader2, Calendar, Clock, MapPin } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
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
import { format } from 'date-fns';

// Import Service và Type
import { showtimeService } from '@/services/showtime.service';
import { comboService, Combo } from '@/services/combo.service';
import { Showtime } from '@/types/showtime';

type CustomerInfo = {
  name: string;
  email: string;
  phone: string;
  isGuest: boolean;
};

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // 1. Lấy tham số từ URL
  const showtimeId = searchParams.get('showtimeId'); // Cần showtimeId để gọi API

  // 2. State dữ liệu
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [seatTypes, setSeatTypes] = useState<any[]>([]); // Sẽ update type sau
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);

  // State booking
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [comboQuantities, setComboQuantities] = useState<{ [key: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // State Guest
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ fullName: "", email: "", phone: "", agreed: false });

  // 3. Fetch dữ liệu thật từ API
  useEffect(() => {
    if (!showtimeId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [showtimeData, seatTypesData, combosData] = await Promise.all([
          showtimeService.getShowtimeById(showtimeId),
          showtimeService.getSeatTypes(),
          comboService.getAll()
        ]);
        setShowtime(showtimeData);
        setSeatTypes(seatTypesData);
        setCombos(combosData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        toast.error("Không thể tải thông tin suất chiếu hoặc combo. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showtimeId]);

  // Logic đếm ngược
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

  // Xử lý Click Ghế (Chọn/Bỏ chọn)
  const handleSeatClick = (seat: SelectedSeat) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id);

    if (isSelected) {
      // Bỏ chọn
      const newSeats = selectedSeats.filter(s => s.id !== seat.id);
      setSelectedSeats(newSeats);
      if (newSeats.length === 0) {
        setIsTimerActive(false);
        setTimeLeft(300);
      }
    } else {
      // Chọn mới
      if (selectedSeats.length >= 8) {
        toast.warning("Bạn chỉ được chọn tối đa 8 ghế.");
        return;
      }
      if (selectedSeats.length === 0 && !isTimerActive) setIsTimerActive(true);
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleQuantityChange = (id: string, qty: number) => {
    setComboQuantities(prev => ({ ...prev, [id]: qty }));
  };

  const selectedCombosList = useMemo(() => {
    return Object.entries(comboQuantities)
      .map(([id, q]) => {
        const c = combos.find(mc => mc.MaCombo === id);
        return c ? {
          id: c.MaCombo,
          name: c.TenCombo,
          price: c.GiaTien,
          quantity: q,
          imageUrl: c.HinhAnh
        } : null;
      })
      .filter(c => c && c.quantity > 0) as { id: string, name: string, price: number, quantity: number, imageUrl?: string }[];
  }, [comboQuantities, combos]);

  const totalTicketPrice = useMemo(() => selectedSeats.reduce((sum, s) => sum + s.price, 0), [selectedSeats]);
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
    if (!guestInfo.fullName || !guestInfo.email || !guestInfo.phone || !guestInfo.agreed) {
      toast.error("Vui lòng nhập đầy đủ thông tin và đồng ý điều khoản.");
      return;
    }
    proceedToPayment({ name: guestInfo.fullName, email: guestInfo.email, phone: guestInfo.phone, isGuest: true });
  };

  const proceedToPayment = (customerInfo: CustomerInfo) => {
    if (!showtime) return;
    setIsNavigating(true);

    const bookingData = {
      showtime,
      movie: {
        title: showtime.PhienBanPhim.Phim.TenHienThi,
        posterUrl: showtime.PhienBanPhim.Phim.PosterUrl,
        ageRating: showtime.PhienBanPhim.Phim.NhanPhim?.TenNhanPhim || "T18"
      },
      format: `${showtime.PhienBanPhim.DinhDang.TenDinhDang} - ${showtime.PhienBanPhim.NgonNgu.TenNgonNgu}`,
      time: new Date(showtime.ThoiGianBatDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      date: new Date(showtime.ThoiGianBatDau).toLocaleDateString('vi-VN'),
      roomName: showtime.PhongChieu.TenPhong,
      seats: selectedSeats,
      combos: selectedCombosList,
      totalPrice,
      customerInfo
    };

    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    router.push('/payment');
  };

  const basePrice = useMemo(() => Number(showtime?.PhienBanPhim?.GiaVe ?? 0), [showtime]);

  const seatMetaById = useMemo<Record<string, SeatRenderMeta>>(() => {
    if (!showtime) return {};

    const rank = (t: SeatRenderMeta['type']) => (t === 'doi' ? 3 : t === 'vip' ? 2 : 1);
    const mergeType = (a: SeatRenderMeta['type'], b: SeatRenderMeta['type']) => (rank(a) >= rank(b) ? a : b);

    const normalizeType = (raw?: string): SeatRenderMeta['type'] => {
      const v = (raw ?? '').trim().toUpperCase();
      if (v.includes('DOI') || v.includes('ĐÔI')) return 'doi';
      if (v.includes('VIP')) return 'vip';
      return 'thuong';
    };

    const meta: Record<string, SeatRenderMeta> = {};
    for (const gs of showtime.GheSuatChieus ?? []) {
      const ghe = gs.GhePhongChieu?.GheLoaiGhe?.Ghe;
      if (!ghe?.Hang || !ghe?.Cot) continue;

      const seatId = `${ghe.Hang}${ghe.Cot}`;
      const loai = gs.GhePhongChieu?.GheLoaiGhe?.LoaiGhe;
      const type = normalizeType(loai?.LoaiGhe);

      const heSo = Number(loai?.HeSoGiaGhe ?? 1);
      const multiplier = Number.isFinite(heSo) && heSo > 0 ? heSo : 1;
      const price = Math.round(basePrice * multiplier);

      const existing = meta[seatId];
      if (!existing) {
        meta[seatId] = { type, price, status: gs.TrangThai, uuid: gs.MaGheSuatChieu };
        continue;
      }

      meta[seatId] = {
        type: mergeType(existing.type, type),
        price: Math.max(existing.price, price),
        status: existing.status === 'CONTRONG' && gs.TrangThai === 'CONTRONG' ? 'CONTRONG' : (existing.status !== 'CONTRONG' ? existing.status : gs.TrangThai),
        uuid: gs.MaGheSuatChieu
      };
    }
    return meta;
  }, [showtime, basePrice]);

  const bookedSeats = useMemo(() => {
    return Object.entries(seatMetaById)
      .filter(([, v]) => v.status && v.status !== 'CONTRONG')
      .map(([k]) => k);
  }, [seatMetaById]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F0F0F] text-white">
        <Loader2 className="animate-spin size-10 text-primary mb-4" />
        <p>Đang tải dữ liệu phòng chiếu...</p>
      </div>
    );
  }

  if (!showtime) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F0F0F] text-white gap-4">
        <p className="text-red-500 text-lg">Không tìm thấy thông tin suất chiếu.</p>
        <Button onClick={() => router.back()} variant="outline">Quay lại</Button>
      </div>
    );
  }

  const movie = showtime.PhienBanPhim.Phim;

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
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-zinc-400 hover:text-white shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </Button>
            <div>
              <h2 className="text-lg font-bold text-white truncate max-w-[300px]">{movie.TenHienThi}</h2>
              <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {format(new Date(showtime.ThoiGianBatDau), 'dd/MM/yyyy')}</span>
                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {format(new Date(showtime.ThoiGianBatDau), 'HH:mm')}</span>
                <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {showtime.PhongChieu.TenPhongChieu}</span>
              </div>
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
            seatMap={showtime.PhongChieu.SoDoGhe}
            bookedSeats={bookedSeats}
            seatMetaById={seatMetaById}
            basePrice={basePrice}
            selectedSeats={selectedSeats}
            onSeatClick={handleSeatClick}
            seatTypes={seatTypes}
          />

          <Card className="bg-card/50 border border-border text-white">
            <CardHeader><CardTitle>Chọn Combo</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {combos.map(combo => (
                  <ComboCard
                    key={combo.MaCombo}
                    combo={{
                      id: combo.MaCombo,
                      name: combo.TenCombo,
                      price: combo.GiaTien,
                      imageUrl: combo.HinhAnh || ''
                    }}
                    initialQuantity={comboQuantities[combo.MaCombo] || 0}
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
                <ScrollArea className="h-[50vh] pr-4">
                  <div className="flex gap-4">
                    <Image src={movie.PosterUrl} alt={movie.TenHienThi} width={80} height={120} className="rounded-md object-cover" />
                    <div>
                      <h3 className="font-semibold text-white">{movie.TenHienThi}</h3>
                      <Badge variant="outline" className="mt-1">{movie.NhanPhim?.TenNhanPhim || 'T13'}</Badge>
                      <p className="text-xs text-zinc-400 mt-1">{showtime.PhienBanPhim.DinhDang.TenDinhDang} - {showtime.PhienBanPhim.NgonNgu.TenNgonNgu}</p>
                    </div>
                  </div>

                  <Separator className="my-4 bg-border" />

                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2 text-primary">
                      <Ticket className="size-4" /> Ghế đang chọn ({selectedSeats.length})
                    </h4>
                    {selectedSeats.length === 0 ? <p className="text-xs text-muted-foreground italic">Vui lòng chọn ghế...</p> : (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {selectedSeats.map(seat => (
                          <div key={seat.id} className="bg-zinc-800 p-2 rounded flex justify-between">
                            <span className="font-bold">{seat.id}</span>
                            <span>{seat.price.toLocaleString()}đ</span>
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