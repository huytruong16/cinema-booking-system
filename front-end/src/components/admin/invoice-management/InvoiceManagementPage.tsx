/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Eye,
  Filter,
  Receipt,
  CreditCard,
  Download,
  RefreshCcw,
  Calendar as CalendarIcon,
  X,
  Loader2,
  AlertTriangle,
  Tag,
  Image as ImageIcon,
  MapPin,
  Clock,
  Ticket,
  Popcorn,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import { invoiceService, BackendInvoice } from "@/services/invoice.service";

// --- TYPES (Frontend Only) ---
type TrangThaiThanhToan = "DANGCHO" | "THANHCONG" | "THATBAI";
type PhuongThucThanhToan =
  | "TRUCTIEP"
  | "TRUCTUYEN"
  | "MOMO"
  | "VNPAY"
  | "PAYOS";
type LoaiGiaoDich = "MUAVE" | "HOANTIEN";

interface GiaoDich {
  MaGiaoDich: string;
  Code: string;
  PhuongThuc: PhuongThucThanhToan;
  TongTien: number;
  TrangThai: TrangThaiThanhToan;
  NgayGiaoDich: Date;
  LoaiGiaoDich: LoaiGiaoDich;
  NoiDung?: string;
}

interface VeMua {
  MaVe: string;
  Code: string;
  TenPhim: string;
  PosterUrl: string;
  PhongChieu: string;
  Ghe: string;
  GiaVe: number;
  DaHoan: boolean;
}

interface ComboMua {
  MaCombo: string;
  TenCombo: string;
  HinhAnh: string;
  SoLuong: number;
  DonGia: number;
}

interface KhuyenMai {
  Code: string;
  SoTienGiam: number;
  MoTa?: string;
}

interface HoaDon {
  MaHoaDon: string;
  Code: string;
  Email: string;
  NgayLap: Date;
  TongTien: number;
  MaKhachHang?: string;
  GiaoDichs: GiaoDich[];
  Ves: VeMua[];
  Combos: ComboMua[];
  KhuyenMais: KhuyenMai[];
}

// --- HELPERS ---
const getStatusColor = (status: string) => {
  switch (status) {
    case "THANHCONG":
      return "bg-green-500/20 text-green-400 border-green-500/50";
    case "DANGCHO":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
    case "THATBAI":
      return "bg-red-500/20 text-red-400 border-red-500/50";
    default:
      return "bg-slate-500/20 text-slate-400";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "THANHCONG":
      return "Thành công";
    case "DANGCHO":
      return "Đang chờ";
    case "THATBAI":
      return "Thất bại";
    default:
      return status;
  }
};

const getPaymentMethodLabel = (method: string) => {
  const map: Record<string, string> = {
    TRUCTIEP: "Tiền mặt",
    TRUCTUYEN: "Online",
    MOMO: "Ví Momo",
    VNPAY: "VNPay QR",
    PAYOS: "Chuyển khoản (PayOS)",
  };
  return map[method] || method;
};

const parseSafeDate = (value: any): Date => {
  if (!value) return new Date();
  const date = new Date(value);
  return isNaN(date.getTime()) ? new Date() : date;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

export default function InvoiceManagementPage() {
  const [invoices, setInvoices] = useState<HoaDon[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const [selectedInvoice, setSelectedInvoice] = useState<HoaDon | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res: any = await invoiceService.getAll();
      const rawData: any[] = res.data || [];

      const mappedData: HoaDon[] = rawData.map((inv) => {
        let listGiaoDich: GiaoDich[] = [];
        if (inv.GiaoDich) {
          listGiaoDich.push({
            MaGiaoDich: inv.GiaoDich.MaGiaoDich,
            Code: inv.GiaoDich.Code,
            PhuongThuc: inv.GiaoDich.PhuongThuc,
            TongTien: Number(inv.GiaoDich.TongTien || inv.TongTien),
            TrangThai: inv.GiaoDich.TrangThai,
            NgayGiaoDich: parseSafeDate(inv.GiaoDich.NgayGiaoDich),
            LoaiGiaoDich: inv.GiaoDich.LoaiGiaoDich,
            NoiDung: inv.GiaoDich.NoiDung,
          });
        } else if (inv.GiaoDichs && Array.isArray(inv.GiaoDichs)) {
          listGiaoDich = inv.GiaoDichs.map((gd: any) => ({
            MaGiaoDich: gd.MaGiaoDich,
            Code: gd.Code,
            PhuongThuc: gd.PhuongThuc,
            TongTien: Number(gd.TongTien),
            TrangThai: gd.TrangThai,
            NgayGiaoDich: parseSafeDate(gd.NgayGiaoDich),
            LoaiGiaoDich: gd.LoaiGiaoDich,
            NoiDung: gd.NoiDung,
          }));
        }
        // 3. Fallback
        else {
          listGiaoDich.push({
            MaGiaoDich: "temp-" + inv.MaHoaDon,
            Code: "TXN-" + inv.Code,
            PhuongThuc: "TRUCTUYEN",
            TongTien: Number(inv.TongTien),
            TrangThai: inv.TrangThaiGiaoDich || "THANHCONG",
            NgayGiaoDich: parseSafeDate(inv.NgayLap),
            LoaiGiaoDich: "MUAVE",
          });
        }

        // Map Vé
        const listVe: VeMua[] = (inv.Ves || []).map((v: any, idx: number) => ({
          MaVe: `${inv.MaHoaDon}_ve_${idx}`,
          Code: `${inv.Code}_ve_${idx}`,
          TenPhim: inv.Phim?.TenPhim || "Không xác định",
          PosterUrl: inv.Phim?.PosterUrl || "",
          PhongChieu: inv.PhongChieu || "Không xác định",
          Ghe: v.SoGhe || "N/A",
          GiaVe: Number(v.DonGia || 0),
          DaHoan: v.TrangThai === "DAHOAN" || v.TrangThai === "CHOHOANTIEN",
        }));

        // Map Combo - GIỮ NGUYÊN ĐƠN GIÁ TỪ BACKEND
        const listCombo: ComboMua[] = (inv.Combos || []).map(
          (c: any, idx: number) => ({
            MaCombo: `${inv.MaHoaDon}_cb_${idx}`,
            TenCombo: c.TenCombo || "Combo",
            HinhAnh: c.HinhAnh || "",
            SoLuong: Number(c.SoLuong || 0),
            DonGia: Number(c.DonGia || 0), // Sử dụng trực tiếp đơn giá từ BE
          })
        );

        // Map Khuyến Mãi
        const listKhuyenMai: KhuyenMai[] = (inv.KhuyenMais || []).map(
          (k: any, idx: number) => ({
            Code: k.TenKhuyenMai || "KM",
            SoTienGiam: Number(k.SoTienGiam || 0),
            MoTa: k.LoaiKhuyenMai,
          })
        );

        return {
          MaHoaDon: inv.MaHoaDon,
          Code: inv.Code,
          Email: inv.Email || "Khách vãng lai",
          NgayLap: parseSafeDate(inv.NgayLap),
          TongTien: Number(inv.TongTien),
          MaKhachHang: "",
          GiaoDichs: listGiaoDich,
          Ves: listVe,
          Combos: listCombo,
          KhuyenMais: listKhuyenMai,
        };
      });

      setInvoices(mappedData);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Lỗi tải dữ liệu hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // --- FILTER LOGIC ---
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        inv.Code.toLowerCase().includes(term) ||
        (inv.Email && inv.Email.toLowerCase().includes(term));

      const lastTx =
        inv.GiaoDichs.length > 0
          ? inv.GiaoDichs[inv.GiaoDichs.length - 1].TrangThai
          : "DANGCHO";
      const matchStatus = statusFilter === "all" || lastTx === statusFilter;

      let matchDate = true;
      if (dateRange?.from) {
        const invDate = new Date(inv.NgayLap);
        const fromDate = startOfDay(dateRange.from);
        const toDate = dateRange.to
          ? endOfDay(dateRange.to)
          : endOfDay(dateRange.from);
        matchDate = isWithinInterval(invDate, { start: fromDate, end: toDate });
      }

      return matchSearch && matchStatus && matchDate;
    });
  }, [invoices, searchTerm, statusFilter, dateRange]);

  const handleViewDetail = (invoice: HoaDon) => {
    setSelectedInvoice(invoice);
    setIsDetailOpen(true);
  };

  const handlePrintInvoice = async () => {
    if (!selectedInvoice) return;

    // 1. Kiểm tra nhanh ở Frontend trước khi gọi API (Optional)
    if (!selectedInvoice.Ves || selectedInvoice.Ves.length === 0) {
      toast.error("Hóa đơn này chỉ có Combo hoặc không có vé để in.");
      return;
    }

    const toastId = toast.loading("Đang tải hóa đơn PDF...");

    try {
      // Gọi API
      const blobData = await invoiceService.printInvoice(selectedInvoice.Code);

      // Xử lý file PDF thành công
      const blob = new Blob([blobData], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const pdfWindow = window.open(url, "_blank");

      if (!pdfWindow) {
        toast.error(
          "Trình duyệt đã chặn cửa sổ bật lên. Vui lòng cho phép để xem hóa đơn.",
          { id: toastId }
        );
      } else {
        toast.success("Đã mở hóa đơn thành công!", { id: toastId });
      }

      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (error: any) {
      console.error("Print invoice error:", error);

      // 2. XỬ LÝ LỖI BLOB: Đọc message JSON từ Blob lỗi
      if (error.response && error.response.data instanceof Blob) {
        try {
          // Đọc text từ blob
          const errorText = await error.response.data.text();
          // Parse JSON: { "message": "Không có vé nào để in", ... }
          const errorJson = JSON.parse(errorText);

          // Hiển thị message từ BE
          toast.error(errorJson.message || "Không thể in hóa đơn này.", {
            id: toastId,
          });
        } catch (e) {
          // Fallback nếu không parse được JSON
          toast.error("Lỗi khi tải file hóa đơn.", { id: toastId });
        }
      } else {
        // Lỗi mạng hoặc lỗi khác không có response data
        toast.error("Lỗi kết nối đến máy chủ.", { id: toastId });
      }
    }
  };


  const handleCreateRefundRequest = async (reason: string) => {
    if (!selectedInvoice) return;

    try {
      const mockTicketCodes = selectedInvoice.Ves.map(
        (v, i) => `${selectedInvoice.Code}_${i + 1}`
      );

      await invoiceService.createRefundRequest({
        Code: mockTicketCodes,
        LyDo: reason,
      });

      toast.success("Đã gửi yêu cầu hoàn tiền thành công!");
      setIsRefundDialogOpen(false);
      setIsDetailOpen(false);
      fetchInvoices();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Lỗi khi gửi yêu cầu hoàn tiền"
      );
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateRange(undefined);
  };

  return (
    <div className="space-y-6 text-white h-[calc(100vh-100px)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="size-6 text-primary" />
            Quản lý Hóa đơn & Giao dịch
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Tra cứu hóa đơn và tạo yêu cầu hoàn vé.
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col xl:flex-row gap-4 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Tìm theo Mã hóa đơn, Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#1C1C1C] border-slate-700 focus:border-primary"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-[#1C1C1C] border-slate-700">
              <div className="flex items-center gap-2">
                <Filter className="size-4" />
                <SelectValue placeholder="Trạng thái" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-[#1C1C1C] text-slate-100 border-slate-700">
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="THANHCONG">Thành công</SelectItem>
              <SelectItem value="DANGCHO">Đang chờ</SelectItem>
              <SelectItem value="THATBAI">Thất bại</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal bg-[#1C1C1C] border-slate-700 hover:bg-slate-800 hover:text-white",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                      {format(dateRange.to, "dd/MM/yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy")
                  )
                ) : (
                  <span>Lọc theo ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-[#1C1C1C] border-slate-700"
              align="start"
            >
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={vi}
                className="text-slate-100"
              />
            </PopoverContent>
          </Popover>

          {(searchTerm || statusFilter !== "all" || dateRange) && (
            <Button
              variant="ghost"
              onClick={resetFilters}
              className="text-slate-400 hover:text-white"
            >
              <X className="size-4 mr-2" /> Xóa lọc
            </Button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0">
          <div className="h-full overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-[#1C1C1C] z-10 shadow-sm">
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-100 font-semibold">
                    Mã Hóa Đơn
                  </TableHead>
                  <TableHead className="text-slate-100 font-semibold">
                    Khách hàng
                  </TableHead>
                  <TableHead className="text-slate-100 font-semibold">
                    Ngày lập
                  </TableHead>
                  <TableHead className="text-slate-100 font-semibold text-right">
                    Tổng tiền
                  </TableHead>
                  <TableHead className="text-slate-100 font-semibold text-center">
                    Trạng thái
                  </TableHead>
                  <TableHead className="text-slate-100 font-semibold text-right">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-slate-500"
                    >
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="animate-spin size-5" /> Đang tải dữ
                        liệu...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => {
                    const lastTx =
                      invoice.GiaoDichs.length > 0
                        ? invoice.GiaoDichs[0]
                        : null;
                    const status = lastTx ? lastTx.TrangThai : "DANGCHO";

                    return (
                      <TableRow
                        key={invoice.MaHoaDon}
                        className="border-slate-800 hover:bg-slate-800/50 cursor-pointer"
                        onClick={() => handleViewDetail(invoice)}
                      >
                        <TableCell className="font-medium text-primary">
                          {invoice.Code}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm text-slate-200">
                              {invoice.Email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {format(invoice.NgayLap, "dd/MM/yyyy HH:mm", {
                            locale: vi,
                          })}
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-400">
                          {invoice.TongTien.toLocaleString("vi-VN")} ₫
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={getStatusColor(status)}
                          >
                            {getStatusLabel(status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetail(invoice);
                            }}
                          >
                            <Eye className="size-4 mr-2" /> Chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-slate-500"
                    >
                      Không tìm thấy hóa đơn nào phù hợp.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      {/* DIALOGS */}
      {selectedInvoice && (
        <InvoiceDetailDialog
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          invoice={selectedInvoice}
          onRefund={() => setIsRefundDialogOpen(true)}
          onPrint={handlePrintInvoice}
        />
      )}

      {selectedInvoice && (
        <CreateRefundDialog
          isOpen={isRefundDialogOpen}
          onClose={() => setIsRefundDialogOpen(false)}
          invoice={selectedInvoice}
          onSubmit={handleCreateRefundRequest}
        />
      )}
    </div>
  );
}

// --- SUB COMPONENTS ---

function InvoiceDetailDialog({
  isOpen,
  onClose,
  invoice,
  onPrint,
  onRefund,
}: {
  isOpen: boolean;
  onClose: () => void;
  invoice: HoaDon;
  onPrint: () => void;
  onRefund: () => void;
}) {
  const canRefund =
    invoice.GiaoDichs.some((gd) => gd.TrangThai === "THANHCONG") &&
    invoice.Ves.some((v) => !v.DaHoan);

  // Tính toán
  const totalVe = invoice.Ves.reduce((sum, v) => sum + v.GiaVe, 0);
  const totalCombo = invoice.Combos.reduce(
    (sum, c) => sum + c.DonGia * c.SoLuong,
    0
  );
  const tamTinh = totalVe + totalCombo;
  const totalGiamGia = invoice.KhuyenMais.reduce(
    (sum, k) => sum + k.SoTienGiam,
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-slate-800 bg-[#1C1C1C] rounded-t-lg shrink-0">
          <div className="flex justify-between items-center pr-8">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                Chi tiết Hóa đơn{" "}
                <span className="text-primary font-mono">{invoice.Code}</span>
              </DialogTitle>
              <DialogDescription className="text-slate-400 mt-1">
                {format(
                  invoice.NgayLap,
                  "EEEE, dd 'tháng' MM 'năm' yyyy - HH:mm",
                  { locale: vi }
                )}
              </DialogDescription>
            </div>
            {invoice.GiaoDichs.length > 0 && (
              <Badge
                className={cn(
                  "px-3 py-1 text-sm border",
                  getStatusColor(invoice.GiaoDichs[0].TrangThai)
                )}
              >
                {getStatusLabel(invoice.GiaoDichs[0].TrangThai)}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-[#1C1C1C]">
          <div className="p-6 space-y-8">
            {/* THÔNG TIN CHUNG */}
            <div className="grid grid-cols-2 gap-6 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                  Khách hàng
                </p>
                <p
                  className="text-base font-medium truncate"
                  title={invoice.Email}
                >
                  {invoice.Email}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                  Tổng thanh toán
                </p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(invoice.TongTien)}
                </p>
              </div>
            </div>

            {/* CHI TIẾT VÉ */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 uppercase mb-3 flex items-center gap-2">
                <Ticket className="size-4" /> Chi tiết Vé ({invoice.Ves.length})
              </h3>
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-900">
                    <TableRow className="border-slate-800 hover:bg-slate-900">
                      <TableHead className="text-slate-300 w-[50%]">
                        Mô tả
                      </TableHead>
                      <TableHead className="text-slate-300 text-center">
                        Ghế
                      </TableHead>
                      <TableHead className="text-slate-300 text-right">
                        Giá vé
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.Ves.map((ve, idx) => (
                      <TableRow
                        key={`ve-${idx}`}
                        className="border-slate-800 hover:bg-slate-800/30"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-12 bg-slate-800 rounded overflow-hidden shrink-0 border border-slate-700">
                              {ve.PosterUrl ? (
                                <img
                                  src={ve.PosterUrl}
                                  alt="Poster"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                  <ImageIcon className="size-4" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p
                                className="font-medium text-white text-sm truncate max-w-[300px]"
                                title={ve.TenPhim}
                              >
                                {ve.TenPhim}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                <MapPin className="size-3 inline mr-1" />
                                {ve.PhongChieu}
                              </p>
                              {ve.DaHoan && (
                                <Badge
                                  variant="destructive"
                                  className="mt-1 text-[10px] px-1.5 py-0 h-4"
                                >
                                  Đã hoàn
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="secondary"
                            className="bg-slate-800 min-w-[3rem] justify-center text-white"
                          >
                            {ve.Ghe}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-slate-200">
                          {formatCurrency(ve.GiaVe)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* CHI TIẾT COMBO */}
            {invoice.Combos.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase mb-3 flex items-center gap-2">
                  <Popcorn className="size-4" /> Combo bắp nước
                </h3>
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-900">
                      <TableRow className="border-slate-800 hover:bg-slate-900">
                        <TableHead className="text-slate-300 w-[50%]">
                          Combo
                        </TableHead>
                        <TableHead className="text-slate-300 text-center">
                          Số lượng
                        </TableHead>
                        <TableHead className="text-slate-300 text-right">
                          Đơn giá
                        </TableHead>
                        <TableHead className="text-slate-300 text-right">
                          Thành tiền
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.Combos.map((cb, idx) => (
                        <TableRow
                          key={`cb-${idx}`}
                          className="border-slate-800 hover:bg-slate-800/30"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-slate-800 rounded overflow-hidden shrink-0 border border-slate-700 flex items-center justify-center">
                                {cb.HinhAnh ? (
                                  <img
                                    src={cb.HinhAnh}
                                    alt="Combo"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Receipt className="size-4 text-slate-600" />
                                )}
                              </div>
                              <p
                                className="font-medium text-white text-sm truncate max-w-[250px]"
                                title={cb.TenCombo}
                              >
                                {cb.TenCombo}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-slate-300">
                            x{cb.SoLuong}
                          </TableCell>
                          <TableCell className="text-right text-slate-400">
                            {formatCurrency(cb.DonGia)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-slate-200">
                            {formatCurrency(cb.DonGia * cb.SoLuong)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* KHUYẾN MÃI & TỔNG KẾT */}
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tạm tính (Vé + Combo):</span>
                <span className="text-slate-200">
                  {formatCurrency(tamTinh)}
                </span>
              </div>

              {/* Section Khuyến mãi */}
              {invoice.KhuyenMais.length > 0 && (
                <div className="space-y-2 py-2 border-y border-slate-800 border-dashed">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase">
                    <Tag className="size-3" /> Khuyến mãi áp dụng
                  </div>
                  {invoice.KhuyenMais.map((km, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-500 border-green-500/30 font-mono text-[10px] px-1.5 py-0"
                        >
                          {km.Code}
                        </Badge>
                        <span className="text-slate-400 text-xs truncate max-w-[300px]">
                          {km.MoTa || "Giảm giá"}
                        </span>
                      </div>
                      <span className="text-green-400 font-medium">
                        -{formatCurrency(km.SoTienGiam)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {totalGiamGia > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Tổng giảm giá:</span>
                  <span className="text-green-400 font-bold">
                    -{formatCurrency(totalGiamGia)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-end pt-1">
                <span className="text-base font-bold text-white">
                  Tổng cộng:
                </span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(invoice.TongTien)}
                </span>
              </div>
            </div>

            {/* LỊCH SỬ GIAO DỊCH */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 uppercase mb-3 flex items-center gap-2">
                <CreditCard className="size-4" /> Lịch sử giao dịch
              </h3>
              <div className="space-y-3">
                {invoice.GiaoDichs && invoice.GiaoDichs.length > 0 ? (
                  invoice.GiaoDichs.map((gd) => (
                    <div
                      key={gd.MaGiaoDich}
                      className="flex items-center justify-between p-3 rounded border border-slate-800 bg-slate-900/30"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-full",
                            gd.TrangThai === "THANHCONG"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                          )}
                        >
                          <CreditCard className="size-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-200">
                            {getPaymentMethodLabel(gd.PhuongThuc)}
                            <span className="text-slate-500 mx-2">•</span>
                            <span className="text-xs font-normal text-slate-400 font-mono">
                              {gd.Code}
                            </span>
                          </p>
                          <p className="text-xs text-slate-500">
                            {format(gd.NgayGiaoDich, "HH:mm:ss dd/MM/yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            "font-bold",
                            gd.LoaiGiaoDich === "HOANTIEN"
                              ? "text-red-400"
                              : "text-slate-200"
                          )}
                        >
                          {gd.LoaiGiaoDich === "HOANTIEN" ? "-" : "+"}
                          {formatCurrency(gd.TongTien)}
                        </p>
                        <span
                          className={cn(
                            "text-xs",
                            gd.TrangThai === "THANHCONG"
                              ? "text-green-500"
                              : "text-red-500"
                          )}
                        >
                          {getStatusLabel(gd.TrangThai)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-500 py-4 italic text-sm border border-dashed border-slate-800 rounded">
                    Chưa có lịch sử giao dịch nào.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-800 bg-[#1C1C1C] shrink-0 sm:justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-transparent border-slate-700 hover:bg-slate-800"
              onClick={onPrint}
            >
              <Download className="size-4 mr-2" /> Xuất hóa đơn
            </Button>
            {canRefund && (
              <Button
                variant="destructive"
                className="bg-red-900/20 text-red-400 border border-red-900 hover:bg-red-900/40"
                onClick={onRefund}
              >
                <RefreshCcw className="size-4 mr-2" /> Hoàn toàn bộ hóa đơn
              </Button>
            )}
          </div>
          <DialogClose asChild>
            <Button
              variant="secondary"
              className="bg-slate-800 hover:bg-slate-700 text-white min-w-[100px]"
            >
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateRefundDialog({
  isOpen,
  onClose,
  invoice,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  invoice: HoaDon;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  const availableRefundAmount = invoice.Ves.filter((v) => !v.DaHoan).reduce(
    (sum, v) => sum + v.GiaVe,
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-yellow-500" />
            Xác nhận hoàn hóa đơn
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Bạn đang yêu cầu hoàn tiền cho{" "}
            <span className="text-white font-bold">toàn bộ vé</span> trong hóa
            đơn <span className="font-mono text-white">{invoice.Code}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="bg-red-900/10 border border-red-900/30 p-3 rounded-md">
            <p className="text-sm text-red-400">
              Lưu ý: Hệ thống hiện tại chỉ hỗ trợ hoàn tiền vé phim. Các sản
              phẩm Combo đi kèm sẽ không được hoàn tiền.
            </p>
          </div>

          <div className="space-y-2">
            <Label>
              Lý do hoàn tiền <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Nhập lý do khách hàng yêu cầu hoàn..."
              className="bg-transparent border-slate-700"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
            <span className="text-sm text-slate-400">
              Tổng tiền hoàn dự kiến:
            </span>
            <span className="text-xl font-bold text-white">
              {formatCurrency(availableRefundAmount)}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            Hủy
          </Button>
          <Button
            onClick={() => onSubmit(reason)}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={!reason.trim()}
          >
            Gửi yêu cầu hoàn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
