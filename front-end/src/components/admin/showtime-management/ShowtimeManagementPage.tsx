/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Edit,
  Trash2,
  CalendarIcon,
  ChevronsRight,
  ChevronsLeft,
  Loader2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays, subDays, startOfDay, endOfDay, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

import { showtimeService } from "@/services/showtime.service";
import { roomService } from "@/services/room.service";
import { movieVersionService } from "@/services/movie-version.service";

type TrangThaiSuatChieu =
  | "CHUACHIEU"
  | "SAPCHIEU"
  | "DANGCHIEU"
  | "DACHIEU"
  | "DAHUY";

interface SuatChieuView {
  MaSuatChieu: string;
  MaPhimDinhDang: string;
  TenPhim: string;
  TenDinhDang: string;
  PosterUrl: string | null;
  ThoiLuong: number;
  MaPhongChieu: string;
  TenPhongChieu: string;
  ThoiGianBatDau: Date;
  ThoiGianKetThuc: Date;
  TrangThai: TrangThaiSuatChieu;
}

interface PhimDinhDang {
  MaPhimDinhDang: string;
  TenPhim: string;
  TenDinhDang: string;
  PosterUrl: string | null;
  ThoiLuong: number;
}

interface PhongChieu {
  MaPhongChieu: string;
  TenPhongChieu: string;
}

const trangThaiOptions: { value: TrangThaiSuatChieu; label: string }[] = [
  { value: "CHUACHIEU", label: "Chưa chiếu" },
  { value: "SAPCHIEU", label: "Sắp chiếu" },
  { value: "DANGCHIEU", label: "Đang chiếu" },
  { value: "DACHIEU", label: "Đã chiếu" },
  { value: "DAHUY", label: "Đã hủy" },
];

const DAY_START_MINUTES = 0;
const DAY_TOTAL_MINUTES = 24 * 60;

function calculateTimelineStyle(showtime: SuatChieuView, selectedDate: Date) {
  // Use local start of day relative to the selected date
  const selectedStart = new Date(selectedDate);
  selectedStart.setHours(0, 0, 0, 0);
  const dayStart = selectedStart.getTime() + DAY_START_MINUTES * 60000;

  const startTime = showtime.ThoiGianBatDau.getTime();
  const endTime = showtime.ThoiGianKetThuc.getTime();

  const startMinutes = (startTime - dayStart) / 60000;
  const endMinutes = (endTime - dayStart) / 60000;

  if (endMinutes < 0 || startMinutes > DAY_TOTAL_MINUTES) {
    return null;
  }

  const left = Math.max(0, (startMinutes / DAY_TOTAL_MINUTES) * 100);
  const effectiveStartMinutes = Math.max(0, startMinutes);
  const effectiveEndMinutes = Math.min(DAY_TOTAL_MINUTES, endMinutes);
  const width = Math.max(
    0.5,
    ((effectiveEndMinutes - effectiveStartMinutes) / DAY_TOTAL_MINUTES) * 100
  );

  return {
    left: `${left}%`,
    width: `${width}%`,
  };
}

const getBadgeVariant = (trangThai: TrangThaiSuatChieu) => {
  switch (trangThai) {
    case "DANGCHIEU":
      return "bg-green-600 text-white border-transparent";
    case "CHUACHIEU":
      return "bg-blue-600 text-white border-transparent";
    case "SAPCHIEU":
      return "bg-yellow-600 text-white border-transparent";
    case "DACHIEU":
      return "bg-slate-500 text-slate-200 border-slate-400";
    case "DAHUY":
      return "bg-red-600 text-white border-transparent";
    default:
      return "outline";
  }
};
const getBadgeLabel = (trangThai: TrangThaiSuatChieu) => {
  return (
    trangThaiOptions.find((o) => o.value === trangThai)?.label || trangThai
  );
};

export default function ShowtimeManagementPage() {
  const [rawShowtimes, setRawShowtimes] = useState<any[]>([]);
  const [phimDinhDangList, setPhimDinhDangList] = useState<PhimDinhDang[]>([]);
  const [phongChieuList, setPhongChieuList] = useState<PhongChieu[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date>(
    startOfDay(new Date())
  );
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<SuatChieuView | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { hasPermission } = useAuth();

  const fetchMasterData = async () => {
    try {
      const [roomsRes, versionsRes] = await Promise.all([
        roomService.getAll(),
        movieVersionService.getAll(),
      ]);

      const unwrapData = (data: any) => {
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        return [];
      };

      const roomsArray = unwrapData(roomsRes);
      const versionsArray = unwrapData(versionsRes);

      setPhongChieuList(
        roomsArray.map((r: any) => ({
          MaPhongChieu: r.MaPhongChieu,
          TenPhongChieu: r.TenPhongChieu,
        }))
      );

      const flatList: PhimDinhDang[] = [];
      versionsArray.forEach((pv: any) => {
        if (pv.MaPhienBanPhim && !pv.DeletedAt) {
          flatList.push({
            MaPhimDinhDang: pv.MaPhienBanPhim,
            TenPhim: pv.Phim?.TenHienThi || "Unknown",
            TenDinhDang: `${pv.DinhDang?.TenDinhDang || "2D"} ${pv.NgonNgu?.TenNgonNgu || ""
              }`.trim(),
            PosterUrl: pv.Phim?.PosterUrl,
            ThoiLuong: pv.Phim?.ThoiLuong,
          });
        }
      });
      setPhimDinhDangList(flatList);
    } catch (error) {
      console.error("Lỗi master data:", error);
      toast.error("Không thể tải dữ liệu phòng/phim");
    }
  };

  const fetchShowtimes = async () => {
    setLoading(true);
    try {
      // Calculate start and end of the selected local day
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);

      // Add 24h buffer before and after to handle timezone edge cases safely.
      // Timeline logic will filter out what shouldn't be displayed.
      const bufferStart = new Date(start);
      bufferStart.setDate(bufferStart.getDate() - 1);
      
      const bufferEnd = new Date(end);
      bufferEnd.setDate(bufferEnd.getDate() + 1);

      const tuNgay = bufferStart.toISOString();
      const denNgay = bufferEnd.toISOString();
      
      console.log("Fetching showtimes range (with buffer):", { 
        selectedDate: format(selectedDate, 'yyyy-MM-dd HH:mm:ss'),
        tuNgayUTC: tuNgay, 
        denNgayUTC: denNgay 
      });

      // Increase limit to ensure we get all showtimes in the buffered range
      const res = await showtimeService.getAll({ TuNgay: tuNgay, DenNgay: denNgay, limit: 1000 });
      const dataToSet = Array.isArray(res) ? res : (res as any).data || [];
      console.log("Fetched showtimes count:", dataToSet.length);

      setRawShowtimes(dataToSet);
    } catch (error) {
      console.error("Lỗi fetch showtime:", error);
      toast.error("Lỗi tải lịch chiếu");
    } finally {
      setLoading(false);
    }
  };

  const mapShowtimes = (raw: any[], rooms: PhongChieu[], versions: PhimDinhDang[]): SuatChieuView[] => {
    if (!Array.isArray(raw)) return [];
    return raw.map((st: any) => {
      const matchedRoom = rooms.find(
        (r) => r.MaPhongChieu === st.MaPhongChieu
      );
      const tenPhong = matchedRoom
        ? matchedRoom.TenPhongChieu
        : st.PhongChieu?.TenPhongChieu || "Phòng chưa xác định";

      const matchedVersion = versions.find(v => v.MaPhimDinhDang === st.MaPhienBanPhim);
      const tenPhim = matchedVersion ? matchedVersion.TenPhim : (st.PhienBanPhim?.Phim?.TenHienThi || "Unknown");
      const tenDinhDang = matchedVersion ? matchedVersion.TenDinhDang : `${st.PhienBanPhim?.DinhDang?.TenDinhDang || ""} - ${st.PhienBanPhim?.NgonNgu?.TenNgonNgu || ""}`;
      const posterUrl = matchedVersion ? matchedVersion.PosterUrl : (st.PhienBanPhim?.Phim?.PosterUrl || null);
      const thoiLuong = matchedVersion ? matchedVersion.ThoiLuong : (st.PhienBanPhim?.Phim?.ThoiLuong || 0);

      return {
        MaSuatChieu: st.MaSuatChieu,
        MaPhimDinhDang: st.MaPhienBanPhim,
        TenPhim: tenPhim,
        TenDinhDang: tenDinhDang,
        PosterUrl: posterUrl,
        ThoiLuong: thoiLuong,
        MaPhongChieu: st.MaPhongChieu,
        TenPhongChieu: tenPhong,
        ThoiGianBatDau: parseISO(st.ThoiGianBatDau),
        ThoiGianKetThuc: parseISO(st.ThoiGianKetThuc),
        TrangThai: st.TrangThai as TrangThaiSuatChieu,
      };
    });
  };

  const allShowtimes = useMemo(() => {
    return mapShowtimes(rawShowtimes, phongChieuList, phimDinhDangList);
  }, [rawShowtimes, phongChieuList, phimDinhDangList]);

  const selectedShowtime = useMemo(
    () =>
      allShowtimes.find((s) => s.MaSuatChieu === selectedShowtimeId) || null,
    [allShowtimes, selectedShowtimeId]
  );

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    fetchShowtimes();
    setSelectedShowtimeId(null);
  }, [selectedDate]);

  const handleAddNew = () => {
    setEditingShowtime(null);
    setIsModalOpen(true);
  };

  const handleEdit = (showtime: SuatChieuView) => {
    setEditingShowtime(showtime);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData: SuatChieuView) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const newStart = formData.ThoiGianBatDau.getTime();
      const newEnd = formData.ThoiGianKetThuc.getTime();
      // Removed "past time check" if necessary, or keep valid check
      // if (newStart < now) { ... }

      let showtimesToCheck = allShowtimes;
      // Ensure specific target date coverage
      const targetDate = new Date(formData.ThoiGianBatDau);
      const currentDate = new Date(selectedDate);
      
      const isDifferentDay = 
        targetDate.getDate() !== currentDate.getDate() ||
        targetDate.getMonth() !== currentDate.getMonth() ||
        targetDate.getFullYear() !== currentDate.getFullYear();

      if (isDifferentDay) {
        const tStart = new Date(targetDate);
        tStart.setHours(0, 0, 0, 0);
        const tEnd = new Date(targetDate);
        tEnd.setHours(23, 59, 59, 999);

        const res = await showtimeService.getAll({ 
          TuNgay: tStart.toISOString(), 
          DenNgay: tEnd.toISOString() 
        });
        const data = Array.isArray(res) ? res : (res as any).data || [];
        showtimesToCheck = mapShowtimes(data, phongChieuList, phimDinhDangList);
      }

      const hasConflict = showtimesToCheck.some((existing) => {
        if (existing.MaPhongChieu !== formData.MaPhongChieu) return false;

        // Bỏ qua các suất chiếu đã bị hủy
        if (existing.TrangThai === "DAHUY") return false;

        if (
          editingShowtime &&
          existing.MaSuatChieu === editingShowtime.MaSuatChieu
        )
          return false;

        const existStart = existing.ThoiGianBatDau.getTime();
        const existEnd = existing.ThoiGianKetThuc.getTime();

        return newStart < existEnd && newEnd > existStart;
      });

      if (hasConflict) {
        toast.error(
          "Xung đột lịch chiếu! Phòng này đã có suất chiếu trong khung giờ này."
        );
        return;
      }

      const payload = {
        MaPhienBanPhim: formData.MaPhimDinhDang,
        MaPhongChieu: formData.MaPhongChieu,
        ThoiGianBatDau: formData.ThoiGianBatDau.toISOString(),
        ThoiGianKetThuc: formData.ThoiGianKetThuc.toISOString(),
        TrangThai: formData.TrangThai,
      };

      if (editingShowtime) {
        await showtimeService.update(editingShowtime.MaSuatChieu, payload);
        toast.success("Cập nhật suất chiếu thành công");
      } else {
        await showtimeService.create(payload);
        toast.success("Tạo suất chiếu thành công");
      }

      setIsModalOpen(false);
      if (isDifferentDay) {
        setSelectedDate(startOfDay(formData.ThoiGianBatDau));
      } else {
        fetchShowtimes();
      }
    } catch (error: any) {
      console.error(error);
      const msg =
        error.response?.data?.message ||
        "Lỗi khi lưu (Kiểm tra trùng lịch/kết nối)";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelShowtime = async (maSuatChieu: string, reason: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await showtimeService.cancel(maSuatChieu, reason);
      toast.success("Hủy suất chiếu thành công. Hệ thống đã tạo yêu cầu hoàn vé cho khách hàng.");
      fetchShowtimes();
    } catch (error) {
      console.error("Lỗi hủy suất chiếu:", error);
      toast.error("Hủy suất chiếu thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showtimesForSelectedDate = useMemo(() => {
    return allShowtimes;
  }, [allShowtimes]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-white h-[calc(100vh-120px)]">
      <div className="lg:col-span-2 space-y-4 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 flex-wrap">
          <h1 className="text-2xl font-bold">Quản lý Lịch chiếu</h1>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate((prev) => subDays(prev, 1))}
              className="bg-transparent border-slate-700 hover:bg-slate-800"
            >
              <ChevronsLeft className="size-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "min-w-[240px] justify-start text-left font-normal bg-transparent border-slate-700 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP", { locale: vi })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-slate-700 text-white">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(startOfDay(date))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate((prev) => addDays(prev, 1))}
              className="bg-transparent border-slate-700 hover:bg-slate-800"
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>

          {hasPermission("QLLICHCHIEU") && (
            <Button
              onClick={handleAddNew}
              className="bg-primary hover:bg-primary/90 "
            >
              <Plus className="size-4 mr-2" />
              Thêm lịch chiếu
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1 pr-4 pt-5">
          <div className="space-y-4">
            <TimelineGrid />

            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : (
              phongChieuList.map((room) => {
                const showtimesForRoom = showtimesForSelectedDate.filter(
                  (sc) => sc.MaPhongChieu === room.MaPhongChieu
                );
                return (
                  <RoomTimeline
                    key={room.MaPhongChieu}
                    room={room}
                    showtimes={showtimesForRoom}
                    selectedDate={selectedDate}
                    onSelectShowtime={(st) =>
                      setSelectedShowtimeId(st.MaSuatChieu)
                    }
                    onEditShowtime={handleEdit}
                    selectedShowtimeId={selectedShowtimeId}
                  />
                );
              })
            )}
            {phongChieuList.length === 0 && !loading && (
              <div className="text-center text-slate-500 py-10">
                Chưa có dữ liệu phòng chiếu
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="lg:col-span-1">
        {selectedShowtime ? (
          <ShowtimeDetailPanel
            showtime={selectedShowtime}
            onClose={() => setSelectedShowtimeId(null)}
            onEdit={() => handleEdit(selectedShowtime)}
            onCancel={handleCancelShowtime}
            isSubmitting={isSubmitting}
          />
        ) : (
          <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg sticky top-4 flex items-center justify-center h-96">
            <p className="text-slate-500">
              Chọn một suất chiếu để xem thông tin
            </p>
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
          phimList={phimDinhDangList}
          phongList={phongChieuList}
          isSubmitting={isSubmitting}
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
  selectedShowtimeId?: string | null;
}

function RoomTimeline({
  room,
  showtimes,
  selectedDate,
  onSelectShowtime,
  selectedShowtimeId,
}: RoomTimelineProps) {
  return (
    <Card className="bg-[#1C1C1C] border-slate-800">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base font-medium">
          {room.TenPhongChieu}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="relative h-20 bg-slate-800/50 rounded-md overflow-hidden">
          <TimelineGrid isBackground />

          {showtimes.map((sc) => {
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
                  isSelected ? "border-white z-10" : "border-transparent"
                )}
                style={style}
                onClick={() => onSelectShowtime(sc)}
              >
                <span className="text-xs font-semibold line-clamp-2 block w-full leading-tight">
                  {sc.TenPhim}
                </span>
                <span className="text-[10px] opacity-90 mt-0.5">
                  {format(sc.ThoiGianBatDau, "HH:mm")} -{" "}
                  {format(sc.ThoiGianKetThuc, "HH:mm")}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineGrid({ isBackground = false }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div
      className={cn(
        "relative w-full flex",
        isBackground ? "absolute inset-0" : "h-6"
      )}
    >
      {hours.map((hour) => (
        <div
          key={hour}
          className={cn(
            "h-full",
            isBackground
              ? "border-r border-slate-700/50"
              : "border-r border-slate-600"
          )}
          style={{ width: `${(1 / 24) * 100}%` }}
        >
          {!isBackground && (
            <span className="text-xs text-slate-200 relative left-1 top-1.5">
              {hour}h
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
  onCancel: (maSuatChieu: string, reason: string) => void;
  isSubmitting: boolean;
}

function ShowtimeDetailPanel({
  showtime,
  onEdit,
  onCancel,
  isSubmitting,
}: DetailPanelProps) {
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const { hasPermission } = useAuth();

  return (
    <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg sticky top-4">
      <CardHeader className="relative">
        <CardTitle className="text-xl font-semibold text-slate-100 pr-10">
          {showtime.TenPhim}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[65vh]">
          <div className="space-y-4 pr-6">
            {showtime.PosterUrl && (
              <div className="relative aspect-[1.25] w-full rounded-lg overflow-hidden">
                <Image
                  src={showtime.PosterUrl}
                  alt={showtime.TenPhim}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="flex justify-between items-center">
              <Badge
                variant="outline"
                className={cn("text-xs", getBadgeVariant(showtime.TrangThai))}
              >
                {getBadgeLabel(showtime.TrangThai)}
              </Badge>
              {showtime.TrangThai !== "DAHUY" && showtime.TrangThai !== "DACHIEU" && hasPermission("QLLICHCHIEU") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="bg-transparent border-slate-700 hover:bg-slate-800"
                >
                  <Edit className="size-3 mr-1.5" />
                  Chỉnh sửa
                </Button>
              )}
            </div>

            <InfoRow label="Phòng chiếu" value={showtime.TenPhongChieu} />
            <InfoRow label="Định dạng" value={showtime.TenDinhDang} />
            <InfoRow
              label="Thời gian bắt đầu"
              value={format(
                showtime.ThoiGianBatDau,
                "HH:mm 'ngày' dd/MM/yyyy",
                { locale: vi }
              )}
            />
            <InfoRow
              label="Thời gian kết thúc"
              value={format(
                showtime.ThoiGianKetThuc,
                "HH:mm 'ngày' dd/MM/yyyy",
                { locale: vi }
              )}
            />
            <InfoRow label="Thời lượng" value={`${showtime.ThoiLuong} phút`} />

            {showtime.TrangThai !== "DAHUY" && showtime.TrangThai !== "DACHIEU" && hasPermission("QLLICHCHIEU") && (
              <div className="space-y-2 mt-4">
                <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full bg-orange-600 hover:bg-orange-700">
                      <XCircle className="size-4 mr-2" />
                      Hủy suất chiếu (Hoàn vé)
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#1C1C1C] border-slate-800 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Xác nhận hủy suất chiếu?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-400">
                        Hành động này sẽ hủy suất chiếu và <strong>tự động tạo yêu cầu hoàn vé</strong> cho tất cả khách hàng đã đặt vé.
                        <br /><br />
                        Vui lòng nhập lý do hủy:
                      </AlertDialogDescription>
                      <Input
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Ví dụ: Phòng chiếu bảo trì, Lỗi kỹ thuật..."
                        className="mt-2 bg-[#252525] border-slate-700"
                      />
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-transparent border-slate-700 hover:bg-slate-800">
                        Đóng
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-orange-600 hover:bg-orange-700"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!cancelReason.trim()) {
                            toast.warning("Vui lòng nhập lý do hủy");
                            return;
                          }
                          onCancel(showtime.MaSuatChieu, cancelReason);
                          setIsCancelDialogOpen(false);
                        }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          "Xác nhận Hủy"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
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
  phimList: PhimDinhDang[];
  phongList: PhongChieu[];
  isSubmitting: boolean;
}

const splitDateTime = (date: Date) => {
  return {
    dateObj: startOfDay(date),
    timeStr: format(date, "HH:mm"),
  };
};

const combineDateTime = (date: Date, timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};

function ShowtimeFormDialog({
  isOpen,
  onClose,
  onSubmit,
  showtime,
  selectedDate,
  phimList,
  phongList,
  isSubmitting,
}: ShowtimeFormDialogProps) {
  const [maPhimDinhDang, setMaPhimDinhDang] = useState<string | undefined>(
    showtime?.MaPhimDinhDang
  );
  const [maPhongChieu, setMaPhongChieu] = useState<string | undefined>(
    showtime?.MaPhongChieu
  );
  const [ngayChieu, setNgayChieu] = useState<Date | undefined>(
    showtime ? splitDateTime(showtime.ThoiGianBatDau).dateObj : selectedDate
  );
  const [gioBatDau, setGioBatDau] = useState<string>(
    showtime ? splitDateTime(showtime.ThoiGianBatDau).timeStr : "12:00"
  );

  const [trangThai, setTrangThai] = useState<TrangThaiSuatChieu>(
    showtime?.TrangThai || "CHUACHIEU"
  );

  const [gioKetThuc, setGioKetThuc] = useState<string>(
    showtime ? splitDateTime(showtime.ThoiGianKetThuc).timeStr : "14:00"
  );

  useEffect(() => {
    if (!maPhimDinhDang || !ngayChieu || !gioBatDau) return;

    const selectedPhim = phimList.find(
      (p) => p.MaPhimDinhDang === maPhimDinhDang
    );
    if (selectedPhim) {
      try {
        const batDau = combineDateTime(ngayChieu, gioBatDau);
        const ketThuc = new Date(
          batDau.getTime() + selectedPhim.ThoiLuong * 60000
        );
        setGioKetThuc(format(ketThuc, "HH:mm"));
      } catch (e) {
        console.error("Lỗi tính giờ kết thúc:", e);
      }
    }
  }, [maPhimDinhDang, ngayChieu, gioBatDau, phimList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !maPhimDinhDang ||
      !maPhongChieu ||
      !ngayChieu ||
      !gioBatDau ||
      !gioKetThuc
    ) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    const selectedPhim = phimList.find(
      (p) => p.MaPhimDinhDang === maPhimDinhDang
    );
    const selectedPhong = phongList.find(
      (p) => p.MaPhongChieu === maPhongChieu
    );

    if (!selectedPhim || !selectedPhong) {
      alert("Thông tin Phim hoặc Phòng chiếu không hợp lệ.");
      return;
    }

    const thoiGianBatDau = combineDateTime(ngayChieu, gioBatDau);
    const thoiGianKetThuc = combineDateTime(ngayChieu, gioKetThuc);

    const formData: SuatChieuView = {
      MaSuatChieu: showtime?.MaSuatChieu || "",
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
          <DialogTitle>
            {showtime ? "Cập nhật lịch chiếu" : "Thêm lịch chiếu mới"}
          </DialogTitle>
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
                  value={maPhimDinhDang}
                  onValueChange={(val) => setMaPhimDinhDang(val)}
                >
                  <SelectTrigger className="w-full bg-transparent border-slate-700">
                    <SelectValue placeholder="Chọn phim..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] text-slate-100 border-slate-700">
                    {phimList.map((phim) => (
                      <SelectItem
                        key={phim.MaPhimDinhDang}
                        value={phim.MaPhimDinhDang}
                        className="cursor-pointer focus:bg-slate-700"
                      >
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
                  value={maPhongChieu}
                  onValueChange={(val) => setMaPhongChieu(val)}
                >
                  <SelectTrigger className="w-full bg-transparent border-slate-700">
                    <SelectValue placeholder="Chọn phòng chiếu..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] text-slate-100 border-slate-700">
                    {phongList.map((phong) => (
                      <SelectItem
                        key={phong.MaPhongChieu}
                        value={phong.MaPhongChieu}
                        className="cursor-pointer focus:bg-slate-700"
                      >
                        {phong.TenPhongChieu}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="TrangThai">Trạng thái (Tự động)</Label>
                  <Select
                    disabled
                    name="TrangThai"
                    value={trangThai}
                    onValueChange={(value: TrangThaiSuatChieu) =>
                      setTrangThai(value)
                    }
                  >
                    <SelectTrigger className="w-full bg-transparent border-slate-700">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] text-slate-100 border-slate-700">
                      {trangThaiOptions.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="cursor-pointer focus:bg-slate-700"
                        >
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
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-transparent border-slate-700 hover:bg-slate-800 hover:text-white",
                        !ngayChieu && "text-slate-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {ngayChieu ? (
                        format(ngayChieu, "PPP", { locale: vi })
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-slate-700 text-white">
                    <Calendar
                      mode="single"
                      selected={ngayChieu}
                      onSelect={(d) => d && setNgayChieu(d)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="!mt-6 pt-6 border-t border-slate-700">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="bg-transparent border-slate-700 hover:bg-slate-800"
                disabled={isSubmitting}
              >
                Hủy
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {showtime ? "Cập nhật" : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
