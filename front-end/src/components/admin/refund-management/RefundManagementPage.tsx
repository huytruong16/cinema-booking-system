"use client";

import React, { useState, useMemo } from 'react';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea"; // [NEW] Thêm Textarea
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label"; // [NEW] Thêm Label
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Filter, RefreshCcw, CheckCircle2, XCircle, Eye, Ticket, User, Calendar as CalendarIcon, Clock, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from 'sonner';

// --- TYPES & INTERFACES ---

type TrangThaiYeuCau = "DANGCHO" | "DAHOAN" | "TUCHOI";
type TrangThaiVe = "CHUAHOANTIEN" | "CHOHOANTIEN" | "DAHOAN";

interface VeView {
  MaVe: string;
  MaGhe: string;
  GiaVe: number;
  TenPhim: string;
  TenPhong: string;
  SuatChieu: Date;
}

interface KhachHangView {
  HoTen: string;
  Email: string;
  SoDienThoai: string;
}

interface YeuCauHoanVe {
  MaYeuCau: string;
  MaVe: string;
  NgayYeuCau: Date;
  TrangThai: TrangThaiYeuCau;
  LyDo?: string;
  // Quan hệ
  Ve: VeView;
  KhachHang: KhachHangView;
  // Thông tin xử lý (Sau khi admin duyệt)
  MaGiaoDichHoan?: string;
  GhiChuAdmin?: string; 
  NgayXuLy?: Date;
}

// --- MOCK DATA ---

const mockRefundRequests: YeuCauHoanVe[] = [
  {
    MaYeuCau: "req-001",
    MaVe: "ve-abc-1",
    NgayYeuCau: new Date("2024-11-15T08:30:00"),
    TrangThai: "DANGCHO",
    LyDo: "Đặt nhầm suất chiếu, muốn đổi sang suất tối.",
    Ve: {
      MaVe: "ve-abc-1",
      MaGhe: "E5",
      GiaVe: 95000,
      TenPhim: "Inside Out 2",
      TenPhong: "Phòng 01",
      SuatChieu: new Date("2024-11-16T19:00:00")
    },
    KhachHang: {
      HoTen: "Nguyễn Văn An",
      Email: "an.nguyen@gmail.com",
      SoDienThoai: "0909123456"
    }
  },
  {
    MaYeuCau: "req-002",
    MaVe: "ve-abc-2",
    NgayYeuCau: new Date("2024-11-14T14:15:00"),
    TrangThai: "DAHOAN",
    MaGiaoDichHoan: "TXN_REFUND_999",
    GhiChuAdmin: "Đã hoàn qua VNPAY",
    NgayXuLy: new Date("2024-11-14T15:00:00"),
    Ve: {
      MaVe: "ve-abc-2",
      MaGhe: "F10",
      GiaVe: 120000,
      TenPhim: "Deadpool & Wolverine",
      TenPhong: "Phòng IMAX",
      SuatChieu: new Date("2024-11-15T20:00:00")
    },
    KhachHang: {
      HoTen: "Trần Thị Bích",
      Email: "bich.tran@outlook.com",
      SoDienThoai: "0912345678"
    }
  },
];

const getStatusColor = (status: TrangThaiYeuCau) => {
  switch (status) {
    case "DAHOAN": return "bg-green-500/20 text-green-400 border-green-500/50";
    case "DANGCHO": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
    case "TUCHOI": return "bg-red-500/20 text-red-400 border-red-500/50";
    default: return "bg-slate-500/20 text-slate-400";
  }
};

const getStatusLabel = (status: TrangThaiYeuCau) => {
  switch (status) {
    case "DAHOAN": return "Đã hoàn tiền";
    case "DANGCHO": return "Chờ xử lý";
    case "TUCHOI": return "Đã từ chối";
    default: return status;
  }
};

// --- MAIN PAGE ---

export default function RefundManagementPage() {
  const [requests, setRequests] = useState<YeuCauHoanVe[]>(mockRefundRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [selectedRequest, setSelectedRequest] = useState<YeuCauHoanVe | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchSearch = 
        req.Ve.TenPhim.toLowerCase().includes(searchTerm.toLowerCase()) || 
        req.KhachHang.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.MaYeuCau.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === "all" || req.TrangThai === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const handleViewDetail = (req: YeuCauHoanVe) => {
    setSelectedRequest(req);
    setIsDetailOpen(true);
  };

  // [UPDATED] Hàm duyệt nhận thêm thông tin
  const handleApproveRefund = (req: YeuCauHoanVe, data: { transactionCode: string, note: string }) => {
      // Gọi API cập nhật DB...
      
      // Update Local State
      setRequests(prev => prev.map(r => r.MaYeuCau === req.MaYeuCau ? { 
          ...r, 
          TrangThai: "DAHOAN",
          MaGiaoDichHoan: data.transactionCode,
          GhiChuAdmin: data.note,
          NgayXuLy: new Date()
      } : r));
      
      if (selectedRequest?.MaYeuCau === req.MaYeuCau) {
          setSelectedRequest({ ...selectedRequest, TrangThai: "DAHOAN" });
      }
      
      toast.success(`Đã hoàn tiền thành công. Mã GD: ${data.transactionCode}`);
      setIsDetailOpen(false);
  };

  const handleRejectRefund = (req: YeuCauHoanVe, note: string) => {
      setRequests(prev => prev.map(r => r.MaYeuCau === req.MaYeuCau ? { 
          ...r, 
          TrangThai: "TUCHOI",
          GhiChuAdmin: note,
          NgayXuLy: new Date()
      } : r));
      
      if (selectedRequest?.MaYeuCau === req.MaYeuCau) {
          setSelectedRequest({ ...selectedRequest, TrangThai: "TUCHOI" });
      }

      toast.info(`Đã từ chối yêu cầu. Lý do: ${note}`);
      setIsDetailOpen(false);
  };

  return (
    <div className="space-y-6 text-white h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <RefreshCcw className="size-6 text-primary" />
                Quản lý Hoàn vé
            </h1>
            <p className="text-slate-400 text-sm mt-1">Duyệt các yêu cầu hủy vé và hoàn tiền cho khách hàng.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Input 
            placeholder="Tìm theo Mã yêu cầu, Phim, Email..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="pl-10 bg-[#1C1C1C] border-slate-700 focus:border-primary" 
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-[#1C1C1C] border-slate-700">
                <div className="flex items-center gap-2">
                    <Filter className="size-4" />
                    <SelectValue placeholder="Lọc trạng thái" />
                </div>
            </SelectTrigger>
            <SelectContent className="bg-[#1C1C1C] text-slate-100 border-slate-700">
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="DANGCHO">Chờ xử lý</SelectItem>
                <SelectItem value="DAHOAN">Đã hoàn tiền</SelectItem>
                <SelectItem value="TUCHOI">Đã từ chối</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
                <Table>
                    <TableHeader className="sticky top-0 bg-[#1C1C1C] z-10 shadow-sm">
                        <TableRow className="border-slate-700 hover:bg-transparent">
                            <TableHead className="text-slate-100">Mã YC</TableHead>
                            <TableHead className="text-slate-100">Khách hàng</TableHead>
                            <TableHead className="text-slate-100">Thông tin vé</TableHead>
                            <TableHead className="text-slate-100 text-right">Số tiền hoàn</TableHead>
                            <TableHead className="text-slate-100">Ngày yêu cầu</TableHead>
                            <TableHead className="text-slate-100 text-center">Trạng thái</TableHead>
                            <TableHead className="text-slate-100 text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                            <TableRow key={req.MaYeuCau} className="border-slate-800 hover:bg-slate-800/50 cursor-pointer" onClick={() => handleViewDetail(req)}>
                                <TableCell className="font-mono text-slate-400 text-xs">{req.MaYeuCau}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{req.KhachHang.HoTen}</span>
                                        <span className="text-xs text-slate-500">{req.KhachHang.Email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium text-primary">{req.Ve.TenPhim}</span>
                                        <div className="flex gap-2 text-xs text-slate-400">
                                            <span>{req.Ve.TenPhong}</span>
                                            <span>•</span>
                                            <span>Ghế {req.Ve.MaGhe}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-bold text-green-400">
                                    {req.Ve.GiaVe.toLocaleString('vi-VN')} ₫
                                </TableCell>
                                <TableCell className="text-sm text-slate-300">
                                    {format(req.NgayYeuCau, "dd/MM/yyyy HH:mm", { locale: vi })}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline" className={getStatusColor(req.TrangThai)}>
                                        {getStatusLabel(req.TrangThai)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleViewDetail(req); }}>
                                        <Eye className="size-4 mr-2" /> Xem
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                    Không có yêu cầu hoàn vé nào.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
      </Card>

      {/* DETAIL DIALOG */}
      {selectedRequest && (
        <RefundDetailDialog 
            isOpen={isDetailOpen} 
            onClose={() => setIsDetailOpen(false)} 
            request={selectedRequest}
            onApprove={handleApproveRefund}
            onReject={handleRejectRefund}
        />
      )}
    </div>
  );
}

// --- DETAIL DIALOG (ĐÃ NÂNG CẤP) ---

interface RefundDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    request: YeuCauHoanVe;
    onApprove: (req: YeuCauHoanVe, data: { transactionCode: string, note: string }) => void;
    onReject: (req: YeuCauHoanVe, note: string) => void;
}

function RefundDetailDialog({ isOpen, onClose, request, onApprove, onReject }: RefundDetailDialogProps) {
    // State quản lý chế độ hiển thị (Xem / Form Duyệt / Form Từ chối)
    const [mode, setMode] = useState<"VIEW" | "APPROVE" | "REJECT">("VIEW");
    
    // State form
    const [transactionCode, setTransactionCode] = useState("");
    const [adminNote, setAdminNote] = useState("");

    const isPending = request.TrangThai === 'DANGCHO';

    // Reset form khi đóng hoặc đổi request
    React.useEffect(() => {
        if (isOpen) {
            setMode("VIEW");
            setTransactionCode("");
            setAdminNote("");
        }
    }, [isOpen, request]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center justify-between">
                        {mode === "VIEW" && "Chi tiết Yêu cầu"}
                        {mode === "APPROVE" && "Xác nhận Hoàn tiền"}
                        {mode === "REJECT" && "Từ chối Yêu cầu"}
                        
                        <Badge variant="outline" className={cn("ml-4 text-sm font-normal", getStatusColor(request.TrangThai))}>
                            {getStatusLabel(request.TrangThai)}
                        </Badge>
                    </DialogTitle>
                    {mode === "VIEW" && (
                        <DialogDescription className="text-slate-400">
                            Mã yêu cầu: {request.MaYeuCau}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <ScrollArea className="max-h-[70vh] pr-2">
                    <div className="space-y-6 py-2">
                        
                        {/* 1. HIỂN THỊ THÔNG TIN VÉ (Luôn hiện) */}
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-400 text-sm">Phim:</span>
                                <span className="font-medium text-primary text-right">{request.Ve.TenPhim}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 text-sm">Phòng / Ghế:</span>
                                <span className="text-slate-200 text-right">{request.Ve.TenPhong} - {request.Ve.MaGhe}</span>
                            </div>
                            <div className="border-t border-slate-700 my-2 pt-2 flex justify-between items-center">
                                <span className="text-slate-400 text-sm">Giá trị hoàn:</span>
                                <span className="text-xl font-bold text-green-400">{request.Ve.GiaVe.toLocaleString('vi-VN')} ₫</span>
                            </div>
                        </div>

                        {/* 2. LOGIC HIỂN THỊ THEO MODE */}
                        
                        {/* MODE VIEW: Xem chi tiết KH & Lý do */}
                        {mode === "VIEW" && (
                            <>
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-slate-300 uppercase flex items-center gap-2">
                                        <User className="size-4" /> Khách hàng
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><p className="text-slate-500">Họ tên</p><p className="text-slate-200">{request.KhachHang.HoTen}</p></div>
                                        <div><p className="text-slate-500">SĐT</p><p className="text-slate-200">{request.KhachHang.SoDienThoai}</p></div>
                                        <div className="col-span-2"><p className="text-slate-500">Email</p><p className="text-slate-200">{request.KhachHang.Email}</p></div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-slate-300 uppercase flex items-center gap-2">
                                        <Clock className="size-4" /> Chi tiết yêu cầu
                                    </h3>
                                    <div className="text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Thời gian gửi:</span>
                                            <span className="text-slate-200">{format(request.NgayYeuCau, "HH:mm:ss dd/MM/yyyy", { locale: vi })}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block mb-1">Lý do hoàn vé:</span>
                                            <div className="p-3 bg-slate-800 rounded text-slate-300 italic border border-slate-700">
                                                &quot;{request.LyDo || "Không có lý do cụ thể"}&quot;
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Hiển thị thông tin xử lý nếu đã xong */}
                                {request.TrangThai !== 'DANGCHO' && (
                                    <div className="space-y-3 pt-4 border-t border-slate-700">
                                        <h3 className="text-sm font-semibold text-slate-300 uppercase">Kết quả xử lý</h3>
                                        <div className="text-sm space-y-2">
                                            {request.MaGiaoDichHoan && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Mã giao dịch hoàn:</span>
                                                    <span className="text-primary font-mono">{request.MaGiaoDichHoan}</span>
                                                </div>
                                            )}
                                            {request.GhiChuAdmin && (
                                                <div>
                                                    <span className="text-slate-400">Ghi chú Admin:</span>
                                                    <p className="text-slate-200 mt-1">{request.GhiChuAdmin}</p>
                                                </div>
                                            )}
                                            {request.NgayXuLy && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Ngày xử lý:</span>
                                                    <span className="text-slate-200">{format(request.NgayXuLy, "HH:mm dd/MM/yyyy", { locale: vi })}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* MODE APPROVE: Form nhập thông tin hoàn tiền */}
                        {mode === "APPROVE" && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="space-y-2">
                                    <Label>Mã giao dịch ngân hàng (Nếu có)</Label>
                                    <Input 
                                        placeholder="VD: FT23492834..." 
                                        className="bg-transparent border-slate-700" 
                                        value={transactionCode}
                                        onChange={(e) => setTransactionCode(e.target.value)}
                                    />
                                    <p className="text-xs text-slate-500">Để trống nếu hoàn tiền tự động qua cổng thanh toán.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Ghi chú xử lý</Label>
                                    <Textarea 
                                        placeholder="Nhập ghi chú cho quản lý..." 
                                        className="bg-transparent border-slate-700" 
                                        rows={3}
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* MODE REJECT: Form nhập lý do từ chối */}
                        {mode === "REJECT" && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="space-y-2">
                                    <Label className="text-red-400">Lý do từ chối <span className="text-red-500">*</span></Label>
                                    <Textarea 
                                        placeholder="Nhập lý do từ chối để gửi cho khách hàng..." 
                                        className="bg-transparent border-slate-700 focus:border-red-500" 
                                        rows={4}
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                    </div>
                </ScrollArea>

                <DialogFooter className="gap-2 sm:justify-between pt-4 border-t border-slate-800">
                    {/* Nút Back / Close */}
                    <Button variant="ghost" onClick={() => mode === "VIEW" ? onClose() : setMode("VIEW")} className="text-slate-400 hover:text-white">
                        {mode === "VIEW" ? "Đóng" : "Quay lại"}
                    </Button>
                    
                    {/* Các nút hành động chính */}
                    {isPending && mode === "VIEW" && (
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button variant="destructive" onClick={() => setMode("REJECT")} className="flex-1 sm:flex-none">
                                <XCircle className="size-4 mr-2" /> Từ chối
                            </Button>
                            <Button onClick={() => setMode("APPROVE")} className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white">
                                <CheckCircle2 className="size-4 mr-2" /> Duyệt hoàn tiền
                            </Button>
                        </div>
                    )}

                    {/* Nút Submit trong Form */}
                    {mode === "APPROVE" && (
                        <Button onClick={() => onApprove(request, { transactionCode, note: adminNote })} className="bg-green-600 hover:bg-green-700">
                            Xác nhận Hoàn tiền
                        </Button>
                    )}

                    {mode === "REJECT" && (
                        <Button 
                            onClick={() => onReject(request, adminNote)} 
                            variant="destructive"
                            disabled={!adminNote.trim()}
                        >
                            Xác nhận Từ chối
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}