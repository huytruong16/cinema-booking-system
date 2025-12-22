/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Armchair,
  Map as MapIcon,
  Settings,
  X,
  Save,
  Loader2,
  Ticket,
  Palette,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";
import { roomService } from "@/services/room.service";
import { seatTypeService } from "@/services/seat-type.service";
import { SeatType } from "@/types/seat-management";

type TrangThaiPhongChieu = "TRONG" | "SAPCHIEU" | "DANGCHIEU";

interface PhongChieu {
  MaPhongChieu: string;
  TenPhongChieu: string;
  TrangThai: TrangThaiPhongChieu;
  SoLuongGhe: number;
  SoDoGhe: any; 
  GhePhongChieus?: any[]; 
}

interface SeatMapData {
  rows: string[];
  cols: number;
  seats: Record<string, string>; 
}

const TRANG_THAI_CONFIG: Record<
  TrangThaiPhongChieu,
  { label: string; color: string }
> = {
  TRONG: {
    label: "Trống",
    color: "bg-slate-500/10 text-slate-400 border-slate-500/50",
  },
  SAPCHIEU: {
    label: "Sắp chiếu",
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/50",
  },
  DANGCHIEU: {
    label: "Đang chiếu",
    color: "bg-green-500/10 text-green-500 border-green-500/50",
  },
};

const getSeatColorClass = (typeName: string = ""): string => {
  const lower = typeName.toLowerCase();
  if (lower === "disabled")
    return "bg-slate-800 border-slate-700 text-slate-600";
  if (lower.includes("vip"))
    return "bg-yellow-500/20 border-yellow-500 text-yellow-500 hover:bg-yellow-500/30";
  if (lower.includes("đôi") || lower.includes("doi"))
    return "bg-pink-500/20 border-pink-500 text-pink-500 hover:bg-pink-500/30";
  return "bg-slate-700 border-slate-500 text-slate-300 hover:bg-slate-600";
};


const parseBackendToMap = (room: PhongChieu): SeatMapData => {
  const defaultMap = { rows: ["A", "B", "C", "D", "E"], cols: 10, seats: {} };

  let layout: any = room.SoDoGhe;
  if (typeof layout === "string") {
    try {
      layout = JSON.parse(layout);
    } catch {
      layout = {};
    }
  }

  if (!layout || Object.keys(layout).length === 0) return defaultMap;

  const rows = Object.keys(layout).sort();
  const cols = layout[rows[0]]?.length || 10;
  const seats: Record<string, string> = {};

  const seatLookup = new Map<string, string>();
  if (Array.isArray(room.GhePhongChieus)) {
    room.GhePhongChieus.forEach((gp: any) => {
      const ghe = gp.GheLoaiGhe?.Ghe;
      const loai = gp.GheLoaiGhe?.LoaiGhe;
      if (ghe && loai) {
        seatLookup.set(`${ghe.Hang}-${ghe.Cot}`, loai.MaLoaiGhe);
      }
    });
  }

  rows.forEach((rowKey) => {
    const colCells = layout[rowKey];
    if (Array.isArray(colCells)) {
      colCells.forEach((cellValue, colIndex) => {
        const gridKey = `${rowKey}-${colIndex + 1}`;

        if (cellValue && cellValue !== "") {
          const typeId = seatLookup.get(`${rowKey}-${cellValue}`);
          if (typeId) {
            seats[gridKey] = typeId;
          }
        }
      });
    }
  });

  return { rows, cols, seats };
};

export default function RoomManagementPage() {
  const [rooms, setRooms] = useState<PhongChieu[]>([]);
  const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isSeatTypeManagerOpen, setIsSeatTypeManagerOpen] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<PhongChieu | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsData, typesData] = await Promise.all([
        roomService.getAll(),
        seatTypeService.getAll(),
      ]);
      setRooms(roomsData as any|| []);
      setSeatTypes(typesData || []);
    } catch (error) {
      toast.error("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) =>
      r.TenPhongChieu.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rooms, searchTerm]);

  const handleAddNew = () => {
    setSelectedRoom(null);
    setIsInfoModalOpen(true);
  };
  const handleEditInfo = (room: PhongChieu) => {
    setSelectedRoom(room);
    setIsInfoModalOpen(true);
  };
  const handleEditMap = (room: PhongChieu) => {
    setSelectedRoom(room);
    setIsMapModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await roomService.delete(deleteId);
      toast.success("Đã xóa phòng chiếu.");
      fetchData();
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "Xóa thất bại. Có thể phòng đang có dữ liệu liên quan.";
      toast.error(msg);
    } finally {
      setDeleteId(null);
    }
  };

  const handleFormSubmit = async (formData: Partial<PhongChieu>) => {
    try {
      if (selectedRoom) {
        await roomService.update(selectedRoom.MaPhongChieu, {
          TenPhongChieu: formData.TenPhongChieu,
        });
        toast.success("Cập nhật tên phòng thành công!");
      } else {
        const payload = {
          TenPhongChieu: formData.TenPhongChieu,
          SoDoPhongChieu: {},
          DanhSachGhe: [],
        };
        await roomService.create(payload as any);
        toast.success("Tạo phòng mới thành công! Hãy thiết lập sơ đồ ghế.");
      }
      setIsInfoModalOpen(false);
      fetchData();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Lỗi khi lưu thông tin.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const handleSeatMapSave = async (
    room: PhongChieu,
    soDoPhongChieu: any,
    danhSachGhe: any[]
  ) => {
    try {
      const payload = {
        TenPhongChieu: room.TenPhongChieu, 
        SoDoPhongChieu: soDoPhongChieu,
        DanhSachGhe: danhSachGhe,
      };
      await roomService.update(room.MaPhongChieu, payload);
      toast.success("Cập nhật sơ đồ ghế thành công!");
      setIsMapModalOpen(false);
      fetchData();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Lỗi khi lưu sơ đồ.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  return (
    <div className="space-y-6 text-white h-full p-2">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapIcon className="size-6 text-primary" /> Quản lý Phòng & Ghế
          </h1>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Input
              placeholder="Tìm phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-[#1C1C1C] border-slate-700"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsSeatTypeManagerOpen(true)}
            className="border-slate-700 bg-[#1C1C1C] hover:bg-slate-800"
          >
            <Ticket className="size-4 mr-2" /> Loại Ghế
          </Button>
          <Button
            onClick={handleAddNew}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="size-4 mr-2" /> Thêm Phòng
          </Button>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary size-8" />
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.MaPhongChieu}
                room={room}
                onEditInfo={() => handleEditInfo(room)}
                onEditMap={() => handleEditMap(room)}
                onDelete={() => setDeleteId(room.MaPhongChieu)}
              />
            ))}
            {filteredRooms.length === 0 && (
              <div className="col-span-full text-center text-slate-500 pt-10">
                Chưa có phòng chiếu nào.
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      {/* MODALS */}
      <RoomFormDialog
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        onSubmit={handleFormSubmit}
        room={selectedRoom}
      />

      {selectedRoom && (
        <SeatMapEditorDialog
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          room={selectedRoom}
          seatTypes={seatTypes}
          onSave={handleSeatMapSave}
        />
      )}

      <SeatTypeManagerDialog
        isOpen={isSeatTypeManagerOpen}
        onClose={() => setIsSeatTypeManagerOpen(false)}
        seatTypes={seatTypes}
        refreshData={fetchData}
      />

      {/* DELETE CONFIRM */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="bg-[#1C1C1C] border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Hành động này sẽ xóa phòng và toàn bộ sơ đồ ghế. <br />
              <span className="text-yellow-500 font-medium">
                Lưu ý: Không thể xóa nếu phòng đang có suất chiếu.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-slate-700 text-white hover:bg-slate-800">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Xóa ngay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RoomCard({ room, onEditInfo, onEditMap, onDelete }: any) {
  const totalSeats = useMemo(() => {
    let count = 0;
    try {
      const soDo =
        typeof room.SoDoGhe === "string"
          ? JSON.parse(room.SoDoGhe)
          : room.SoDoGhe;
      if (soDo && typeof soDo === "object") {
        Object.values(soDo).forEach((cols: any) => {
          if (Array.isArray(cols)) {
            count += cols.filter((c) => c !== "").length;
          }
        });
      }
    } catch {
      count = 0;
    }
    return count;
  }, [room.SoDoGhe]);

  const statusInfo =
    TRANG_THAI_CONFIG[room.TrangThai as TrangThaiPhongChieu] ||
    TRANG_THAI_CONFIG["TRONG"];

  return (
    <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg flex flex-col hover:border-slate-600 transition group">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between items-center w-full">
            <CardTitle
              className="text-lg font-semibold text-slate-100 truncate flex-1"
              title={room.TenPhongChieu}
            >
              {room.TenPhongChieu}
            </CardTitle>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] whitespace-nowrap ml-2 h-5 font-normal",
                statusInfo.color
              )}
            >
              {statusInfo.label}
            </Badge>
          </div>
          <Badge
            variant="secondary"
            className="bg-slate-800 text-slate-400 w-fit text-[10px]"
          >
            {totalSeats} ghế
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center text-center py-6">
        <div className="relative flex items-center justify-center p-4 bg-slate-900/50 rounded-full mb-2 group-hover:bg-slate-900 transition-colors">
          <Armchair className="size-16 text-slate-600 group-hover:text-primary transition-colors" />
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 !pt-4 border-t border-slate-800">
        <Button
          variant="outline"
          className="w-full bg-transparent border-slate-700 hover:bg-slate-800 text-slate-300"
          onClick={onEditMap}
        >
          <MapIcon className="size-4 mr-2" /> Sơ đồ
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="flex-1 bg-transparent border-slate-700 hover:bg-slate-800 text-blue-400"
            onClick={onEditInfo}
          >
            <Edit className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="flex-1 bg-transparent border-slate-700 hover:bg-red-900/20 text-red-400"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function RoomFormDialog({ isOpen, onClose, onSubmit, room }: any) {
  const [name, setName] = useState("");
  useEffect(() => {
    setName(room?.TenPhongChieu || "");
  }, [room, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {room ? "Cập nhật phòng" : "Thêm phòng mới"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tên phòng chiếu</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-900 border-slate-700"
              placeholder="VD: Phòng 01"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={() => onSubmit({ TenPhongChieu: name })}
            className="bg-primary"
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SeatMapEditorDialog({
  isOpen,
  onClose,
  room,
  seatTypes,
  onSave,
}: any) {
  const initialMapData = useMemo(() => parseBackendToMap(room), [room]);
  const [seatMapData, setSeatMapData] = useState<SeatMapData>(initialMapData);
  const [selectedTool, setSelectedTool] = useState<string>("disabled");

  const [rowInput, setRowInput] = useState(() => {
    if (initialMapData.rows.length > 0)
      return `${initialMapData.rows[0]}-${
        initialMapData.rows[initialMapData.rows.length - 1]
      }`;
    return "A-E";
  });
  const [colInput, setColInput] = useState(() =>
    initialMapData.cols > 0 ? initialMapData.cols.toString() : "10"
  );

  useEffect(() => {
    if (seatTypes.length > 0 && selectedTool === "disabled")
      setSelectedTool(seatTypes[0].MaLoaiGhe);
  }, [seatTypes]);

  const parseRowRange = (range: string): string[] => {
    const [start, end] = range.split("-").map((s) => s.trim().toUpperCase());
    if (!start) return [];
    const startCode = start.charCodeAt(0);
    const endCode = end ? end.charCodeAt(0) : startCode;
    if (endCode < startCode) return [start];
    const result = [];
    for (let i = startCode; i <= endCode; i++)
      result.push(String.fromCharCode(i));
    return result;
  };

  const handleResizeGrid = () => {
    const newRows = parseRowRange(rowInput);
    const newCols = parseInt(colInput, 10) || 10;
    const newSeats = { ...seatMapData.seats };
    setSeatMapData({ rows: newRows, cols: newCols, seats: newSeats });
  };

  const handleSeatClick = (row: string, col: number) => {
    const seatId = `${row}-${col}`;
    setSeatMapData((prev) => {
      const newSeats = { ...prev.seats };
      if (newSeats[seatId] === selectedTool) {
        delete newSeats[seatId];
      } else {
        newSeats[seatId] = selectedTool;
      }
      return { ...prev, seats: newSeats };
    });
  };

  const handleApplySave = () => {
    const soDoObj: Record<string, string[]> = {};
    const danhSachGheArr: any[] = [];

    seatMapData.rows.forEach((r) => {
      const colArr: string[] = [];
      let seatLabelCounter = 1;

      for (let i = 1; i <= seatMapData.cols; i++) {
        const key = `${r}-${i}`;
        const typeId = seatMapData.seats[key];

        if (typeId) {
          const label = seatLabelCounter.toString().padStart(2, "0");
          colArr.push(label);
          danhSachGheArr.push({
            Hang: r,
            Cot: label,
            MaLoaiGhe: typeId,
          });
          seatLabelCounter++;
        } else {
          colArr.push("");
        }
      }
      soDoObj[r] = colArr;
    });

    onSave(room, soDoObj, danhSachGheArr);
  };

  const activeSeatCount = Object.keys(seatMapData.seats).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white w-[80vw] h-[95vh] max-w-none sm:max-w-[98vw] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-slate-800 shrink-0 bg-[#1C1C1C] z-10">
          <DialogTitle>Sơ đồ: {room.TenPhongChieu}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* SIDEBAR TOOLS */}
          <div className="w-72 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-6 overflow-y-auto shrink-0">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Settings size={16} /> Kích thước lưới
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-slate-400">Hàng (A-Z)</Label>
                  <Input
                    value={rowInput}
                    onChange={(e) => setRowInput(e.target.value)}
                    className="h-8 bg-black border-slate-700 mt-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Số cột</Label>
                  <Input
                    value={colInput}
                    onChange={(e) => setColInput(e.target.value)}
                    className="h-8 bg-black border-slate-700 mt-1 focus:ring-primary"
                  />
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
                onClick={handleResizeGrid}
              >
                Cập nhật lưới
              </Button>
            </div>

            <div className="space-y-3 flex-1">
              <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Palette size={16} /> Loại ghế (Chọn để vẽ)
              </h4>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                {seatTypes.map((type: any) => (
                  <button
                    key={type.MaLoaiGhe}
                    onClick={() => setSelectedTool(type.MaLoaiGhe)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2 rounded-md border transition text-sm",
                      selectedTool === type.MaLoaiGhe
                        ? "bg-slate-800 border-primary ring-1 ring-primary"
                        : "bg-slate-900 border-slate-700 hover:bg-slate-800"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded border flex items-center justify-center shadow-sm",
                        !type.MauSac && getSeatColorClass(type.LoaiGhe)
                      )}
                      style={
                        type.MauSac
                          ? {
                              backgroundColor: type.MauSac,
                              borderColor: type.MauSac,
                            }
                          : {}
                      }
                    >
                      {type.MauSac && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                      )}
                    </div>
                    <span className="truncate flex-1 text-left">
                      {type.LoaiGhe}
                    </span>
                  </button>
                ))}

                <button
                  onClick={() => setSelectedTool("disabled")}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-md border transition text-sm",
                    selectedTool === "disabled"
                      ? "bg-slate-800 border-red-500 ring-1 ring-red-500"
                      : "bg-slate-900 border-slate-700 hover:bg-slate-800"
                  )}
                >
                  <div className="w-5 h-5 rounded bg-slate-950 border border-slate-700 flex items-center justify-center text-slate-500">
                    <X size={12} />
                  </div>
                  <span className="truncate flex-1 text-left text-slate-400">
                    Xóa / Lối đi
                  </span>
                </button>
              </div>
            </div>

            <div className="bg-slate-800 p-3 rounded-lg text-center border border-slate-700 mt-auto">
              <div className="text-3xl font-bold text-primary">
                {activeSeatCount}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                Tổng số ghế
              </div>
            </div>
          </div>

          {/* MAIN CANVAS */}
          <ScrollArea className="flex-1 bg-black/80 relative">
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>

            <div className="p-16 min-w-max mx-auto flex flex-col items-center justify-start min-h-full">
              {/* Màn hình */}
              <div className="w-[600px] h-2 bg-gradient-to-r from-transparent via-slate-500 to-transparent mb-16 rounded-full opacity-60 relative shrink-0">
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-slate-500 uppercase tracking-[0.3em] font-medium">
                  Màn hình chiếu
                </span>
                <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-slate-500/10 to-transparent -z-10 blur-xl"></div>
              </div>

              {/* Grid */}
              <div className="flex flex-col gap-3">
                {seatMapData.rows.map((row) => (
                  <div
                    key={row}
                    className="flex gap-3 items-center justify-center"
                  >
                    {/* Label Trái */}
                    <div className="w-8 text-center text-sm font-bold text-slate-500 tabular-nums">
                      {row}
                    </div>

                    {/* Cột Ghế */}
                    {Array.from({ length: seatMapData.cols }, (_, i) => {
                      const col = i + 1;
                      const seatId = `${row}-${col}`;
                      const currentTypeId = seatMapData.seats[seatId];
                      const isSeat =
                        currentTypeId && currentTypeId !== "disabled";
                      const typeObj = seatTypes.find(
                        (t: any) => t.MaLoaiGhe === currentTypeId
                      );

                      return (
                        <button
                          key={seatId}
                          onClick={() => handleSeatClick(row, col)}
                          className={cn(
                            "w-9 h-9 rounded-md text-[11px] font-medium border flex items-center justify-center transition-all duration-150 hover:scale-110 hover:shadow-lg hover:z-10 relative",
                            !isSeat
                              ? "bg-[#1a1a1a] border-slate-800/50 text-transparent hover:text-slate-600 hover:border-slate-700"
                              : cn(
                                  !typeObj?.MauSac &&
                                    getSeatColorClass(typeObj?.LoaiGhe),
                                  "shadow-sm text-white"
                                )
                          )}
                          style={
                            isSeat && typeObj?.MauSac
                              ? {
                                  backgroundColor: typeObj.MauSac,
                                  borderColor: typeObj.MauSac,
                                }
                              : {}
                          }
                          title={`${row}${col} - ${
                            typeObj?.LoaiGhe || "Trống"
                          }`}
                        >
                          {isSeat ? (
                            col
                          ) : (
                            <span className="opacity-0 hover:opacity-100 text-[8px]">
                              {col}
                            </span>
                          )}
                        </button>
                      );
                    })}

                    {/* Label Phải */}
                    <div className="w-8 text-center text-sm font-bold text-slate-500 tabular-nums">
                      {row}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chú thích */}
              <div className="mt-16 flex gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#1a1a1a] border border-slate-800"></div>
                  Lối đi (Trống)
                </div>
                {seatTypes.slice(0, 5).map((t: any) => (
                  <div key={t.MaLoaiGhe} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-4 h-4 rounded border",
                        !t.MauSac && getSeatColorClass(t.LoaiGhe)
                      )}
                      style={
                        t.MauSac
                          ? { backgroundColor: t.MauSac, borderColor: t.MauSac }
                          : {}
                      }
                    ></div>
                    {t.LoaiGhe}
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="p-4 border-t border-slate-800 bg-[#1C1C1C] shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-700"
          >
            Đóng
          </Button>
          <Button
            onClick={handleApplySave}
            className="bg-primary hover:bg-primary/90 px-8"
          >
            <Save className="size-4 mr-2" /> Lưu Sơ Đồ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SeatTypeManagerDialog({
  isOpen,
  onClose,
  seatTypes,
  refreshData,
}: any) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    LoaiGhe: "",
    HeSoGiaGhe: 1.0,
    MauSac: "#3b82f6",
  });

  const resetForm = () => {
    setEditingId(null);
    setFormData({ LoaiGhe: "", HeSoGiaGhe: 1.0, MauSac: "#3b82f6" });
  };

  const handleEdit = (type: any) => {
    setEditingId(type.MaLoaiGhe);
    setFormData({
      LoaiGhe: type.LoaiGhe,
      HeSoGiaGhe: type.HeSoGiaGhe,
      MauSac: type.MauSac || "#3b82f6",
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await seatTypeService.update(editingId, formData);
        toast.success("Cập nhật thành công");
      } else {
        await seatTypeService.create(formData);
        toast.success("Thêm mới thành công");
      }
      resetForm();
      refreshData();
    } catch {
      toast.error("Lỗi khi lưu loại ghế.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa loại ghế này?")) return;
    try {
      await seatTypeService.delete(id);
      refreshData();
      toast.success("Đã xóa.");
    } catch {
      toast.error("Không thể xóa (đang được sử dụng).");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Quản lý Loại Ghế</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* List Table */}
          <div className="rounded-md border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-900">
                <TableRow className="border-slate-800 hover:bg-slate-900">
                  <TableHead className="text-slate-300">Tên Loại</TableHead>
                  <TableHead className="text-slate-300">Màu sắc</TableHead>
                  <TableHead className="text-slate-300">Hệ số</TableHead>
                  <TableHead className="text-right text-slate-300">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seatTypes.map((t: any) => (
                  <TableRow
                    key={t.MaLoaiGhe}
                    className="border-slate-800 hover:bg-slate-800/50"
                  >
                    <TableCell>{t.LoaiGhe}</TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          "w-5 h-5 rounded border shadow-sm",
                          !t.MauSac && getSeatColorClass(t.LoaiGhe)
                        )}
                        style={
                          t.MauSac
                            ? {
                                backgroundColor: t.MauSac,
                                borderColor: t.MauSac,
                              }
                            : {}
                        }
                      />
                    </TableCell>
                    <TableCell>x{t.HeSoGiaGhe}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                          onClick={() => handleEdit(t)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          onClick={() => handleDelete(t.MaLoaiGhe)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Form Create/Edit */}
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Tên loại ghế</Label>
              <Input
                placeholder="VD: VIP"
                value={formData.LoaiGhe}
                onChange={(e) =>
                  setFormData({ ...formData, LoaiGhe: e.target.value })
                }
                className="h-9 bg-black border-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Hệ số giá</Label>
              <Input
                type="number"
                placeholder="1.0"
                value={formData.HeSoGiaGhe}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    HeSoGiaGhe: parseFloat(e.target.value),
                  })
                }
                className="h-9 bg-black border-slate-700"
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Màu hiển thị</Label>
              <div className="flex items-center gap-2">
                <div
                  className="relative w-9 h-9 rounded border border-slate-700 overflow-hidden cursor-pointer shadow-sm hover:border-slate-500 transition-colors"
                  style={{ backgroundColor: formData.MauSac }}
                >
                  <input
                    type="color"
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    value={formData.MauSac}
                    onChange={(e) =>
                      setFormData({ ...formData, MauSac: e.target.value })
                    }
                  />
                </div>
                <Input
                  value={formData.MauSac}
                  onChange={(e) =>
                    setFormData({ ...formData, MauSac: e.target.value })
                  }
                  className="h-9 bg-black border-slate-700 font-mono uppercase"
                  maxLength={7}
                />
              </div>
            </div>

            <div className="flex items-end gap-2">
              {editingId && (
                <Button
                  variant="ghost"
                  onClick={resetForm}
                  className="h-9 px-3 text-slate-400"
                >
                  Hủy
                </Button>
              )}
              <Button onClick={handleSubmit} className="h-9 bg-primary flex-1">
                {editingId ? "Lưu thay đổi" : "Thêm mới"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
