"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Armchair, Minus, Plus, TicketCheck, Ticket, Search, X, Loader2, RefreshCcw } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"; 
import { Checkbox } from "@/components/ui/checkbox";
import { ButtonGroup } from '@/components/ui/button-group';
import { toast } from "sonner";
import { format } from 'date-fns';

// Services & Types
import { filmService } from '@/services/film.service';
import { showtimeService } from '@/services/showtime.service';
import { comboService, Combo } from '@/services/combo.service';
import { invoiceService } from '@/services/invoice.service';
import { Movie } from '@/types/movie';
import { Showtime, SeatType } from '@/types/showtime';
import BookingSeatMap, { SelectedSeat, SeatRenderMeta } from '@/components/booking/BookingSeatMap';

export default function PosPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  
  const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [comboQuantities, setComboQuantities] = useState<{ [key: string]: number }>({});
  
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [customerEmail, setCustomerEmail] = useState("guest@cinema.com");
  const [paymentMethod, setPaymentMethod] = useState<"TAIQUAY" | "TRUCTUYEN">("TAIQUAY");

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingMovies(true);
      try {
        const [moviesData, seatTypesData, combosData] = await Promise.all([
          filmService.getAllFilms(),
          showtimeService.getSeatTypes(),
          comboService.getAll()
        ]);
        setMovies(moviesData.filter(m => m.status === 'now_showing'));
        setSeatTypes(seatTypesData);
        setCombos(combosData);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        toast.error("Lỗi tải dữ liệu ban đầu");
      } finally {
        setLoadingMovies(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedMovie) {
      setShowtimes([]);
      return;
    }

    const fetchShowtimes = async () => {
      setLoadingShowtimes(true);
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const data = await showtimeService.getShowtimes({
          MaPhim: String(selectedMovie.id),
          TuNgay: formattedDate,
          DenNgay: formattedDate,
          limit: 10
        });
        const filtered = data.filter(st => {
            const stDate = new Date(st.ThoiGianBatDau);
            return stDate.getDate() === selectedDate.getDate() &&
                   stDate.getMonth() === selectedDate.getMonth() &&
                   stDate.getFullYear() === selectedDate.getFullYear();
        });
        setShowtimes(filtered);
      } catch (error) {
        console.error("Failed to fetch showtimes:", error);
        toast.error("Lỗi tải suất chiếu");
      } finally {
        setLoadingShowtimes(false);
      }
    };

    fetchShowtimes();
  }, [selectedMovie, selectedDate]);


  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setComboQuantities({});
  };

  const handleShowtimeSelect = async (showtimeId: string) => {
    setLoadingDetails(true);
    try {
      const fullShowtime = await showtimeService.getShowtimeById(showtimeId);
      setSelectedShowtime(fullShowtime);
      setSelectedSeats([]);
    } catch (error) {
      console.error("Failed to fetch showtime details:", error);
      toast.error("Lỗi tải chi tiết suất chiếu");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSeatClick = async (seat: SelectedSeat) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    
    if (isSelected) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
      return;
    }
    if (!seat.uuid) {
        toast.error("Lỗi dữ liệu ghế");
        return;
    }

    try {
        const isAvailable = await showtimeService.checkSeatAvailability(seat.uuid);
        if (isAvailable) {
             setSelectedSeats(prev => [...prev, seat]);
        } else {
             toast.error("Ghế này đã có người đặt hoặc đang được giữ.");
             if (selectedShowtime) {
                 handleShowtimeSelect(selectedShowtime.MaSuatChieu);
             }
        }
    } catch (error) {
        console.error("Error checking seat:", error);
        toast.error("Lỗi kiểm tra trạng thái ghế");
    }
  };

  const handleComboChange = (comboId: string, delta: number) => {
    setComboQuantities(prev => {
      const current = prev[comboId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [comboId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [comboId]: next };
    });
  };

  const handlePaymentSuccess = async (code: string) => {
      setShowPaymentDialog(false);
      toast.success("Thanh toán thành công! Đang in vé...");
      
      try {
          const blob = await invoiceService.printInvoice(code) as unknown as Blob;
          const url = window.URL.createObjectURL(blob);
          const printWindow = window.open(url);
          if (printWindow) {
          } else {
            const link = document.createElement('a');
            link.href = url;
            link.download = `Ticket-${code}.pdf`;
            link.click();
          }
      } catch (error) {
          console.error("Print error:", error);
          toast.error("Lỗi in vé");
      }
        // Reset state after successful payment
      setSelectedSeats([]);
      setComboQuantities({});
      setSelectedShowtime(null); 
      if (selectedShowtime) {
          handleShowtimeSelect(selectedShowtime.MaSuatChieu);
      }
  };

  const checkIframeUrl = () => {
      try {
          if (iframeRef.current && iframeRef.current.contentWindow) {
              const href = iframeRef.current.contentWindow.location.href;
              if (href.includes('/success') && href.includes('status=PAID')) {
                  const url = new URL(href);
                  const orderCode = url.searchParams.get('orderCode');
                  if (orderCode) {
                      handlePaymentSuccess(orderCode);
                  }
              }
          }
      } catch (error) {
      }
  };

  const handleCheckout = async () => {
    if (!selectedShowtime || selectedSeats.length === 0) {
      toast.error("Vui lòng chọn suất chiếu và ghế");
      return;
    }

    setProcessingPayment(true);
    try {
      const invoiceData = {
        Email: customerEmail,
        LoaiGiaoDich: paymentMethod,
        MaGheSuatChieus: selectedSeats.map(s => s.uuid!),
        Combos: Object.entries(comboQuantities).map(([id, qty]) => ({
          MaCombo: id,
          SoLuong: qty
        })),
        MaVouchers: []
      };

      const res = await invoiceService.create(invoiceData);
      
      if (res && res.GiaoDichUrl) {
          setPaymentUrl(res.GiaoDichUrl);
          setTransactionId(res.MaGiaoDich);
          setShowPaymentDialog(true);
          toast.success("Đơn hàng đã được tạo. Vui lòng thanh toán.");
      } else {
          toast.success("Thanh toán thành công!");
          setSelectedSeats([]);
          setComboQuantities({});
          setSelectedShowtime(null); 
          if (selectedShowtime) {
              handleShowtimeSelect(selectedShowtime.MaSuatChieu);
          }
      }

    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("Thanh toán thất bại");
    } finally {
      setProcessingPayment(false);
    }
  };

  const seatMetaById = useMemo(() => {
    if (!selectedShowtime || !selectedShowtime.GheSuatChieus) return {};
    const meta: Record<string, SeatRenderMeta> = {};
    const basePrice = Number(selectedShowtime.PhienBanPhim.GiaVe);

    selectedShowtime.GheSuatChieus.forEach(gsc => {
      const seatId = `${gsc.GhePhongChieu.GheLoaiGhe.Ghe.Hang}${gsc.GhePhongChieu.GheLoaiGhe.Ghe.Cot}`;
      const type = gsc.GhePhongChieu.GheLoaiGhe.LoaiGhe;
      
      meta[seatId] = {
        uuid: gsc.MaGheSuatChieu,
        type: type.LoaiGhe,
        price: basePrice * type.HeSoGiaGhe,
        status: gsc.TrangThai,
        color: type.MauSac
      };
    });
    return meta;
  }, [selectedShowtime]);

  const bookedSeats = useMemo(() => {
    if (!selectedShowtime || !selectedShowtime.GheSuatChieus) return [];
    return selectedShowtime.GheSuatChieus
      .filter(gsc => gsc.TrangThai !== 'CONTRONG') // Assuming 'CONTRONG' is available
      .map(gsc => `${gsc.GhePhongChieu.GheLoaiGhe.Ghe.Hang}${gsc.GhePhongChieu.GheLoaiGhe.Ghe.Cot}`);
  }, [selectedShowtime]);

  const totalAmount = useMemo(() => {
    const seatsTotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    const combosTotal = combos.reduce((sum, combo) => {
      return sum + (combo.GiaTien * (comboQuantities[combo.MaCombo] || 0));
    }, 0);
    return seatsTotal + combosTotal;
  }, [selectedSeats, combos, comboQuantities]);

  const dates = useMemo(() => {
      const list = [];
      const today = new Date();
      for (let i = 0; i < 7; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          list.push(d);
      }
      return list;
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bán vé tại quầy (POS)</h1>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCcw className="w-4 h-4 mr-2" /> Làm mới
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left Column: Selection (Movies, Showtimes, Seats) */}
        <div className="col-span-8 flex flex-col gap-4 min-h-0">
            {/* 1. Movie & Date Selection */}
            <Card className="shrink-0">
                <CardContent className="p-4 space-y-4">
                    {/* Date Selection */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {dates.map((date, idx) => (
                            <Button
                                key={idx}
                                variant={selectedDate.getDate() === date.getDate() ? "default" : "outline"}
                                className="flex-col h-auto py-2 min-w-[80px]"
                                onClick={() => setSelectedDate(date)}
                            >
                                <span className="text-xs font-normal">{idx === 0 ? 'Hôm nay' : format(date, 'EEEE')}</span>
                                <span className="text-lg font-bold">{format(date, 'dd/MM')}</span>
                            </Button>
                        ))}
                    </div>

                    {/* Movie Selection */}
                    {loadingMovies ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <ScrollArea className="w-full whitespace-nowrap pb-2">
                            <div className="flex gap-4">
                                {movies.map(movie => (
                                    <div 
                                        key={movie.id} 
                                        className={cn(
                                            "relative w-[120px] cursor-pointer transition-all rounded-md overflow-hidden border-2",
                                            selectedMovie?.id === movie.id ? "border-primary scale-105" : "border-transparent opacity-70 hover:opacity-100"
                                        )}
                                        onClick={() => handleMovieSelect(movie)}
                                    >
                                        <div className="aspect-[2/3] relative">
                                            <Image 
                                                src={movie.posterUrl} 
                                                alt={movie.title} 
                                                fill 
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="p-2 bg-background/90 text-xs font-medium truncate text-center">
                                            {movie.title}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>

            {/* 2. Showtime Selection */}
            {selectedMovie && (
                <Card className="shrink-0">
                    <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium">Suất chiếu - {selectedMovie.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                        {loadingShowtimes ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                        ) : showtimes.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-2">Không có suất chiếu nào cho ngày này.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {showtimes.map(st => (
                                    <Button
                                        key={st.MaSuatChieu}
                                        variant={selectedShowtime?.MaSuatChieu === st.MaSuatChieu ? "default" : "outline"}
                                        onClick={() => handleShowtimeSelect(st.MaSuatChieu)}
                                        className="flex flex-col h-auto py-2 px-4"
                                    >
                                        <span className="text-lg font-bold">
                                            {format(new Date(st.ThoiGianBatDau), 'HH:mm')}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {st.PhongChieu?.TenPhongChieu}
                                        </span>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* 3. Seat Map */}
            {selectedShowtime && (
                <Card className="flex-1 min-h-0 flex flex-col">
                    <CardHeader className="py-3 border-b">
                        <CardTitle className="text-sm font-medium flex justify-between items-center">
                            <span>Sơ đồ ghế - {selectedShowtime.PhongChieu?.TenPhongChieu}</span>
                            <div className="flex gap-4 text-xs font-normal">
                                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-zinc-700 rounded-sm" /> Đã đặt</div>
                                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-primary rounded-sm" /> Đang chọn</div>
                                <div className="flex items-center gap-1"><div className="w-3 h-3 border border-zinc-500 rounded-sm" /> Trống</div>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 relative overflow-hidden">
                        {loadingDetails ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                                <Loader2 className="animate-spin" />
                            </div>
                        ) : (
                            <div className="h-full overflow-auto p-4">
                                <BookingSeatMap
                                    seatMap={selectedShowtime.PhongChieu?.SoDoGhe || {}}
                                    bookedSeats={bookedSeats}
                                    seatMetaById={seatMetaById}
                                    basePrice={Number(selectedShowtime.PhienBanPhim.GiaVe)}
                                    selectedSeats={selectedSeats}
                                    onSeatClick={handleSeatClick}
                                    seatTypes={seatTypes}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>

        {/* Right Column: Cart & Payment */}
        <div className="col-span-4 flex flex-col gap-4 h-full">
            <Card className="flex-1 flex flex-col h-full">
                <CardHeader className="pb-2 border-b">
                    <CardTitle>Thông tin đặt vé</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto py-4 space-y-6">
                    {/* Movie Info */}
                    {selectedMovie && (
                        <div className="flex gap-3">
                            <div className="relative w-16 aspect-[2/3] rounded overflow-hidden shrink-0">
                                <Image src={selectedMovie.posterUrl} alt={selectedMovie.title} fill className="object-cover" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">{selectedMovie.title}</h3>
                                <p className="text-xs text-muted-foreground">{selectedMovie.subTitle}</p>
                                {selectedShowtime && (
                                    <div className="mt-1 text-xs">
                                        <Badge variant="secondary" className="mr-1">{selectedShowtime.PhienBanPhim.DinhDang.TenDinhDang}</Badge>
                                        <span className="font-medium text-primary">
                                            {format(new Date(selectedShowtime.ThoiGianBatDau), 'HH:mm')} - {format(selectedDate, 'dd/MM/yyyy')}
                                        </span>
                                        <div className="mt-1 text-muted-foreground">
                                            {selectedShowtime.PhongChieu?.TenPhongChieu}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* Selected Seats */}
                    <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Armchair className="w-4 h-4" /> Ghế đã chọn ({selectedSeats.length})
                        </h4>
                        {selectedSeats.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {selectedSeats.map(seat => (
                                    <Badge key={seat.id} variant="outline" className="flex gap-1 items-center">
                                        {seat.id}
                                        <X 
                                            className="w-3 h-3 cursor-pointer hover:text-red-500" 
                                            onClick={() => handleSeatClick(seat)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground italic">Chưa chọn ghế nào</p>
                        )}
                    </div>

                    <Separator />

                    {/* Combos */}
                    <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Ticket className="w-4 h-4" /> Bắp nước & Combo
                        </h4>
                        <div className="space-y-3">
                            {combos.map(combo => (
                                <div key={combo.MaCombo} className="flex items-center justify-between text-sm">
                                    <div className="flex-1">
                                        <div className="font-medium">{combo.TenCombo}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(combo.GiaTien)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="outline" size="icon" className="h-6 w-6"
                                            onClick={() => handleComboChange(combo.MaCombo, -1)}
                                            disabled={!comboQuantities[combo.MaCombo]}
                                        >
                                            <Minus className="w-3 h-3" />
                                        </Button>
                                        <span className="w-4 text-center text-xs">{comboQuantities[combo.MaCombo] || 0}</span>
                                        <Button 
                                            variant="outline" size="icon" className="h-6 w-6"
                                            onClick={() => handleComboChange(combo.MaCombo, 1)}
                                        >
                                            <Plus className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Customer Info */}
                    <div>
                        <h4 className="text-sm font-medium mb-2">Thông tin khách hàng</h4>
                        <div className="space-y-2">
                            <div className="grid gap-1">
                                <Label htmlFor="email" className="text-xs">Email (để nhận vé)</Label>
                                <Input 
                                    id="email" 
                                    value={customerEmail} 
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div className="grid gap-1">
                                <Label className="text-xs">Phương thức thanh toán</Label>
                                <Select 
                                    value={paymentMethod} 
                                    onValueChange={(v: any) => setPaymentMethod(v)}
                                >
                                    <SelectTrigger className="h-8 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TAIQUAY">Tiền mặt (Tại quầy)</SelectItem>
                                        <SelectItem value="TRUCTUYEN">Chuyển khoản / Thẻ</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex-col gap-4 border-t pt-4 bg-muted/20">
                    <div className="w-full flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Tổng tiền:</span>
                        <span className="text-2xl font-bold text-primary">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                        </span>
                    </div>
                    <Button 
                        className="w-full" 
                        size="lg" 
                        onClick={handleCheckout}
                        disabled={processingPayment || !selectedShowtime || selectedSeats.length === 0}
                    >
                        {processingPayment ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...
                            </>
                        ) : (
                            <>
                                <TicketCheck className="mr-2 h-4 w-4" /> Xuất vé & Thanh toán
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thanh toán đơn hàng</DialogTitle>
            <DialogDescription>
              Vui lòng thực hiện thanh toán để hoàn tất giao dịch.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
             {paymentUrl && (
                 <div className="w-full aspect-square relative border rounded-md overflow-hidden">
                     <iframe 
                        ref={iframeRef}
                        src={paymentUrl} 
                        className="w-full h-full" 
                        title="Payment Frame"
                        onLoad={checkIframeUrl}
                     />
                 </div>
             )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
