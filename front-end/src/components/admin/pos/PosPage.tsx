"use client";

import React, { useState, useMemo } from 'react';
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
import { Armchair, Minus, Plus, TicketCheck, Ticket, Search, X } from 'lucide-react'; 
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

// --- (Dữ liệu giả) ---
const movies = [
  { id: 1, title: "Inside Out 2", posterUrl: "https://upload.wikimedia.org/wikipedia/vi/thumb/a/a3/Inside_Out_2_VN_poster.jpg/375px-Inside_Out_2_VN_poster.jpg" },
  { id: 2, title: "Deadpool & Wolverine", posterUrl: "https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg" },
  { id: 3, title: "Despicable Me 4", posterUrl: "https://upload.wikimedia.org/wikipedia/en/e/ed/Despicable_Me_4_Theatrical_Release_Poster.jpeg" },
  { id: 4, title: "Phim D", posterUrl: "https://upload.wikimedia.org/wikipedia/vi/thumb/a/a3/Inside_Out_2_VN_poster.jpg/375px-Inside_Out_2_VN_poster.jpg" },
  { id: 5, title: "Phim E", posterUrl: "https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg" },
];
const showtimes = [
  { id: 101, time: "15:30", endTime: "17:13", format: "2D Phụ đề", movieId: 1, roomId: 1 },
  { id: 102, time: "16:00", endTime: "17:43", format: "3D Lồng tiếng", movieId: 1, roomId: 2 },
  { id: 103, time: "17:30", endTime: "19:13", format: "2D Phụ đề", movieId: 1, roomId: 1 },
  { id: 104, time: "15:45", endTime: "17:55", format: "IMAX 2D", movieId: 2, roomId: 1 },
  { id: 105, time: "18:00", endTime: "20:10", format: "IMAX 2D", movieId: 2, roomId: 1 },
  { id: 106, time: "19:40", endTime: "21:23", format: "2D Phụ đề | CINE FOREST", movieId: 3, roomId: 4 }, 
];
const availableCombos = [
  { id: 1, name: "Combo Bắp Lớn + 2 Nước", price: 125000 },
  { id: 2, name: "Combo Bắp Vừa + 1 Nước", price: 85000 },
  { id: 3, name: "Combo Couple (2 Bắp + 2 Nước)", price: 150000 },
];

const dates = [
    { day: "15", label: "Hôm nay" },
    { day: "16", label: "Chủ nhật" },
    { day: "17", label: "Thứ 2" },
    { day: "18", label: "Thứ 3" },
    { day: "19", label: "Thứ 4" },
    { day: "20", label: "Thứ 5" },
    { day: "21", label: "Thứ 6" },
];


type LoaiGhe = 'thuong' | 'vip' | 'doi' | 'disabled';
type TrangThaiPhongChieu = "HOATDONG" | "BAOTRI" | "NGUNGHOATDONG";
interface SeatMapData {
  rows: string[];
  cols: number;
  seats: Record<string, 'vip' | 'doi' | 'disabled'>;
}
interface PhongChieu {
  MaPhongChieu: number;
  TenPhongChieu: string;
  TrangThai: TrangThaiPhongChieu;
  SoLuongGhe: number;
  SoDoGhe: string; 
}
// Sơ đồ ghế mẫu (Giống RoomManagementPage)
const mockSeatMap: SeatMapData = {
  rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
  cols: 14,
  seats: {
    "A1": "disabled", "A14": "disabled", "B1": "disabled", "B14": "disabled",
    "E1": "vip", "E2": "vip", "E3": "vip", "E4": "vip", "E5": "vip", "E6": "vip", "E7": "vip", "E8": "vip", "E9": "vip", "E10": "vip", "E11": "vip", "E12": "vip", "E13": "vip", "E14": "vip",
    "F1": "vip", "F2": "vip", "F3": "vip", "F4": "vip", "F5": "vip", "F6": "vip", "F7": "vip", "F8": "vip", "F9": "vip", "F10": "vip", "F11": "vip", "F12": "vip", "F13": "vip", "F14": "vip",
    "G1": "doi", "G2": "doi", "G3": "doi", "G4": "doi", "G5": "doi", "G6": "doi", "G7": "doi", "G8": "doi", "G9": "doi", "G10": "doi", "G11": "doi", "G12": "doi", "G13": "doi", "G14": "doi",
    "H1": "doi", "H2": "doi", "H3": "doi", "H4": "doi", "H5": "doi", "H6": "doi", "H7": "doi", "H8": "doi", "H9": "doi", "H10": "doi", "H11": "doi", "H12": "doi", "H13": "doi", "H14": "doi",
  }
};
const mockSeatMapJson = JSON.stringify(mockSeatMap);
// Sơ đồ ghế CINE FOREST (khác biệt)
const mockCineForestMap: SeatMapData = {
    rows: ["A", "B", "C", "D", "E"],
    cols: 10,
    seats: {
        "A1": "doi", "A2": "doi", "A3": "doi", "A4": "doi", "A5": "doi", "A6": "doi", "A7": "doi", "A8": "doi", "A9": "doi", "A10": "doi",
        "B1": "doi", "B2": "doi", "B3": "doi", "B4": "doi", "B5": "doi", "B6": "doi", "B7": "doi", "B8": "doi", "B9": "doi", "B10": "doi",
        "C1": "vip", "C2": "vip", "C3": "vip", "C4": "vip", "C5": "vip", "C6": "vip", "C7": "vip", "C8": "vip", "C9": "vip", "C10": "vip",
    }
};
// Danh sách phòng chiếu
const mockPhongChieuList: PhongChieu[] = [
  { MaPhongChieu: 1, TenPhongChieu: "Phòng 1 (IMAX)", TrangThai: "HOATDONG", SoLuongGhe: 104, SoDoGhe: mockSeatMapJson },
  { MaPhongChieu: 2, TenPhongChieu: "Phòng 2 (2D)", TrangThai: "HOATDONG", SoLuongGhe: 104, SoDoGhe: mockSeatMapJson },
  { MaPhongChieu: 3, TenPhongChieu: "Phòng 3 (3D)", TrangThai: "BAOTRI", SoLuongGhe: 104, SoDoGhe: mockSeatMapJson },
  { MaPhongChieu: 4, TenPhongChieu: "Phòng 4 (CINE FOREST)", TrangThai: "HOATDONG", SoLuongGhe: 80, SoDoGhe: JSON.stringify(mockCineForestMap) },
];
// --- HẾT BỔ SUNG DỮ LIỆU PHÒNG ---

const mockBookedSeats: string[] = ["A3", "A4", "C5", "C6", "D10"];

// Giá vé (Giữ nguyên)
const TICKET_PRICE = 75000;
const VIP_SURCHARGE = 25000;
const DOUBLE_SURCHARGE = 50000;

interface SelectedCombo {
  id: number;
  name: string;
  price: number;
  quantity: number;
}
interface SelectedSeat {
  id: string; 
  type: "thuong" | "vip" | "doi";
  price: number;
}
// Helper lấy loại ghế từ Sơ đồ
const getSeatType = (seatId: string, map: SeatMapData | null): LoaiGhe => {
    if (!map) return 'disabled';
    return map.seats[seatId] || 'thuong';
};

// Soát Vé 
function TicketValidationSection() {
    const [ticketCode, setTicketCode] = useState("");
    const [validationResult, setValidationResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const handleValidate = () => {
        if (!ticketCode) return;
        setIsLoading(true);
        setValidationResult(null);
        setTimeout(() => {
            setIsLoading(false);
            if (ticketCode === "123456") {
                setValidationResult("✅ Vé hợp lệ: 2 vé VIP, Phim Inside Out 2, Suất 15:30.");
            } else {
                setValidationResult("❌ Vé không hợp lệ hoặc đã được sử dụng.");
            }
        }, 1000);
    };
    return (
        <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg max-w-2xl mx-auto">
            <CardHeader><CardTitle className="text-lg font-semibold text-slate-100">Soát vé (Nhập mã vé)</CardTitle></CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                <Input type="text" placeholder="Nhập mã vé..." value={ticketCode} onChange={(e) => setTicketCode(e.target.value)} className="bg-transparent border-slate-700 text-slate-300 text-lg flex-1" />
                <Button size="lg" className="text-lg h-9" onClick={handleValidate} disabled={isLoading}>
                    <Search className="size-5 mr-2" />{isLoading ? "Đang kiểm tra..." : "Kiểm tra"}
                </Button>
            </CardContent>
            {validationResult && (
                <CardFooter><p className={cn("text-base font-medium", validationResult.startsWith("✅") ? "text-green-500" : "text-red-500")}>{validationResult}</p></CardFooter>
            )}
        </Card>
    );
}

// Component Bán Vé (POS) chính
export default function PosPage() {
  const [mode, setMode] = useState<"sell" | "validate">("sell");
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("15");
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(null);

  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [selectedCombos, setSelectedCombos] = useState<SelectedCombo[]>([]);

  // --- State cho Dialog Thanh toán ---
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
      name: "",
      email: "",
      phone: "",
      ageConfirmed: true,
      termsConfirmed: true
  });
  
  // Lọc suất chiếu theo phim
  const filteredShowtimes = useMemo(() => {
    return showtimes.filter(s => s.movieId === selectedMovieId);
  }, [selectedMovieId]);
  // Nhóm suất chiếu theo định dạng
  const groupedShowtimes = useMemo(() => {
      return filteredShowtimes.reduce((acc, show) => {
          (acc[show.format] = acc[show.format] || []).push(show);
          return acc;
      }, {} as Record<string, typeof showtimes>);
  }, [filteredShowtimes]);

  // --- THAY ĐỔI LOGIC: LẤY PHÒNG VÀ SƠ ĐỒ GHẾ ĐỘNG ---
  // 1. Tìm suất chiếu đã chọn
  const selectedShowtime = useMemo(() => {
      return showtimes.find(s => s.id === selectedShowtimeId);
  }, [selectedShowtimeId]);
  
  // 2. Tìm phòng chiếu từ suất chiếu đã chọn
  const selectedRoom = useMemo(() => {
      if (!selectedShowtime) return null;
      return mockPhongChieuList.find(r => r.MaPhongChieu === selectedShowtime.roomId);
  }, [selectedShowtime]);

  // 3. Parse JSON Sơ đồ ghế từ phòng đã chọn
  const seatMapData = useMemo(() => {
      if (!selectedRoom) return null;
      try {
          return JSON.parse(selectedRoom.SoDoGhe) as SeatMapData;
      } catch (e) {
          console.error("Lỗi parse JSON sơ đồ ghế:", e);
          return null;
      }
  }, [selectedRoom]);
  // --- KẾT THÚC THAY ĐỔI LOGIC ---

  const handleSeatClick = (seatId: string) => {
    // THAY ĐỔI: Dùng seatMapData động thay vì seatLayout cố định
    const type = getSeatType(seatId, seatMapData);
    if (type === 'disabled') return; // Không cho chọn ghế disabled

    const isBooked = mockBookedSeats.includes(seatId); // Dữ liệu này phải fetch theo MaSuatChieu
    if (isBooked) return; 
    
    const existingSeatIndex = selectedSeats.findIndex(s => s.id === seatId);

    if (existingSeatIndex > -1) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seatId));
    } else {
      let price = TICKET_PRICE;
      
      // THAY ĐỔI: Tính giá dựa trên 'type' động
      if (type === 'vip') {
        price += VIP_SURCHARGE;
      }
      if (type === 'doi') {
        price += DOUBLE_SURCHARGE;
      }
      // Đảm bảo type khớp với SelectedSeat
      const seatType = (type === 'thuong' || type === 'vip' || type === 'doi') ? type : 'thuong';
      setSelectedSeats(prev => [...prev, { id: seatId, type: seatType, price }]);
    }
  };

  const handleComboChange = (combo: typeof availableCombos[0], quantity: number) => {
    setSelectedCombos(prev => {
      const existing = prev.find(c => c.id === combo.id);
      if (existing) {
        const newCombos = prev.map(c => 
          c.id === combo.id ? { ...c, quantity } : c
        );
        return newCombos.filter(c => c.quantity > 0);
      } else if (quantity > 0) {
        return [...prev, { ...combo, quantity }];
      }
      return prev;
    });
  };

  const totalTicketPrice = useMemo(() => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  }, [selectedSeats]);

  const totalComboPrice = useMemo(() => {
    return selectedCombos.reduce((total, combo) => total + (combo.price * combo.quantity), 0);
  }, [selectedCombos]);

  const totalPrice = totalTicketPrice + totalComboPrice;

  const resetSelection = () => {
    setSelectedShowtimeId(null);
    setSelectedSeats([]);
  }

  const handlePaymentClick = () => {
      setIsPaymentDialogOpen(true);
  };

  const handleConfirmPayment = () => {
      alert(`Đã xác nhận thông tin cho khách hàng: ${customerInfo.name}. Tiến hành thanh toán ${totalPrice.toLocaleString('vi-VN')}₫`);
      setIsPaymentDialogOpen(false);
  };

  return (
    <div className="space-y-6 text-slate-100">
        
        {/* THANH CHUYỂN CHẾ ĐỘ (BÁN VÉ / SOÁT VÉ) */}
        <ButtonGroup className="w-full">
            <Button 
                onClick={() => setMode('sell')}
                variant={mode === 'sell' ? 'default' : 'outline'}
                className={cn("flex-1 text-base py-6 rounded-r-none", mode === 'sell' ? "bg-primary text-primary-foreground" : "bg-[#1C1C1C] border-slate-700 text-slate-300 hover:bg-slate-800")}
            >
                <Ticket className="size-5 mr-2"/>
                Bán vé tại quầy
            </Button>
            <Button 
                onClick={() => setMode('validate')}
                variant={mode === 'validate' ? 'default' : 'outline'}
                className={cn("flex-1 text-base py-6 rounded-l-none", mode === 'validate' ? "bg-primary text-primary-foreground" : "bg-[#1C1C1C] border-slate-700 text-slate-300 hover:bg-slate-800")}
            >
                <TicketCheck className="size-5 mr-2"/>
                Soát vé
            </Button>
        </ButtonGroup>

        {mode === 'sell' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* CỘT TRÁI (2 CỘT CON): CHỌN PHIM, SUẤT, GHẾ */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* CAROUSEL CHỌN PHIM */}
              <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-100">1. Chọn phim</CardTitle>
                </CardHeader>
                <CardContent className="px-12 ml-2 mr-2">
                  <Carousel opts={{ align: "start", slidesToScroll: "auto" }} className="w-full">
                    <CarouselContent className="ml-0 py-2">
                      {movies.map((movie) => (
                        <CarouselItem 
                          key={movie.id} 
                          className="basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 pl-0 px-2"
                        >
                           <button
                             onClick={() => {
                               setSelectedMovieId(movie.id);
                               resetSelection();
                             }}
                             className={cn(
                                "rounded-lg overflow-hidden relative w-full aspect-[2/3] transition-all duration-300",
                                selectedMovieId === movie.id 
                                  ? "ring-4 ring-primary ring-offset-2 ring-offset-[#1C1C1C]" 
                                  : "opacity-60 hover:opacity-100"
                             )}
                           >
                              <Image 
                                src={movie.posterUrl} 
                                alt={movie.title} 
                                fill 
                                className="object-cover"
                                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 16vw"
                              />
                           </button>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white" />
                    <CarouselNext className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white" />
                  </Carousel>
                </CardContent>
              </Card>

              {/* CHỌN NGÀY VÀ LƯỚI SUẤT CHIẾU */}
              {selectedMovieId && (
                <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-100">2. Chọn ngày và suất chiếu</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ScrollArea className="w-full whitespace-nowrap">
                       <div className="flex gap-2 pb-3">
                        {dates.map((date) => (
                            <Button 
                                key={date.day}
                                variant={selectedDate === date.day ? 'default' : 'outline'}
                                className={cn(
                                    "flex flex-col h-auto px-4 py-2 text-center",
                                    selectedDate === date.day 
                                        ? "bg-primary text-primary-foreground" 
                                        : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                                )}
                                onClick={() => {
                                    setSelectedDate(date.day);
                                    resetSelection();
                                }}
                            >
                                <span className="text-xl font-bold">{date.day}</span>
                                <span className="text-xs">{date.label}</span>
                            </Button>
                        ))}
                       </div>
                    </ScrollArea>
                    
                    {/* Lưới suất chiếu */}
                    {Object.keys(groupedShowtimes).length > 0 ? (
                        Object.entries(groupedShowtimes).map(([format, shows]) => (
                            <div key={format} className="space-y-3">
                                <h4 className="font-semibold text-slate-200">{format}</h4>
                                <div className="flex flex-wrap gap-3">
                                    {shows.map(show => (
                                        <Button
                                            key={show.id}
                                            variant={selectedShowtimeId === show.id ? 'default' : 'outline'}
                                            className={cn(
                                                "h-auto",
                                                selectedShowtimeId === show.id
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                                            )}
                                            onClick={() => {
                                                setSelectedShowtimeId(show.id);
                                                setSelectedSeats([]);
                                            }}
                                        >
                                            <span className="font-bold">{show.time}</span>
                                            <span className="text-xs ml-1.5">~ {show.endTime}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-slate-500 italic">Không có suất chiếu cho phim và ngày đã chọn.</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* SƠ ĐỒ GHẾ */}
              {selectedShowtimeId && (
                <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg">
                  <CardHeader>
                    {/* THAY ĐỔI: Thêm tên phòng */}
                    <CardTitle className="text-lg font-semibold text-slate-100">
                      3. Chọn ghế {selectedRoom && `- ${selectedRoom.TenPhongChieu}`}
                    </CardTitle>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 pt-2">
                        <div className="flex items-center gap-1.5"><Armchair className="size-4 text-slate-500" /> Trống</div>
                        <div className="flex items-center gap-1.5"><Armchair className="size-4 text-yellow-500" /> VIP</div>
                        <div className="flex items-center gap-1.5"><Armchair className="size-4 text-purple-500" /> Ghế đôi</div>
                        <div className="flex items-center gap-1.5"><Armchair className="size-4 text-primary ring-1 ring-primary" /> Đang chọn</div>
                        <div className="flex items-center gap-1.5"><Armchair className="size-4 text-slate-700" /> Đã đặt</div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center px-4">
                    <div className="bg-slate-700 text-center py-1.5 px-12 text-sm rounded-md mb-8 w-full uppercase tracking-widest">
                      Màn hình
                    </div>
                    <ScrollArea className="w-full h-auto">
                      <div className="flex flex-col gap-2 w-full items-center py-2">
                        {/* THAY ĐỔI: Render từ seatMapData động */}
                        {!seatMapData ? (
                            <p className="text-red-500">Lỗi: Không tải được sơ đồ ghế cho phòng này.</p>
                        ) : (
                            seatMapData.rows.map(row => (
                              <div key={row} className="flex gap-2 items-center">
                                <span className="text-sm font-medium w-6 text-center text-slate-500">{row}</span>
                                {Array.from({ length: seatMapData.cols }, (_, i) => {
                                  const col = i + 1;
                                  const seatId = `${row}${col}`;
                                  
                                  // Lấy loại ghế động
                                  const type = getSeatType(seatId, seatMapData);
                                  const isBooked = mockBookedSeats.includes(seatId); // Dữ liệu này sẽ fetch theo suất chiếu
                                  const isDisabled = type === 'disabled';
                                  const isVip = type === 'vip';
                                  const isDouble = type === 'doi';
                                  
                                  const isSelected = selectedSeats.some(s => s.id === seatId);

                                  return (
                                    <Button
                                      key={seatId}
                                      variant="outline"
                                      size="icon"
                                      className={cn(
                                        "size-8 p-0 text-xs",
                                        // Áp dụng class động
                                        type === 'thuong' && "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-500",
                                        isVip && "bg-yellow-800/20 border-yellow-700 hover:bg-yellow-700/30 text-yellow-500",
                                        isDouble && "bg-purple-800/20 border-purple-700 hover:bg-purple-700/30 text-purple-500",
                                        
                                        isSelected && "bg-primary border-primary text-primary-foreground hover:bg-primary/80 ring-2 ring-offset-2 ring-offset-[#1C1C1C] ring-primary", 
                                        (isBooked || isDisabled) && "bg-slate-700 border-slate-700 text-slate-600 opacity-50 cursor-not-allowed" // Đã đặt hoặc Lối đi
                                      )}
                                      onClick={() => handleSeatClick(seatId)}
                                      disabled={isBooked || isDisabled}
                                    >
                                      {isDisabled ? <X className="size-4" /> : col}
                                    </Button>
                                  );
                                })}
                                <span className="text-sm font-medium w-6 text-center text-slate-500">{row}</span>
                              </div>
                            ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* CỘT PHẢI (1 CỘT CON): HÓA ĐƠN */}
            <div className="lg:col-span-1">
              <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-100">Hóa đơn</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-300">Vé đã chọn ({selectedSeats.length})</h4>
                    <ScrollArea className="h-28 pr-3">
                      {selectedSeats.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">Vui lòng chọn ghế...</p>
                      ) : (
                        <ul className="space-y-1">
                          {selectedSeats.map(seat => (
                            <li key={seat.id} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <Badge variant={ seat.type === 'vip' ? 'default' : (seat.type === 'doi' ? 'secondary' : 'outline') } 
                                  className={cn(
                                    seat.type === 'vip' && "bg-yellow-500 text-black",
                                    seat.type === 'doi' && "bg-purple-500 text-white",
                                    seat.type === 'thuong' && "border-slate-500 text-slate-300"
                                )}>
                                  Ghế {seat.id}
                                </Badge>
                                <span className="text-xs text-slate-400 capitalize">({seat.type})</span>
                              </div>
                              <span className="font-medium">{seat.price.toLocaleString('vi-VN')} ₫</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </ScrollArea>
                    <Separator className="bg-slate-700" />
                    <div className="flex justify-between font-semibold">
                      <span>Tổng tiền vé</span>
                      <span>{totalTicketPrice.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  </div>

                  <Separator className="bg-slate-700" />
                  
                  {/* (Phần Chọn Combo) */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-300">Chọn Combo</h4>
                    <ScrollArea className="h-40 pr-3">
                      <ul className="space-y-3">
                        {availableCombos.map(combo => {
                          const quantity = selectedCombos.find(c => c.id === combo.id)?.quantity || 0;
                          return (
                            <li key={combo.id} className="flex justify-between items-center">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">{combo.name}</p>
                                <p className="text-xs text-slate-400">{combo.price.toLocaleString('vi-VN')} ₫</p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Button variant="outline" size="icon-sm" className="size-6 bg-slate-800 border-slate-700" onClick={() => handleComboChange(combo, quantity - 1)} disabled={quantity === 0}>
                                  <Minus className="size-3" />
                                </Button>
                                <span className="w-5 text-center text-sm font-medium">{quantity}</span>
                                <Button variant="outline" size="icon-sm" className="size-6 bg-slate-800 border-slate-700" onClick={() => handleComboChange(combo, quantity + 1)}>
                                  <Plus className="size-3" />
                                </Button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </ScrollArea>
                    <Separator className="bg-slate-700" />
                    <div className="flex justify-between font-semibold">
                      <span>Tổng tiền combo</span>
                      <span>{totalComboPrice.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex-col gap-4 !pt-6 border-t border-slate-800">
                  <div className="flex justify-between items-center w-full text-xl font-bold">
                    <span className="text-slate-200">TỔNG CỘNG</span>
                    <span className="text-primary">{totalPrice.toLocaleString('vi-VN')} ₫</span>
                  </div>

                  {/* (Phần Phương thức thanh toán) */}
                  <div className="w-full space-y-2">
                      <Label htmlFor="payment-method" className="text-sm font-medium text-slate-300">
                          Phương thức thanh toán
                      </Label>
                      <Select defaultValue="cash">
                        <SelectTrigger id="payment-method" className="w-full bg-transparent border-slate-700 text-slate-300">
                          <SelectValue placeholder="Phương thức thanh toán" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1C1C1C] text-slate-100 border-slate-700">
                          <SelectItem value="cash" className="cursor-pointer focus:bg-slate-700">Tiền mặt</SelectItem>
                          <SelectItem value="card" className="cursor-pointer focus:bg-slate-700">Thanh toán thẻ</SelectItem>
                          <SelectItem value="momo" className="cursor-pointer focus:bg-slate-700">Momo</SelectItem>
                          <SelectItem value="vnpay" className="cursor-pointer focus:bg-slate-700">VNPay</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full text-lg h-12"
                    disabled={selectedSeats.length === 0}
                    onClick={handlePaymentClick}
                  >
                    Thanh toán
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <TicketValidationSection />
        )}

        {/* --- Dialog Thông tin người nhận vé --- */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent className="sm:max-w-[500px] bg-[#1C1C1C] border-slate-800 text-white p-6 rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Thông tin người nhận vé</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Vui lòng nhập thông tin để nhận vé điện tử.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-5 py-3">
                    {/* Họ tên */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-200">Họ và tên</Label>
                        <Input 
                            id="name" 
                            placeholder="Nhập họ và tên" 
                            className="bg-[#2a2a2a] border-slate-700 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary/50"
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        />
                    </div>
                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-200">Email (để nhận vé)</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="Nhập email" 
                            className="bg-[#2a2a2a] border-slate-700 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary/50"
                            value={customerInfo.email}
                            onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        />
                    </div>
                    {/* SĐT */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-200">Số điện thoại</Label>
                        <Input 
                            id="phone" 
                            placeholder="Nhập số điện thoại" 
                            className="bg-[#2a2a2a] border-slate-700 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary/50"
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        />
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-start space-x-3">
                            <Checkbox 
                                id="age" 
                                className="border-slate-500 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                checked={customerInfo.ageConfirmed}
                                onCheckedChange={(checked) => setCustomerInfo({...customerInfo, ageConfirmed: checked as boolean})}
                            />
                            <Label htmlFor="age" className="text-slate-300 text-sm font-normal leading-tight cursor-pointer">
                                Đảm bảo mua vé đúng số tuổi quy định.
                            </Label>
                        </div>
                        <div className="flex items-start space-x-3">
                            <Checkbox 
                                id="terms" 
                                className="border-slate-500 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                checked={customerInfo.termsConfirmed}
                                onCheckedChange={(checked) => setCustomerInfo({...customerInfo, termsConfirmed: checked as boolean})}
                            />
                            <Label htmlFor="terms" className="text-slate-300 text-sm font-normal leading-tight cursor-pointer">
                                Đồng ý với điều khoản của rạp.
                            </Label>
                        </div>
                    </div>
                </div>
                <DialogFooter className="sm:justify-end gap-3 pt-2">
                    <Button 
                        variant="outline" 
                        className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white min-w-[80px]"
                        onClick={() => setIsPaymentDialogOpen(false)}
                    >
                        Hủy
                    </Button>
                    <Button 
                        className="bg-[#ff6b00] hover:bg-[#e65c00] text-white min-w-[120px] font-medium"
                        onClick={handleConfirmPayment}
                    >
                        Tiếp tục
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}