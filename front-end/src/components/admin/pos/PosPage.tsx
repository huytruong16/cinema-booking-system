"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from 'lucide-react'; 
import { toast } from "sonner";
import { format } from 'date-fns';

// Services & Types
import { filmService } from '@/services/film.service';
import { showtimeService } from '@/services/showtime.service';
import { comboService, Combo } from '@/services/combo.service';
import { invoiceService } from '@/services/invoice.service';
import { Movie } from '@/types/movie';
import { Showtime, SeatType } from '@/types/showtime';
import { SelectedSeat, SeatRenderMeta } from '@/components/booking/BookingSeatMap';
import { useAuth } from "@/contexts/AuthContext";

// Components
import { PosDateSelection } from './components/PosDateSelection';
import { PosMovieSelection } from './components/PosMovieSelection';
import { PosShowtimeSelection } from './components/PosShowtimeSelection';
import { PosSeatMapSection } from './components/PosSeatMapSection';
import { PosCart } from './components/PosCart';
import { PosPaymentDialog } from './components/PosPaymentDialog';

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
  const [loadingShowtimeId, setLoadingShowtimeId] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [customerEmail, setCustomerEmail] = useState("guest@cinema.com");
  const [paymentMethod, setPaymentMethod] = useState<"TRUCTIEP" | "TRUCTUYEN">("TRUCTIEP");

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pendingInvoiceCodeRef = useRef<string | null>(null);
  const { hasPermission } = useAuth();

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
    setLoadingShowtimeId(showtimeId);
    try {
      const fullShowtime = await showtimeService.getShowtimeById(showtimeId);
      setSelectedShowtime(fullShowtime);
      setSelectedSeats([]);
    } catch (error) {
      console.error("Failed to fetch showtime details:", error);
      toast.error("Lỗi tải chi tiết suất chiếu");
    } finally {
      setLoadingDetails(false);
      setLoadingShowtimeId(null);
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
      pendingInvoiceCodeRef.current = null;
      toast.success("Thanh toán thành công! Đang in vé...");
      
      const printDoc = async (fetcher: (code: string) => Promise<any>, name: string) => {
        try {
            const blob = await fetcher(code) as unknown as Blob;
            const url = window.URL.createObjectURL(blob);
            const printWindow = window.open(url, '_blank');
            if (!printWindow) {
                const link = document.createElement('a');
                link.href = url;
                link.download = `${name}-${code}.pdf`;
                link.click();
            }
        } catch (e) {
            console.error(`Error printing ${name}:`, e);
        }
      };

      const hasCombos = Object.values(comboQuantities).some(qty => qty > 0);
      const printTasks = [
        printDoc(invoiceService.printInvoice, 'Invoice'),
        printDoc(invoiceService.printTicket, 'Ticket')
      ];

      if (hasCombos) {
        printTasks.push(printDoc(invoiceService.getComboPdf, 'Combo'));
      }

      await Promise.all(printTasks);

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
                  
                  if (pendingInvoiceCodeRef.current) {
                      handlePaymentSuccess(pendingInvoiceCodeRef.current);
                  } else if (orderCode) {
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
      
      if (res && res.CodeHoaDon) {
        pendingInvoiceCodeRef.current = res.CodeHoaDon;
      }

      if (res && res.GiaoDichUrl) {
          setPaymentUrl(res.GiaoDichUrl);
          setTransactionId(res.MaGiaoDich);
          setShowPaymentDialog(true);
          toast.success("Đơn hàng đã được tạo. Vui lòng thanh toán.");
      } else {
          if (res && res.CodeHoaDon) {
            handlePaymentSuccess(res.CodeHoaDon);
          } else {
            toast.success("Thanh toán thành công!");
            setSelectedSeats([]);
            setComboQuantities({});
            setSelectedShowtime(null); 
            if (selectedShowtime) {
                handleShowtimeSelect(selectedShowtime.MaSuatChieu);
            }
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

      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Selection (Movies, Showtimes, Seats) */}
        <div className="col-span-8 flex flex-col gap-4 overflow-y-auto pb-4">
            {/* 1. Movie & Date Selection */}
            <Card className="shrink-0">
                <CardContent className="p-4 space-y-4">
                    <PosDateSelection 
                        selectedDate={selectedDate} 
                        onDateSelect={setSelectedDate} 
                        dates={dates} 
                    />
                    <PosMovieSelection 
                        movies={movies} 
                        selectedMovie={selectedMovie} 
                        onMovieSelect={handleMovieSelect} 
                        loading={loadingMovies} 
                    />
                </CardContent>
            </Card>

            {/* 2. Showtime Selection */}
            <PosShowtimeSelection 
                showtimes={showtimes} 
                selectedShowtime={selectedShowtime} 
                onShowtimeSelect={handleShowtimeSelect} 
                loading={loadingShowtimes} 
                selectedMovie={selectedMovie}
                loadingShowtimeId={loadingShowtimeId}
            />

            {/* 3. Seat Map */}
            <PosSeatMapSection 
                selectedShowtime={selectedShowtime} 
                loadingDetails={loadingDetails} 
                bookedSeats={bookedSeats} 
                seatMetaById={seatMetaById} 
                selectedSeats={selectedSeats} 
                onSeatClick={handleSeatClick} 
                seatTypes={seatTypes} 
            />
        </div>

        {/* Right Column: Cart & Payment */}
        <div className="col-span-4 flex flex-col gap-4 overflow-y-auto pb-4">
            <PosCart 
                selectedMovie={selectedMovie}
                selectedShowtime={selectedShowtime}
                selectedDate={selectedDate}
                selectedSeats={selectedSeats}
                onSeatRemove={handleSeatClick}
                combos={combos}
                comboQuantities={comboQuantities}
                onComboChange={handleComboChange}
                customerEmail={customerEmail}
                setCustomerEmail={setCustomerEmail}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                totalAmount={totalAmount}
                onCheckout={handleCheckout}
                processingPayment={processingPayment}
                hasPermission={hasPermission}
            />
        </div>
      </div>

      <PosPaymentDialog 
          open={showPaymentDialog} 
          onOpenChange={setShowPaymentDialog} 
          paymentUrl={paymentUrl} 
          iframeRef={iframeRef} 
          checkIframeUrl={checkIframeUrl} 
      />
    </div>
  );
}
