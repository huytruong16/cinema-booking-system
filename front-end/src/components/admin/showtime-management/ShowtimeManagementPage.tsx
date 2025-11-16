"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, CalendarIcon, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays, subDays, startOfDay, addMinutes, getMinutes, getHours } from "date-fns";
import { vi } from "date-fns/locale";

type TrangThaiSuatChieu = "CHUACHIEU" | "DANGCHIEU" | "DACHIEU" | "DAHUY";

interface SuatChieuView {
  MaSuatChieu: number;
  MaPhimDinhDang: number;
  TenPhim: string;
  TenDinhDang: string;
  PosterUrl: string | null;
  ThoiLuong: number;
  MaPhongChieu: number;
  TenPhongChieu: string;
  ThoiGianBatDau: Date;
  ThoiGianKetThuc: Date;
  TrangThai: TrangThaiSuatChieu;
}

interface PhimDinhDang {
  MaPhimDinhDang: number;
  TenPhim: string;
  TenDinhDang: string;
  PosterUrl: string | null;
  ThoiLuong: number; 
}

interface PhongChieu {
  MaPhongChieu: number;
  TenPhongChieu: string;
}

// --- DỮ LIỆU GIẢ (MOCK DATA) ---
const mockPhimDinhDangList: PhimDinhDang[] = [
  { MaPhimDinhDang: 1, TenPhim: "Inside Out 2", TenDinhDang: "2D Phụ đề", PosterUrl: "https://upload.wikimedia.org/wikipedia/vi/thumb/a/a3/Inside_Out_2_VN_poster.jpg/375px-Inside_Out_2_VN_poster.jpg", ThoiLuong: 96 },
  { MaPhimDinhDang: 2, TenPhim: "Inside Out 2", TenDinhDang: "3D Lồng tiếng", PosterUrl: "https://upload.wikimedia.org/wikipedia/vi/thumb/a/a3/Inside_Out_2_VN_poster.jpg/375px-Inside_Out_2_VN_poster.jpg", ThoiLuong: 96 },
  { MaPhimDinhDang: 3, TenPhim: "Deadpool & Wolverine", TenDinhDang: "IMAX 2D", PosterUrl: "https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg", ThoiLuong: 127 },
  { MaPhimDinhDang: 4, TenPhim: "Kẻ Trộm Mặt Trăng 4", TenDinhDang: "2D Lồng tiếng", PosterUrl: "https://upload.wikimedia.org/wikipedia/en/e/ed/Despicable_Me_4_Theatrical_Release_Poster.jpeg", ThoiLuong: 95 },
];

const mockPhongChieuList: PhongChieu[] = [
  { MaPhongChieu: 1, TenPhongChieu: "Phòng 1 (IMAX)" },
  { MaPhongChieu: 2, TenPhongChieu: "Phòng 2 (2D)" },
  { MaPhongChieu: 3, TenPhongChieu: "Phòng 3 (3D)" },
  { MaPhongChieu: 4, TenPhongChieu: "Phòng 4 (CINE FOREST)" },
];

const today = startOfDay(new Date());
const mockShowtimes: SuatChieuView[] = [
  // Phòng 1
  {
    MaSuatChieu: 101, 
    ...mockPhimDinhDangList[2], // Đã chứa MaPhimDinhDang: 3
    MaPhongChieu: 1, TenPhongChieu: "Phòng 1 (IMAX)",
    ThoiGianBatDau: addMinutes(today, 9 * 60 + 30), // 9:30
    ThoiGianKetThuc: addMinutes(today, 9 * 60 + 30 + 127), // 11:37
    TrangThai: "DANGCHIEU",
  },
  {
    MaSuatChieu: 102, 
    ...mockPhimDinhDangList[2], // Đã chứa MaPhimDinhDang: 3
    MaPhongChieu: 1, TenPhongChieu: "Phòng 1 (IMAX)",
    ThoiGianBatDau: addMinutes(today, 12 * 60), // 12:00
    ThoiGianKetThuc: addMinutes(today, 12 * 60 + 127), // 14:07
    TrangThai: "CHUACHIEU",
  },
    {
    MaSuatChieu: 103, 
    ...mockPhimDinhDangList[2], // Đã chứa MaPhimDinhDang: 3
    MaPhongChieu: 1, TenPhongChieu: "Phòng 1 (IMAX)",
    ThoiGianBatDau: addMinutes(today, 15 * 60), // 15:00
    ThoiGianKetThuc: addMinutes(today, 15 * 60 + 127), // 17:07
    TrangThai: "CHUACHIEU",
  },
  // Phòng 2
  {
    MaSuatChieu: 104, 
    ...mockPhimDinhDangList[0], // Đã chứa MaPhimDinhDang: 1
    MaPhongChieu: 2, TenPhongChieu: "Phòng 2 (2D)",
    ThoiGianBatDau: addMinutes(today, 10 * 60), // 10:00
    ThoiGianKetThuc: addMinutes(today, 10 * 60 + 96), // 11:36
    TrangThai: "CHUACHIEU",
  },
    {
    MaSuatChieu: 105, 
    ...mockPhimDinhDangList[0], // Đã chứa MaPhimDinhDang: 1
    MaPhongChieu: 2, TenPhongChieu: "Phòng 2 (2D)",
    ThoiGianBatDau: addMinutes(today, 14 * 60 + 30), // 14:30
    ThoiGianKetThuc: addMinutes(today, 14 * 60 + 30 + 96), // 16:06
    TrangThai: "CHUACHIEU",
  },
  // Phòng 3
  {
    MaSuatChieu: 106, 
    ...mockPhimDinhDangList[3], // Đã chứa MaPhimDinhDang: 4
    MaPhongChieu: 3, TenPhongChieu: "Phòng 3 (3D)",
    ThoiGianBatDau: addMinutes(subDays(today, 1), 20 * 60), // 20:00 hôm qua
    ThoiGianKetThuc: addMinutes(subDays(today, 1), 20 * 60 + 95), // 21:35 hôm qua
    TrangThai: "DACHIEU",
  },
    {
    MaSuatChieu: 107, 
    ...mockPhimDinhDangList[3], // Đã chứa MaPhimDinhDang: 4
    MaPhongChieu: 3, TenPhongChieu: "Phòng 3 (3D)",
    ThoiGianBatDau: addMinutes(today, 18 * 60), // 18:00
    ThoiGianKetThuc: addMinutes(today, 18 * 60 + 95), // 19:35
    TrangThai: "DAHUY",
  },
];

const trangThaiOptions: { value: TrangThaiSuatChieu; label: string }[] = [
  { value: "CHUACHIEU", label: "Chưa chiếu" },
  { value: "DANGCHIEU", label: "Đang chiếu" },
  { value: "DACHIEU", label: "Đã chiếu" },
  { value: "DAHUY", label: "Đã hủy" },
];
// --- HẾT DỮ LIỆU GIẢ ---

// --- LOGIC CHO TIMELINE ---
// Chúng ta sẽ hiển thị 18 tiếng, từ 8:00 sáng đến 2:00 sáng hôm sau (8*60 = 480 -> 26*60 = 1560)
const DAY_START_MINUTES = 8 * 60;
const DAY_TOTAL_MINUTES = (26 - 8) * 60; // 18 giờ * 60 phút = 1080 phút


function calculateTimelineStyle(showtime: SuatChieuView, selectedDate: Date) {
  const dayStart = startOfDay(selectedDate).getTime() + DAY_START_MINUTES * 60000;
  
  const startTime = showtime.ThoiGianBatDau.getTime();
  const endTime = showtime.ThoiGianKetThuc.getTime();

  const startMinutes = (startTime - dayStart) / 60000;
  const endMinutes = (endTime - dayStart) / 60000;
  const durationMinutes = (endTime - startTime) / 60000;

  if (endMinutes < 0 || startMinutes > DAY_TOTAL_MINUTES) {
    return null;
  }

  const left = Math.max(0, (startMinutes / DAY_TOTAL_MINUTES) * 100);

  const effectiveStartMinutes = Math.max(0, startMinutes);
  const effectiveEndMinutes = Math.min(DAY_TOTAL_MINUTES, endMinutes);
  const width = ((effectiveEndMinutes - effectiveStartMinutes) / DAY_TOTAL_MINUTES) * 100;

  return {
    left: `${left}%`,
    width: `${width}%`,
  };
}

const getBadgeVariant = (trangThai: TrangThaiSuatChieu) => {
    switch (trangThai) {
        case "DANGCHIEU": return "bg-green-600 text-white";
        case "CHUACHIEU": return "bg-blue-600 text-white";
        case "DACHIEU": return "bg-slate-500 text-slate-200 border-slate-400";
        case "DAHUY": return "bg-red-600 text-white";
        default: return "outline";
    }
};
const getBadgeLabel = (trangThai: TrangThaiSuatChieu) => {
  return trangThaiOptions.find(o => o.value === trangThai)?.label || trangThai;
};

export default function ShowtimeManagementPage() {
  const [allShowtimes, setAllShowtimes] = useState<SuatChieuView[]>(mockShowtimes);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [selectedShowtime, setSelectedShowtime] = useState<SuatChieuView | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<SuatChieuView | null>(null);

  const showtimesForSelectedDate = useMemo(() => {
    const selectedDayStart = selectedDate.getTime();
    const selectedDayEnd = addDays(selectedDayStart, 1).getTime();
    
    return allShowtimes.filter(sc => {
        const scTime = sc.ThoiGianBatDau.getTime();
        return scTime >= selectedDayStart && scTime < selectedDayEnd;
    });
  }, [allShowtimes, selectedDate]);

  const handleAddNew = () => {
    setEditingShowtime(null); 
    setIsModalOpen(true);
  };
  const handleEdit = (showtime: SuatChieuView) => {
    setEditingShowtime(showtime); 
    setIsModalOpen(true);
  };

  const handleFormSubmit = (formData: SuatChieuView) => {
    if (editingShowtime) {
        setAllShowtimes(prev => prev.map(sc => sc.MaSuatChieu === formData.MaSuatChieu ? formData : sc));
        if (selectedShowtime?.MaSuatChieu === formData.MaSuatChieu) {
            setSelectedShowtime(formData);
        }
    } else {
        const newShowtime = { 
            ...formData, 
            MaSuatChieu: Math.max(...allShowtimes.map(sc => sc.MaSuatChieu)) + 1 
        };
        setAllShowtimes(prev => [newShowtime, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (maSuatChieu: number) => {
      setAllShowtimes(prev => prev.filter(sc => sc.MaSuatChieu !== maSuatChieu));
      if (selectedShowtime?.MaSuatChieu === maSuatChieu) {
          setSelectedShowtime(null);
      }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-white h-[calc(100vh-120px)]">
      <div className="lg:col-span-2 space-y-4 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">Quản lý Lịch chiếu</h1>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setSelectedDate(prev => subDays(prev, 1))} className="bg-transparent border-slate-700 hover:bg-slate-800">
                <ChevronsLeft className="size-4" />
            </Button>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full min-w-[240px] justify-start text-left font-normal bg-transparent border-slate-700 hover:bg-slate-800 hover:text-white")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, "PPP", { locale: vi })}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-slate-700 text-white">
                    <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(startOfDay(date))} initialFocus />
                </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" onClick={() => setSelectedDate(prev => addDays(prev, 1))} className="bg-transparent border-slate-700 hover:bg-slate-800">
                <ChevronsRight className="size-4" />
            </Button>
          </div>

          <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
            <Plus className="size-4 mr-2" />
            Thêm lịch chiếu
          </Button>
        </div>

        <ScrollArea className="flex-1 pr-4 pt-5">
            <div className="space-y-4">
                <TimelineGrid />
                
                {mockPhongChieuList.map(room => {
                    const showtimesForRoom = showtimesForSelectedDate.filter(sc => sc.MaPhongChieu === room.MaPhongChieu);
                    return (
                        <RoomTimeline
                            key={room.MaPhongChieu}
                            room={room}
                            showtimes={showtimesForRoom}
                            selectedDate={selectedDate}
                            onSelectShowtime={setSelectedShowtime}
                            onEditShowtime={handleEdit}
                            selectedShowtimeId={selectedShowtime?.MaSuatChieu}
                        />
                    );
                })}
            </div>
        </ScrollArea>
      </div>

      <div className="lg:col-span-1">
        {selectedShowtime ? (
            <ShowtimeDetailPanel 
                showtime={selectedShowtime} 
                onClose={() => setSelectedShowtime(null)}
                onEdit={() => handleEdit(selectedShowtime)}
                onDelete={handleDelete}
            />
        ) : (
            <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg sticky top-4 flex items-center justify-center h-96">
                <p className="text-slate-500">Chọn một suất chiếu để xem thông tin</p>
            </Card>
        )}
      </div>

      {isModalOpen && (
        <ShowtimeFormDialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          showtime={editingShowtime}
          selectedDate={selectedDate} 
        />
      )}
    </div>
  );
}

interface RoomTimelineProps {
    room: PhongChieu;
    showtimes: SuatChieuView[];
    selectedDate: Date;
    onSelectShowtime: (showtime: SuatChieuView) => void;
    onEditShowtime: (showtime: SuatChieuView) => void;
    selectedShowtimeId?: number | null;
}

function RoomTimeline({ room, showtimes, selectedDate, onSelectShowtime, onEditShowtime, selectedShowtimeId }: RoomTimelineProps) {
    return (
        <Card className="bg-[#1C1C1C] border-slate-800">
            <CardHeader className="py-3 px-4">
                <CardTitle className="text-base font-medium">{room.TenPhongChieu}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <div className="relative h-20 bg-slate-800/50 rounded-md overflow-hidden">
                    <TimelineGrid isBackground />

                    {showtimes.map(sc => {
                        const style = calculateTimelineStyle(sc, selectedDate);
                        if (!style) return null;

                        const isSelected = selectedShowtimeId === sc.MaSuatChieu;
                        
                        return (
                             <Button
                                key={sc.MaSuatChieu}
                                variant="outline"
                                className={cn(
                                    "absolute top-1/2 -translate-y-1/2 h-14 p-2 text-left overflow-hidden",
                                    "flex flex-col items-start justify-center",
                                    getBadgeVariant(sc.TrangThai), 
                                    "hover:opacity-80 transition-all duration-200 border-2",
                                    isSelected ? "border-white" : "border-transparent"
                                )}
                                style={style}
                                onClick={() => onSelectShowtime(sc)}
                            >
                                <span className="text-xs font-semibold line-clamp-2 block w-full leading-tight">{sc.TenPhim}</span>
                                <span className="text-[10px] opacity-90 mt-0.5">{format(sc.ThoiGianBatDau, "HH:mm")} - {format(sc.ThoiGianKetThuc, "HH:mm")}</span>
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

function TimelineGrid({ isBackground = false }) {
    const hours = Array.from({ length: 18 }, (_, i) => i + 8); 

    return (
        <div className={cn(
            "relative w-full flex", 
            isBackground ? "absolute inset-0" : "h-6"
        )}>
            {hours.map(hour => (
                <div 
                    key={hour} 
                    className={cn(
                        "h-full", 
                        isBackground ? "border-r border-slate-700/50" : "border-r border-slate-600"
                    )} 
                    style={{ width: `${(1 / 18) * 100}%` }}
                >
                    {!isBackground && (

                        <span className="text-xs text-slate-2 00 relative left-1 top-1.5">
                            {hour > 23 ? hour - 24 : hour}h
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}

interface DetailPanelProps {
    showtime: SuatChieuView; 
    onClose: () => void; 
    onEdit: () => void;
    onDelete: (maSuatChieu: number) => void;
}

function ShowtimeDetailPanel({ showtime, onEdit, onDelete }: DetailPanelProps) {
    return (
        <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg sticky top-4">
            <CardHeader className="relative">
                <CardTitle className="text-xl font-semibold text-slate-100 pr-10">{showtime.TenPhim}</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[65vh]">
                    <div className="space-y-4 pr-6">
                        {showtime.PosterUrl && (
                            <div className="relative aspect-[1.25] w-full rounded-lg overflow-hidden">
                                <Image src={showtime.PosterUrl} alt={showtime.TenPhim} fill className="object-contain" />
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <Badge variant="outline" className={cn("text-xs", getBadgeVariant(showtime.TrangThai))}>
                                {getBadgeLabel(showtime.TrangThai)}
                            </Badge>
                             <Button variant="outline" size="sm" onClick={onEdit} className="bg-transparent border-slate-700 hover:bg-slate-800">
                                <Edit className="size-3 mr-1.5" />
                                Chỉnh sửa
                            </Button>
                        </div>

                        <InfoRow label="Phòng chiếu" value={showtime.TenPhongChieu} />
                        <InfoRow label="Định dạng" value={showtime.TenDinhDang} />
                        <InfoRow 
                            label="Thời gian bắt đầu" 
                            value={format(showtime.ThoiGianBatDau, "HH:mm 'ngày' dd/MM/yyyy", { locale: vi })} 
                        />
                        <InfoRow 
                            label="Thời gian kết thúc" 
                            value={format(showtime.ThoiGianKetThuc, "HH:mm 'ngày' dd/MM/yyyy", { locale: vi })} 
                        />
                         <InfoRow label="Thời lượng" value={`${showtime.ThoiLuong} phút`} />
                        
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full mt-4">
                                    <Trash2 className="size-4 mr-2" />
                                    Xóa suất chiếu này
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#1C1C1C] border-slate-800 text-white">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                Hành động này không thể hoàn tác. Lịch chiếu phim &quot;{showtime.TenPhim}&quot; lúc {format(showtime.ThoiGianBatDau, "HH:mm dd/MM/yyyy")} sẽ bị xóa vĩnh viễn.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent border-slate-700 hover:bg-slate-800">Hủy</AlertDialogCancel>
                                <AlertDialogAction 
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => onDelete(showtime.MaSuatChieu)}
                                >
                                Xác nhận Xóa
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function InfoRow({ label, value }: { label: string, value: string | null | undefined }) {
    if (!value) return null;
    return (
        <div className="space-y-1">
            <Label className="text-slate-400 text-xs">{label}</Label>
            <p className="text-sm text-slate-100">{value}</p>
        </div>
    );
}

interface ShowtimeFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SuatChieuView) => void;
    showtime: SuatChieuView | null;
    selectedDate: Date;
}

const splitDateTime = (date: Date) => {
    return {
        dateObj: startOfDay(date),
        timeStr: format(date, "HH:mm"),
    };
};

const combineDateTime = (date: Date, timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
};


function ShowtimeFormDialog({ isOpen, onClose, onSubmit, showtime, selectedDate }: ShowtimeFormDialogProps) {
    const [maPhimDinhDang, setMaPhimDinhDang] = useState<number | undefined>(showtime?.MaPhimDinhDang);
    const [maPhongChieu, setMaPhongChieu] = useState<number | undefined>(showtime?.MaPhongChieu);
    const [ngayChieu, setNgayChieu] = useState<Date | undefined>(
        showtime ? splitDateTime(showtime.ThoiGianBatDau).dateObj : selectedDate
    );
    const [gioBatDau, setGioBatDau] = useState<string>(showtime ? splitDateTime(showtime.ThoiGianBatDau).timeStr : "12:00");
    const [trangThai, setTrangThai] = useState<TrangThaiSuatChieu>(showtime?.TrangThai || "CHUACHIEU");

    const [gioKetThuc, setGioKetThuc] = useState<string>(showtime ? splitDateTime(showtime.ThoiGianKetThuc).timeStr : "14:00");

    useEffect(() => {
        if (!maPhimDinhDang || !ngayChieu || !gioBatDau) return;

        const selectedPhim = mockPhimDinhDangList.find(p => p.MaPhimDinhDang === maPhimDinhDang);
        if (selectedPhim) {
            try {
                const batDau = combineDateTime(ngayChieu, gioBatDau);
                const ketThuc = new Date(batDau.getTime() + selectedPhim.ThoiLuong * 60000); 
                setGioKetThuc(format(ketThuc, "HH:mm"));
            } catch (e) {
                console.error("Lỗi tính giờ kết thúc:", e);
            }
        }
    }, [maPhimDinhDang, ngayChieu, gioBatDau]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!maPhimDinhDang || !maPhongChieu || !ngayChieu || !gioBatDau || !gioKetThuc) {
            alert("Vui lòng điền đầy đủ thông tin.");
            return;
        }
        
        const selectedPhim = mockPhimDinhDangList.find(p => p.MaPhimDinhDang === maPhimDinhDang);
        const selectedPhong = mockPhongChieuList.find(p => p.MaPhongChieu === maPhongChieu);

        if (!selectedPhim || !selectedPhong) {
            alert("Thông tin Phim hoặc Phòng chiếu không hợp lệ.");
            return;
        }

        const thoiGianBatDau = combineDateTime(ngayChieu, gioBatDau);
        const thoiGianKetThuc = combineDateTime(ngayChieu, gioKetThuc);

        const formData: SuatChieuView = {
            MaSuatChieu: showtime?.MaSuatChieu || 0,
            MaPhimDinhDang: selectedPhim.MaPhimDinhDang,
            TenPhim: selectedPhim.TenPhim,
            TenDinhDang: selectedPhim.TenDinhDang,
            PosterUrl: selectedPhim.PosterUrl,
            ThoiLuong: selectedPhim.ThoiLuong,
            MaPhongChieu: selectedPhong.MaPhongChieu,
            TenPhongChieu: selectedPhong.TenPhongChieu,
            ThoiGianBatDau: thoiGianBatDau,
            ThoiGianKetThuc: thoiGianKetThuc,
            TrangThai: trangThai,
        };

        onSubmit(formData);
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{showtime ? "Cập nhật lịch chiếu" : "Thêm lịch chiếu mới"}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Nhập thông tin chi tiết cho lịch chiếu.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <ScrollArea className="max-h-[70vh] pr-6">
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="MaPhimDinhDang">Phim & Định dạng</Label>
                                <Select 
                                    name="MaPhimDinhDang" 
                                    value={maPhimDinhDang?.toString()} 
                                    onValueChange={(val) => setMaPhimDinhDang(Number(val))}
                                >
                                    <SelectTrigger className="w-full bg-transparent border-slate-700">
                                        <SelectValue placeholder="Chọn phim..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1C1C1C] text-slate-100 border-slate-700">
                                        {mockPhimDinhDangList.map(phim => (
                                            <SelectItem key={phim.MaPhimDinhDang} value={phim.MaPhimDinhDang.toString()} className="cursor-pointer focus:bg-slate-700">
                                                {phim.TenPhim} ({phim.TenDinhDang})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="MaPhongChieu">Phòng chiếu</Label>
                                <Select 
                                    name="MaPhongChieu" 
                                    value={maPhongChieu?.toString()} 
                                    onValueChange={(val) => setMaPhongChieu(Number(val))}
                                >
                                    <SelectTrigger className="w-full bg-transparent border-slate-700">
                                        <SelectValue placeholder="Chọn phòng chiếu..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1C1C1C] text-slate-100 border-slate-700">
                                        {mockPhongChieuList.map(phong => (
                                            <SelectItem key={phong.MaPhongChieu} value={phong.MaPhongChieu.toString()} className="cursor-pointer focus:bg-slate-700">
                                                {phong.TenPhongChieu}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="TrangThai">Trạng thái</Label>
                                    <Select name="TrangThai" value={trangThai} onValueChange={(value: TrangThaiSuatChieu) => setTrangThai(value)}>
                                        <SelectTrigger className="w-full bg-transparent border-slate-700">
                                            <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1C1C1C] text-slate-100 border-slate-700">
                                            {trangThaiOptions.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value} className="cursor-pointer focus:bg-slate-700">
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 md:col-span-1">
                                    <Label htmlFor="GioBatDau">Giờ bắt đầu</Label>
                                    <Input 
                                        id="GioBatDau" 
                                        name="GioBatDau" 
                                        type="time" 
                                        value={gioBatDau} 
                                        onChange={(e) => setGioBatDau(e.target.value)} 
                                        className="bg-transparent border-slate-700" 
                                        required 
                                    />
                                </div>
                                
                                <div className="space-y-2 md:col-span-1">
                                    <Label htmlFor="GioKetThuc">Giờ kết thúc (tự tính)</Label>
                                    <Input 
                                        id="GioKetThuc" 
                                        name="GioKetThuc" 
                                        type="time" 
                                        value={gioKetThuc} 
                                        onChange={(e) => setGioKetThuc(e.target.value)}
                                        className="bg-transparent border-slate-700" 
                                        readOnly 
                                    />
                                </div>
                            </div> 
                            
                            <div className="space-y-2 md:col-span-1">
                                    <Label>Ngày chiếu</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal bg-transparent border-slate-700 hover:bg-slate-800 hover:text-white", !ngayChieu && "text-slate-400")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {ngayChieu ? format(ngayChieu, "PPP", { locale: vi }) : <span>Chọn ngày</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-slate-700 text-white">
                                            <Calendar mode="single" selected={ngayChieu} onSelect={(d) => d && setNgayChieu(d)} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                        </div>
                    </ScrollArea>
                    <DialogFooter className="!mt-6 pt-6 border-t border-slate-700">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="bg-transparent border-slate-700 hover:bg-slate-800">Hủy</Button>
                        </DialogClose>
                        <Button type="submit">{showtime ? "Cập nhật" : "Lưu"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}