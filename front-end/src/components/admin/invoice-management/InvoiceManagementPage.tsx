"use client";

import React, { useState, useMemo } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";

// --- TYPES ---
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
  TenPhim: string;
  PhongChieu: string;
  Ghe: string;
  GiaVe: number;
  DaHoan: boolean;
}

interface ComboMua {
  MaCombo: string;
  TenCombo: string;
  SoLuong: number;
  DonGia: number;
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
}

// --- MOCK DATA ---
const mockInvoices: HoaDon[] = [
  {
    MaHoaDon: "uuid-hd-1",
    Code: "HD241115-001",
    Email: "khachhangA@gmail.com",
    NgayLap: new Date("2024-11-15T10:30:00"),
    TongTien: 250000,
    GiaoDichs: [
      {
        MaGiaoDich: "uuid-gd-1",
        Code: "TXN_MOMO_123456",
        PhuongThuc: "MOMO",
        TongTien: 250000,
        TrangThai: "THANHCONG",
        NgayGiaoDich: new Date("2024-11-15T10:35:00"),
        LoaiGiaoDich: "MUAVE",
        NoiDung: "Thanh toan ve xem phim",
      },
    ],
    Ves: [
      {
        MaVe: "v1",
        TenPhim: "Inside Out 2",
        PhongChieu: "P01",
        Ghe: "F5",
        GiaVe: 90000,
        DaHoan: false,
      },
      {
        MaVe: "v2",
        TenPhim: "Inside Out 2",
        PhongChieu: "P01",
        Ghe: "F6",
        GiaVe: 90000,
        DaHoan: false,
      },
    ],
    Combos: [
      {
        MaCombo: "c1",
        TenCombo: "Combo Bắp Nước Lớn",
        SoLuong: 1,
        DonGia: 70000,
      },
    ],
  },
  {
    MaHoaDon: "uuid-hd-3",
    Code: "HD241114-055",
    Email: "lethic@outlook.com",
    NgayLap: new Date("2024-11-14T19:00:00"),
    TongTien: 300000,
    GiaoDichs: [
      {
        MaGiaoDich: "uuid-gd-3",
        Code: "CASH_001",
        PhuongThuc: "TRUCTIEP",
        TongTien: 300000,
        TrangThai: "THANHCONG",
        NgayGiaoDich: new Date("2024-11-14T19:05:00"),
        LoaiGiaoDich: "MUAVE",
        NoiDung: "Thanh toán tiền mặt tại quầy",
      },
    ],
    Ves: [
      {
        MaVe: "v4",
        TenPhim: "Kẻ Trộm Mặt Trăng 4",
        PhongChieu: "P02",
        Ghe: "E1",
        GiaVe: 100000,
        DaHoan: true,
      },
      {
        MaVe: "v5",
        TenPhim: "Kẻ Trộm Mặt Trăng 4",
        PhongChieu: "P02",
        Ghe: "E2",
        GiaVe: 100000,
        DaHoan: false,
      },
    ],
    Combos: [
      { MaCombo: "c2", TenCombo: "Bắp Phô Mai", SoLuong: 2, DonGia: 50000 },
    ],
  },
  {
    MaHoaDon: "uuid-hd-4",
    Code: "HD241116-002",
    Email: "nguyenvand@gmail.com",
    NgayLap: new Date("2024-11-16T08:15:00"),
    TongTien: 150000,
    GiaoDichs: [
      {
        MaGiaoDich: "uuid-gd-4",
        Code: "PAYOS_999888",
        PhuongThuc: "PAYOS",
        TongTien: 150000,
        TrangThai: "DANGCHO",
        NgayGiaoDich: new Date("2024-11-16T08:16:00"),
        LoaiGiaoDich: "MUAVE",
        NoiDung: "Chuyển khoản QR",
      },
    ],
    Ves: [
      {
        MaVe: "v6",
        TenPhim: "Dune: Part Two",
        PhongChieu: "P03",
        Ghe: "H5",
        GiaVe: 150000,
        DaHoan: false,
      },
    ],
    Combos: [],
  },
  {
    MaHoaDon: "uuid-hd-5",
    Code: "HD241113-012",
    Email: "failed_user@test.com",
    NgayLap: new Date("2024-11-13T14:20:00"),
    TongTien: 400000,
    GiaoDichs: [
      {
        MaGiaoDich: "uuid-gd-5",
        Code: "MOMO_ERR_001",
        PhuongThuc: "MOMO",
        TongTien: 400000,
        TrangThai: "THATBAI",
        NgayGiaoDich: new Date("2024-11-13T14:25:00"),
        LoaiGiaoDich: "MUAVE",
        NoiDung: "Lỗi kết nối ngân hàng",
      },
    ],
    Ves: [],
    Combos: [],
  },
];

// --- HELPERS ---
const getStatusColor = (status: TrangThaiThanhToan) => {
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

const getStatusLabel = (status: TrangThaiThanhToan) => {
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

export default function InvoiceManagementPage() {
  const [invoices, setInvoices] = useState<HoaDon[]>(mockInvoices);

  // States cho Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const [selectedInvoice, setSelectedInvoice] = useState<HoaDon | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // 1. Lọc theo Search (Mã HĐ hoặc Email)
      const matchSearch =
        inv.Code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.Email.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Lọc theo Trạng thái (dựa vào giao dịch cuối cùng)
      const lastTx =
        inv.GiaoDichs.length > 0
          ? inv.GiaoDichs[inv.GiaoDichs.length - 1].TrangThai
          : "DANGCHO";
      const matchStatus = statusFilter === "all" || lastTx === statusFilter;

      // 3. Lọc theo Khoảng thời gian (Date Range)
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

  const handlePrintInvoice = () => {
    toast.info("Đang in hóa đơn...");
  };

  const handleCreateRefundRequest = (
    selectedTicketIds: string[],
    reason: string
  ) => {
    toast.success(
      `Đã tạo yêu cầu hoàn ${selectedTicketIds.length} vé thành công!`
    );
    setIsRefundDialogOpen(false);
    setIsDetailOpen(false);
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

      <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
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
                    Trạng thái GD
                  </TableHead>
                  <TableHead className="text-slate-100 font-semibold text-right">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length > 0 ? (
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
          </ScrollArea>
        </div>
      </Card>

      {selectedInvoice && (
        <InvoiceDetailDialog
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          invoice={selectedInvoice}
          onPrint={handlePrintInvoice}
          onRefund={() => setIsRefundDialogOpen(true)}
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
  const canRefund = invoice.GiaoDichs.some(
    (gd) => gd.TrangThai === "THANHCONG"
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-slate-800 bg-[#1C1C1C] rounded-t-lg shrink-0">
          <div className="flex justify-between items-center pr-8">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                Chi tiết Hóa đơn{" "}
                <span className="text-primary">{invoice.Code}</span>
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

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-2 gap-6 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                  Khách hàng
                </p>
                <p className="text-base font-medium">{invoice.Email}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                  Tổng thanh toán
                </p>
                <p className="text-2xl font-bold text-green-400">
                  {invoice.TongTien.toLocaleString("vi-VN")} ₫
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-300 uppercase mb-3 flex items-center gap-2">
                <Receipt className="size-4" /> Chi tiết đơn hàng
              </h3>
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-900">
                    <TableRow className="border-slate-800 hover:bg-slate-900">
                      <TableHead className="text-slate-300">Mô tả</TableHead>
                      <TableHead className="text-slate-300 text-center">
                        SL / Ghế
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
                    {invoice.Ves.map((ve, idx) => (
                      <TableRow
                        key={`ve-${idx}`}
                        className="border-slate-800 hover:bg-slate-800/30"
                      >
                        <TableCell>
                          <p className="font-medium text-white">{ve.TenPhim}</p>
                          <p className="text-xs text-slate-500">
                            Phòng {ve.PhongChieu}
                          </p>
                          {ve.DaHoan && (
                            <Badge
                              variant="destructive"
                              className="mt-1 text-[10px] px-1 py-0 h-4"
                            >
                              Đã hoàn
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="bg-slate-800">
                            {ve.Ghe}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-slate-400">
                          {ve.GiaVe.toLocaleString()} ₫
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {ve.GiaVe.toLocaleString()} ₫
                        </TableCell>
                      </TableRow>
                    ))}
                    {invoice.Combos.map((cb, idx) => (
                      <TableRow
                        key={`cb-${idx}`}
                        className="border-slate-800 hover:bg-slate-800/30"
                      >
                        <TableCell>
                          <p className="font-medium text-white">
                            {cb.TenCombo}
                          </p>
                        </TableCell>
                        <TableCell className="text-center text-slate-300">
                          x{cb.SoLuong}
                        </TableCell>
                        <TableCell className="text-right text-slate-400">
                          {cb.DonGia.toLocaleString()} ₫
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {(cb.DonGia * cb.SoLuong).toLocaleString()} ₫
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-slate-900/50 hover:bg-slate-900/50 border-t border-slate-700">
                      <TableCell
                        colSpan={3}
                        className="text-right font-bold text-slate-200"
                      >
                        Tổng cộng
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary text-lg">
                        {invoice.TongTien.toLocaleString()} ₫
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-300 uppercase mb-3 flex items-center gap-2">
                <CreditCard className="size-4" /> Lịch sử giao dịch
              </h3>
              <div className="space-y-3">
                {invoice.GiaoDichs.map((gd) => (
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
                          <span className="text-xs font-normal text-slate-400">
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
                        {gd.TongTien.toLocaleString()} ₫
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
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

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
                <RefreshCcw className="size-4 mr-2" /> Yêu cầu hoàn vé
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
  onSubmit: (ticketIds: string[], reason: string) => void;
}) {
  const availableTickets = invoice.Ves.filter((v) => !v.DaHoan);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [reason, setReason] = useState("");

  const handleToggleTicket = (maVe: string) => {
    setSelectedTickets((prev) =>
      prev.includes(maVe) ? prev.filter((id) => id !== maVe) : [...prev, maVe]
    );
  };

  const totalRefundAmount = availableTickets
    .filter((v) => selectedTickets.includes(v.MaVe))
    .reduce((sum, v) => sum + v.GiaVe, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo yêu cầu hoàn vé</DialogTitle>
          <DialogDescription className="text-slate-400">
            Chọn vé cần hoàn và nhập lý do. Yêu cầu sẽ được gửi để duyệt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Chọn vé hoàn ({selectedTickets.length})</Label>
            {availableTickets.length > 0 ? (
              <div className="grid gap-2 border border-slate-800 rounded-md p-2 max-h-[200px] overflow-y-auto">
                {availableTickets.map((ve) => (
                  <div
                    key={ve.MaVe}
                    className="flex items-center justify-between p-2 rounded hover:bg-slate-800/50 cursor-pointer"
                    onClick={() => handleToggleTicket(ve.MaVe)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`refund-${ve.MaVe}`}
                        checked={selectedTickets.includes(ve.MaVe)}
                        onCheckedChange={() => handleToggleTicket(ve.MaVe)}
                        className="border-slate-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-200">
                          {ve.TenPhim}
                        </p>
                        <p className="text-xs text-slate-500">
                          Ghế {ve.Ghe} • {ve.GiaVe.toLocaleString()} ₫
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-yellow-500 italic">
                Không có vé nào khả dụng để hoàn.
              </p>
            )}
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
              {totalRefundAmount.toLocaleString()} ₫
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
            onClick={() => onSubmit(selectedTickets, reason)}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={selectedTickets.length === 0 || !reason.trim()}
          >
            Gửi yêu cầu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
