"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Armchair, Map, Settings, X, Save, Eraser } from 'lucide-react';
import { cn } from '@/lib/utils';

type TrangThaiPhongChieu = "HOATDONG" | "BAOTRI" | "NGUNGHOATDONG";
type LoaiGhe = 'thuong' | 'vip' | 'doi' | 'disabled';

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


// --- DỮ LIỆU GIẢ (MOCK DATA) ---

const mockSeatMap: SeatMapData = {
  rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
  cols: 14,
  seats: {
    // Ghế disabled (lối đi)
    "A1": "disabled", "A14": "disabled",
    "B1": "disabled", "B14": "disabled",
    // Hàng VIP (ví dụ)
    "E1": "vip", "E2": "vip", "E3": "vip", "E4": "vip", "E5": "vip", "E6": "vip", "E7": "vip", "E8": "vip", "E9": "vip", "E10": "vip", "E11": "vip", "E12": "vip", "E13": "vip", "E14": "vip",
    "F1": "vip", "F2": "vip", "F3": "vip", "F4": "vip", "F5": "vip", "F6": "vip", "F7": "vip", "F8": "vip", "F9": "vip", "F10": "vip", "F11": "vip", "F12": "vip", "F13": "vip", "F14": "vip",
    // Hàng Đôi (ví dụ)
    "G1": "doi", "G2": "doi", "G3": "doi", "G4": "doi", "G5": "doi", "G6": "doi", "G7": "doi", "G8": "doi", "G9": "doi", "G10": "doi", "G11": "doi", "G12": "doi", "G13": "doi", "G14": "doi",
    "H1": "doi", "H2": "doi", "H3": "doi", "H4": "doi", "H5": "doi", "H6": "doi", "H7": "doi", "H8": "doi", "H9": "doi", "H10": "doi", "H11": "doi", "H12": "doi", "H13": "doi", "H14": "doi",
  }
};
const mockSeatMapJson = JSON.stringify(mockSeatMap);

// Đếm số ghế có thể bán từ sơ đồ
const calculateTotalSeats = (map: SeatMapData): number => {
    let count = 0;
    map.rows.forEach(row => {
        for (let i = 1; i <= map.cols; i++) {
            const seatId = `${row}${i}`;
            if (map.seats[seatId] !== 'disabled') {
                count++;
            }
        }
    });
    return count;
};
const initialSeats = calculateTotalSeats(mockSeatMap); // = 104

const mockRooms: PhongChieu[] = [
  { MaPhongChieu: 1, TenPhongChieu: "Phòng 1 (IMAX)", TrangThai: "HOATDONG", SoLuongGhe: initialSeats, SoDoGhe: mockSeatMapJson },
  { MaPhongChieu: 2, TenPhongChieu: "Phòng 2 (2D)", TrangThai: "HOATDONG", SoLuongGhe: initialSeats, SoDoGhe: mockSeatMapJson },
  { MaPhongChieu: 3, TenPhongChieu: "Phòng 3 (3D)", TrangThai: "BAOTRI", SoLuongGhe: initialSeats, SoDoGhe: mockSeatMapJson },
  { MaPhongChieu: 4, TenPhongChieu: "Phòng 4 (CINE FOREST)", TrangThai: "NGUNGHOATDONG", SoLuongGhe: initialSeats, SoDoGhe: mockSeatMapJson },
  { MaPhongChieu: 5, TenPhongChieu: "Phòng 5 (2D)", TrangThai: "HOATDONG", SoLuongGhe: initialSeats, SoDoGhe: mockSeatMapJson },
];

const trangThaiOptions: { value: TrangThaiPhongChieu; label: string }[] = [
  { value: "HOATDONG", label: "Đang hoạt động" },
  { value: "BAOTRI", label: "Đang bảo trì" },
  { value: "NGUNGHOATDONG", label: "Ngừng hoạt động" },
];
// --- HẾT DỮ LIỆU GIẢ ---

// Helper lấy màu badge
const getBadgeVariant = (trangThai: TrangThaiPhongChieu) => {
    switch (trangThai) {
        case "HOATDONG": return "bg-green-600 text-white";
        case "BAOTRI": return "bg-yellow-600 text-white";
        case "NGUNGHOATDONG": return "bg-slate-500 text-slate-200 border-slate-400";
        default: return "outline";
    }
};
const getBadgeLabel = (trangThai: TrangThaiPhongChieu) => {
  return trangThaiOptions.find(o => o.value === trangThai)?.label || trangThai;
};


// --- COMPONENT CHÍNH ---
export default function RoomManagementPage() {
  const [rooms, setRooms] = useState<PhongChieu[]>(mockRooms);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<PhongChieu | null>(null);

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesSearch = room.TenPhongChieu.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || room.TrangThai === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rooms, searchTerm, statusFilter]);

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

  // Xử lý submit form thông tin (Tên, Trạng thái)
  const handleFormSubmit = (formData: PhongChieu) => {
    if (selectedRoom) {
        setRooms(prev => prev.map(r => r.MaPhongChieu === formData.MaPhongChieu ? formData : r));
    } else {
        // Khi thêm mới, tạo 1 sơ đồ ghế rỗng
        const emptySeatMap: SeatMapData = { rows: ["A","B","C","D","E","F"], cols: 10, seats: {} };
        const newRoom = { 
            ...formData, 
            SoDoGhe: JSON.stringify(emptySeatMap),
            SoLuongGhe: calculateTotalSeats(emptySeatMap), // = 60
            MaPhongChieu: Math.max(...rooms.map(r => r.MaPhongChieu)) + 1 
        };
        setRooms(prev => [newRoom, ...prev]);
    }
    setIsInfoModalOpen(false);
  };

  const handleSeatMapSave = (room: PhongChieu, newSeatMapData: SeatMapData) => {
      const newTotalSeats = calculateTotalSeats(newSeatMapData);

      const updatedRoom: PhongChieu = {
          ...room,
          SoDoGhe: JSON.stringify(newSeatMapData),
          SoLuongGhe: newTotalSeats
      };
      
      setRooms(prev => prev.map(r => r.MaPhongChieu === updatedRoom.MaPhongChieu ? updatedRoom : r));
      setIsMapModalOpen(false);
  };

  const handleDelete = (maPhongChieu: number) => {
      setRooms(prev => prev.filter(r => r.MaPhongChieu !== maPhongChieu));
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold">Quản lý Phòng chiếu</h1>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-auto md:max-w-sm">
            <Input
              placeholder="Tìm kiếm theo tên phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-transparent border-slate-700"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-transparent border-slate-700">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent className="bg-[#1C1C1C] text-slate-100 border-slate-700">
              <SelectItem value="all" className="cursor-pointer focus:bg-slate-700">Tất cả trạng thái</SelectItem>
              {trangThaiOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="cursor-pointer focus:bg-slate-700">
                      {opt.label}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
           <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
            <Plus className="size-4 mr-2" />
            Thêm phòng mới
          </Button>
        </div>
      </div>

      {/* Grid Layout (Thay cho Table) */}
      <ScrollArea className="h-[calc(100vh-200px)] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard 
                key={room.MaPhongChieu} 
                room={room} 
                onEditInfo={() => handleEditInfo(room)}
                onEditMap={() => handleEditMap(room)}
                onDelete={() => handleDelete(room.MaPhongChieu)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Modal Form Sửa thông tin */}
      {isInfoModalOpen && (
        <RoomFormDialog
          isOpen={isInfoModalOpen}
          onClose={() => setIsInfoModalOpen(false)}
          onSubmit={handleFormSubmit}
          room={selectedRoom}
        />
      )}
      
      {/* Modal Chỉnh sửa Sơ đồ ghế */}
      {isMapModalOpen && selectedRoom && (
        <SeatMapEditorDialog
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          room={selectedRoom}
          onSave={handleSeatMapSave}
        />
      )}
    </div>
  );
}

// --- COMPONENT CON: CARD PHÒNG CHIẾU ---
interface RoomCardProps {
    room: PhongChieu;
    onEditInfo: () => void;
    onEditMap: () => void;
    onDelete: () => void;
}
function RoomCard({ room, onEditInfo, onEditMap }: RoomCardProps) {
    return (
         <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <CardTitle className="text-lg font-semibold text-slate-100">{room.TenPhongChieu}</CardTitle>
                <Badge variant="outline" className={cn("text-xs", getBadgeVariant(room.TrangThai))}>
                    {getBadgeLabel(room.TrangThai)}
                </Badge>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center text-center">
                <Armchair className="size-24 text-slate-600" />
                <p className="text-xl font-bold mt-2">{room.SoLuongGhe} ghế</p>
                <p className="text-sm text-slate-400">(Tổng số ghế có thể bán)</p>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2 !pt-4 border-t border-slate-800">
                <Button variant="outline" className="w-full bg-transparent border-slate-700 hover:bg-slate-800" onClick={onEditMap}>
                    <Map className="size-4 mr-2" />
                    Sơ đồ ghế
                </Button>
                <Button variant="outline" className="w-full bg-transparent border-slate-700 hover:bg-slate-800" onClick={onEditInfo}>
                    <Settings className="size-4 mr-2" />
                    Chi tiết
                </Button>
            </CardFooter>
        </Card>
    );
}


// --- COMPONENT CON: DIALOG FORM (Sửa thông tin) ---
interface RoomFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PhongChieu) => void;
    room: PhongChieu | null;
}
function RoomFormDialog({ isOpen, onClose, onSubmit, room }: RoomFormDialogProps) {
    const [tenPhongChieu, setTenPhongChieu] = useState(room?.TenPhongChieu || "");
    const [trangThai, setTrangThai] = useState<TrangThaiPhongChieu>(room?.TrangThai || "HOATDONG");

    useEffect(() => {
        if (room) {
            setTenPhongChieu(room.TenPhongChieu);
            setTrangThai(room.TrangThai);
        } else {
            setTenPhongChieu("");
            setTrangThai("HOATDONG");
        }
    }, [room, isOpen]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSubmit: PhongChieu = {
            MaPhongChieu: room?.MaPhongChieu || 0,
            SoLuongGhe: room?.SoLuongGhe || 0,
            SoDoGhe: room?.SoDoGhe || "{}",
            TenPhongChieu: tenPhongChieu,
            TrangThai: trangThai,
        };
        onSubmit(dataToSubmit);
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{room ? "Cập nhật phòng chiếu" : "Thêm phòng chiếu mới"}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Quản lý thông tin cơ bản của phòng. Sơ đồ ghế được quản lý riêng.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="TenPhongChieu">Tên phòng chiếu</Label>
                            <Input 
                                id="TenPhongChieu" 
                                name="TenPhongChieu" 
                                value={tenPhongChieu} 
                                onChange={(e) => setTenPhongChieu(e.target.value)} 
                                className="bg-transparent border-slate-700" 
                                required 
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="TrangThai">Trạng thái</Label>
                            <Select 
                                name="TrangThai" 
                                value={trangThai} 
                                onValueChange={(v: TrangThaiPhongChieu) => setTrangThai(v)}
                            >
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
                    </div>
                    <DialogFooter className="!mt-6 pt-6 border-t border-slate-700">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="bg-transparent border-slate-700 hover:bg-slate-800">Hủy</Button>
                        </DialogClose>
                        <Button type="submit">{room ? "Cập nhật" : "Lưu"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// --- COMPONENT CON: DIALOG CHỈNH SỬA SƠ ĐỒ GHẾ (NÂNG CAO) ---
interface SeatMapEditorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    room: PhongChieu;
    onSave: (room: PhongChieu, newMapData: SeatMapData) => void;
}

// Helper: Chuyển "A-C" thành ["A", "B", "C"]
const parseRowRange = (range: string): string[] => {
    const [start, end] = range.split('-').map(s => s.trim().toUpperCase());
    if (!end || start.charCodeAt(0) > end.charCodeAt(0)) {
        return [start];
    }
    const result: string[] = [];
    for (let i = start.charCodeAt(0); i <= end.charCodeAt(0); i++) {
        result.push(String.fromCharCode(i));
    }
    return result;
};
// Helper: Chuyển ["A", "B", "C"] thành "A-C"
const formatRowRange = (rows: string[]): string => {
    if (rows.length === 0) return "";
    return `${rows[0]}-${rows[rows.length - 1]}`;
};

function SeatMapEditorDialog({ isOpen, onClose, room, onSave }: SeatMapEditorDialogProps) {
    
    const initialMapData = useMemo(() => {
        try {
            return JSON.parse(room.SoDoGhe) as SeatMapData;
        } catch (e) {
            return { rows: ["A", "B", "C"], cols: 10, seats: {} } as SeatMapData;
        }
    }, [room.SoDoGhe]);

    const [seatMapData, setSeatMapData] = useState<SeatMapData>(initialMapData);
    const [selectedTool, setSelectedTool] = useState<LoaiGhe>('thuong');
    const [rowInput, setRowInput] = useState(formatRowRange(initialMapData.rows));
    const [colInput, setColInput] = useState(initialMapData.cols.toString());

    useEffect(() => {
        setSeatMapData(initialMapData);
        setRowInput(formatRowRange(initialMapData.rows));
        setColInput(initialMapData.cols.toString());
    }, [initialMapData, isOpen]);

    const getSeatType = (seatId: string): LoaiGhe => {
        return seatMapData.seats[seatId] || 'thuong';
    };

    // Xử lý khi click vào 1 ghế
    const handleSeatClick = (row: string, col: number) => {
        const seatId = `${row}${col}`;
        setSeatMapData(prevData => {
            const newSeats = { ...prevData.seats };
            if (selectedTool === 'thuong') {
                delete newSeats[seatId];
            } else {
                newSeats[seatId] = selectedTool;
            }
            return { ...prevData, seats: newSeats };
        });
    };

    const handleRowClick = (row: string) => {
        setSeatMapData(prevData => {
            const newSeats = { ...prevData.seats };
            for (let i = 1; i <= prevData.cols; i++) {
                const seatId = `${row}${i}`;
                if (selectedTool === 'thuong') {
                    delete newSeats[seatId];
                } else {
                    newSeats[seatId] = selectedTool;
                }
            }
            return { ...prevData, seats: newSeats };
        });
    };

    const handleResizeGrid = () => {
        const newRows = parseRowRange(rowInput);
        const newCols = parseInt(colInput, 10) || 10;
        setSeatMapData(prevData => ({
            ...prevData,
            rows: newRows,
            cols: newCols,
        }));
    };
    
    const handleSaveClick = () => {
        onSave(room, seatMapData);
    };

    return (
         <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-w-6xl">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa Sơ đồ ghế: {room.TenPhongChieu}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Thay đổi kích thước lưới hoặc chọn công cụ để &quot;vẽ&quot; loại ghế.
                    </DialogDescription>
                </DialogHeader>

                {/* Thanh công cụ (Toolbar) */}
                <div className="flex flex-col md:flex-row gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                    <div className="flex items-end gap-2">
                        <div>
                            <Label htmlFor="rows">Hàng (ví dụ: A-H)</Label>
                            <Input id="rows" value={rowInput} onChange={e => setRowInput(e.target.value)} className="bg-transparent mt-2 border-slate-700 w-28" />
                        </div>
                        <div>
                            <Label htmlFor="cols">Cột (ví dụ: 14)</Label>
                            <Input id="cols" type="number" value={colInput} onChange={e => setColInput(e.target.value)} className="bg-transparent mt-2 border-slate-700 w-20" />
                        </div>
                        <Button variant="outline" className="bg-transparent border-slate-700 hover:bg-slate-800" onClick={handleResizeGrid}>
                            Cập nhật lưới
                        </Button>
                    </div>

                    <div className="h-px md:h-auto md:w-px bg-slate-700"></div>

                    {/* Công cụ "Vẽ" */}
                    <div>
                        <Label>Công cụ (Chọn cọ vẽ)</Label>
                        <div className="flex flex-wrap gap-2">
                          <Button 
                              variant={selectedTool === 'thuong' ? 'default' : 'outline'} 
                              onClick={() => setSelectedTool('thuong')} 
                              className={cn(
                                  "mt-2",
                                  selectedTool === 'thuong' 
                                      ? "bg-slate-600 text-white hover:bg-slate-500 ring-2 ring-offset-2 ring-offset-slate-900 ring-white" 
                                      : "bg-slate-800 border-slate-700 hover:bg-slate-700" 
                              )}
                          >
                              Ghế thường
                          </Button>
                          <Button 
                              variant={selectedTool === 'vip' ? 'default' : 'outline'} 
                              onClick={() => setSelectedTool('vip')} 
                              className={cn(
                                  "mt-2",
                                  selectedTool === 'vip' 
                                      ? "bg-yellow-500 text-black hover:bg-yellow-600 ring-2 ring-offset-2 ring-offset-slate-900 ring-white"
                                      : "bg-yellow-800/20 border-yellow-700 text-yellow-500 hover:bg-yellow-800/30" 
                              )}
                          >
                              Ghế VIP
                          </Button>
                          <Button 
                              variant={selectedTool === 'doi' ? 'default' : 'outline'} 
                              onClick={() => setSelectedTool('doi')} 
                              className={cn(
                                  "mt-2",
                                  selectedTool === 'doi'
                                      ? "bg-purple-500 text-white hover:bg-purple-600 ring-2 ring-offset-2 ring-offset-slate-900 ring-white" 
                                      : "bg-purple-800/20 border-purple-700 text-purple-500 hover:bg-purple-800/30"
                              )}
                          >
                              Ghế đôi
                          </Button>
                          <Button 
                              variant={selectedTool === 'disabled' ? 'default' : 'outline'} 
                              onClick={() => setSelectedTool('disabled')} 
                              className={cn(
                                  "mt-2",
                                  selectedTool === 'disabled'
                                      ? "bg-red-600 text-white hover:bg-red-700 ring-2 ring-offset-2 ring-offset-slate-900 ring-white" 
                                      : "bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800" 
                              )}
                          >
                              Lối đi / Hỏng
                          </Button>
                      </div>
                    </div>
                </div>

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="flex flex-col items-center justify-center p-4">
                        
                        <div className="bg-slate-700 text-center py-1.5 px-12 text-sm rounded-md mb-8 w-full uppercase tracking-widest">
                            Màn hình
                        </div>

                        <div className="flex flex-col gap-2 w-full items-center py-2">
                            {seatMapData.rows.map(row => (
                                <div key={row} className="flex gap-2 items-center">
                                    {/* Nút tô cả hàng */}
                                    <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-slate-500 hover:bg-slate-800" onClick={() => handleRowClick(row)}>
                                        {row}
                                    </Button>
                                    
                                    {/* Các ghế */}
                                    {Array.from({ length: seatMapData.cols }, (_, i) => {
                                        const col = i + 1;
                                        const seatId = `${row}${col}`;
                                        const type = getSeatType(seatId);
                                        const isDisabled = type === 'disabled';

                                        return (
                                            <Button
                                                key={seatId}
                                                variant="outline"
                                                size="icon"
                                                className={cn(
                                                    "size-8 p-0 text-xs cursor-pointer", 
                                                    type === 'thuong' && "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-500",
                                                    type === 'vip' && "bg-yellow-800/20 border-yellow-700 hover:bg-yellow-700/30 text-yellow-500",
                                                    type === 'doi' && "bg-purple-800/20 border-purple-700 hover:bg-purple-700/30 text-purple-500",
                                                    isDisabled && "bg-slate-900 border-slate-800 text-slate-700 opacity-50",
                                                    "hover:ring-2 hover:ring-primary"
                                                )}
                                                onClick={() => handleSeatClick(row, col)}
                                            >
                                                {isDisabled ? <X className="size-4"/> : col}
                                            </Button>
                                        );
                                    })}
                                    
                                    <span className="text-sm font-medium w-6 text-center text-slate-500">{row}</span>
                                </div>
                            ))}
                        </div>
                        
                        {/* Chú thích */}
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 pt-8">
                            <div className="flex items-center gap-1.5"><Armchair className="size-4 text-slate-500" /> Thường</div>
                            <div className="flex items-center gap-1.5"><Armchair className="size-4 text-yellow-500" /> VIP</div>
                            <div className="flex items-center gap-1.5"><Armchair className="size-4 text-purple-500" /> Ghế đôi</div>
                            <div className="flex items-center gap-1.5"><Armchair className="size-4 text-slate-700" /> Lối đi / Hỏng</div>
                        </div>

                    </div>
                </ScrollArea>
                <DialogFooter className="!mt-6 pt-6 border-t border-slate-700">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" className="bg-transparent border-slate-700 hover:bg-slate-800">
                            Hủy
                        </Button>
                    </DialogClose>
                    <Button onClick={handleSaveClick}>
                        <Save className="size-4 mr-2" />
                        Lưu Sơ đồ
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}