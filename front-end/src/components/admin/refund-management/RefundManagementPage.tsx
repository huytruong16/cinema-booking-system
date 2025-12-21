/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Filter,
  RefreshCcw,
  Eye,
  User,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  CreditCard,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { refundService } from "@/services/refund.service";
import apiClient from "@/lib/apiClient"; 

type TrangThaiYeuCau = "DANGCHO" | "DAHOAN" | "TUCHOI";

interface YeuCauHoanVe {
  MaYeuCau: string;
  MaVe: string;
  NgayYeuCau: Date;
  TrangThai: TrangThaiYeuCau;
  LyDo?: string;
  SoTienHoan: number;

  MaNganHang?: string;
  TenNganHang?: string;
  SoTaiKhoan?: string;
  ChuTaiKhoan?: string;

  Ve: {
    MaVe: string;
    MaGhe: string;
    GiaVe: number;
    TenPhim: string;
    TenPhong: string;
    SuatChieu: Date;
  };
  KhachHang: {
    HoTen: string;
    Email: string;
    SoDienThoai: string;
  };
  MaGiaoDichHoan?: string;
  GhiChuAdmin?: string;
  NgayXuLy?: Date;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "DAHOAN":
      return "bg-green-500/20 text-green-400 border-green-500/50";
    case "DANGCHO":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
    case "TUCHOI":
      return "bg-red-500/20 text-red-400 border-red-500/50";
    default:
      return "bg-slate-500/20 text-slate-400";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "DAHOAN":
      return "Đã hoàn tiền";
    case "DANGCHO":
      return "Chờ xử lý";
    case "TUCHOI":
      return "Đã từ chối";
    default:
      return status;
  }
};

export default function RefundManagementPage() {
  const [requests, setRequests] = useState<YeuCauHoanVe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [banks, setBanks] = useState<any[]>([]); 

  const [selectedRequest, setSelectedRequest] = useState<YeuCauHoanVe | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const banksRes = await apiClient.get("/banks");
      const bankList = banksRes.data as any[] || [];
      setBanks(bankList);

      const response = await refundService.getAll();
      const data = (response as any).data || [];

      const mappedData = data.map((item: any) => {
        const bankInfo = bankList.find(
          (b: any) =>
            b.MaNganHang === item.MaNganHang || b.Code === item.MaNganHang
        );
        const bankName = bankInfo
          ? `${bankInfo.TenNganHang} (${bankInfo.Code})`
          : item.MaNganHang;

        return {
          MaYeuCau: item.MaYeuCau,
          MaVe: item.Ve?.MaVe,
          NgayYeuCau: new Date(item.CreatedAt),
          TrangThai: item.TrangThai,
          LyDo: item.LyDo,
          SoTienHoan: item.Ve?.GiaVe || item.HoaDon?.TongTien || 0,

          MaNganHang: item.MaNganHang,
          TenNganHang: bankName,
          SoTaiKhoan: item.SoTaiKhoan,
          ChuTaiKhoan: item.ChuTaiKhoan,

          Ve: {
            MaVe: item.Ve?.MaVe || "N/A",
            MaGhe: item.Ve?.Ghe?.MaGhe || "N/A",
            GiaVe: item.Ve?.GiaVe || 0,
            TenPhim: item.Ve?.SuatChieu?.Phim?.TenPhim || "Unknown",
            TenPhong:
              item.Ve?.SuatChieu?.PhongChieu?.TenPhongChieu || "Unknown",
            SuatChieu: item.Ve?.SuatChieu?.ThoiGianChieu
              ? new Date(item.Ve.SuatChieu.ThoiGianChieu)
              : new Date(),
          },
          KhachHang: {
            HoTen: item.NguoiDung?.HoTen || "Khách vãng lai",
            Email: item.NguoiDung?.Email || "N/A",
            SoDienThoai: item.NguoiDung?.SoDienThoai || "N/A",
          },
          GhiChuAdmin: item.GhiChu,
          NgayXuLy:
            item.UpdatedAt !== item.CreatedAt
              ? new Date(item.UpdatedAt)
              : undefined,
        };
      });

      setRequests(mappedData);
    } catch (error) {
      console.error("Lỗi tải yêu cầu hoàn vé:", error);
      toast.error("Không thể tải danh sách yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchSearch =
        req.Ve.TenPhim.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.KhachHang.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.MaYeuCau.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === "all" || req.TrangThai === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const handleViewDetail = (req: YeuCauHoanVe) => {
    setSelectedRequest(req);
    setIsDetailOpen(true);
  };

  const handleApproveRefund = async (
    req: YeuCauHoanVe,
    data: { transactionCode: string; note: string }
  ) => {
    try {
      await refundService.approveRefund({
        MaYeuCauHoanTien: req.MaYeuCau,
        SoTien: req.SoTienHoan,
        PhuongThuc: "CHUYENKHOAN",
        GhiChu: data.note,
        MaGiaoDichNganHang: data.transactionCode,
      });

      toast.success(`Đã hoàn tiền thành công!`);
      setIsDetailOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xử lý hoàn tiền.");
    }
  };

  const handleRejectRefund = async (req: YeuCauHoanVe, note: string) => {
    try {
      await refundService.updateStatus(req.MaYeuCau, "TUCHOI", note);
      toast.info(`Đã từ chối yêu cầu.`);
      setIsDetailOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi từ chối yêu cầu.");
    }
  };

  return (
    <div className="space-y-6 text-white h-[calc(100vh-100px)] flex flex-col">
      {/* HEADER & FILTERS */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <RefreshCcw className="size-6 text-primary" />
            Quản lý Hoàn vé
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Duyệt các yêu cầu hủy vé và hoàn tiền cho khách hàng.
          </p>
        </div>
        <Button
          onClick={fetchData}
          variant="outline"
          size="sm"
          className="border-slate-700 bg-transparent hover:bg-slate-800"
        >
          <RefreshCcw className="size-4 mr-2" /> Làm mới
        </Button>
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

      {/* TABLE */}
      <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 relative">
          {loading && (
            <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary" />
            </div>
          )}

          <ScrollArea className="h-full">
            <Table>
              <TableHeader className="sticky top-0 bg-[#1C1C1C] z-10 shadow-sm">
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-100">Mã YC</TableHead>
                  <TableHead className="text-slate-100">Khách hàng</TableHead>
                  <TableHead className="text-slate-100">Thông tin vé</TableHead>
                  <TableHead className="text-slate-100 text-right">
                    Số tiền hoàn
                  </TableHead>
                  <TableHead className="text-slate-100">Ngày yêu cầu</TableHead>
                  <TableHead className="text-slate-100 text-center">
                    Trạng thái
                  </TableHead>
                  <TableHead className="text-slate-100 text-right">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <TableRow
                      key={req.MaYeuCau}
                      className="border-slate-800 hover:bg-slate-800/50 cursor-pointer"
                      onClick={() => handleViewDetail(req)}
                    >
                      <TableCell className="font-mono text-slate-400 text-xs">
                        {req.MaYeuCau.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {req.KhachHang.HoTen}
                          </span>
                          <span className="text-xs text-slate-500">
                            {req.KhachHang.Email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-primary">
                            {req.Ve.TenPhim}
                          </span>
                          <div className="flex gap-2 text-xs text-slate-400">
                            <span>{req.Ve.TenPhong}</span>
                            <span>•</span>
                            <span>Ghế {req.Ve.MaGhe}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-400">
                        {req.SoTienHoan.toLocaleString("vi-VN")} ₫
                      </TableCell>
                      <TableCell className="text-sm text-slate-300">
                        {format(req.NgayYeuCau, "dd/MM/yyyy HH:mm", {
                          locale: vi,
                        })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={getStatusColor(req.TrangThai)}
                        >
                          {getStatusLabel(req.TrangThai)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(req);
                          }}
                        >
                          <Eye className="size-4 mr-2" /> Xem
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-slate-500"
                    >
                      {!loading && "Không có yêu cầu hoàn vé nào."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </Card>

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

interface RefundDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: YeuCauHoanVe;
  onApprove: (
    req: YeuCauHoanVe,
    data: { transactionCode: string; note: string }
  ) => void;
  onReject: (req: YeuCauHoanVe, note: string) => void;
}

function RefundDetailDialog({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
}: RefundDetailDialogProps) {
  const [mode, setMode] = useState<"VIEW" | "APPROVE" | "REJECT">("VIEW");
  const [transactionCode, setTransactionCode] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const isPending = request.TrangThai === "DANGCHO";

  useEffect(() => {
    if (isOpen) {
      setMode("VIEW");
      setTransactionCode("");
      setAdminNote("");
    }
  }, [isOpen, request]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-h-[90vh] w-[80vw] h-[95vh] sm:max-w-[50vw] max-w-none overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            {mode === "VIEW" && "Chi tiết Yêu cầu"}
            {mode === "APPROVE" && "Xác nhận Hoàn tiền"}
            {mode === "REJECT" && "Từ chối Yêu cầu"}

            <Badge
              variant="outline"
              className={cn(
                "ml-4 text-sm font-normal",
                getStatusColor(request.TrangThai)
              )}
            >
              {getStatusLabel(request.TrangThai)}
            </Badge>
          </DialogTitle>
          {mode === "VIEW" && (
            <DialogDescription className="text-slate-400">
              Mã yêu cầu: {request.MaYeuCau}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* THÔNG TIN VÉ */}
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Phim:</span>
              <span className="font-medium text-primary text-right">
                {request.Ve.TenPhim}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Phòng / Ghế:</span>
              <span className="text-slate-200 text-right">
                {request.Ve.TenPhong} - {request.Ve.MaGhe}
              </span>
            </div>
            <div className="border-t border-slate-700 my-2 pt-2 flex justify-between items-center">
              <span className="text-slate-400 text-sm">Giá trị hoàn:</span>
              <span className="text-xl font-bold text-green-400">
                {request.SoTienHoan.toLocaleString("vi-VN")} ₫
              </span>
            </div>
          </div>

          {/* MODE VIEW */}
          {mode === "VIEW" && (
            <>
              {/* THÔNG TIN NHẬN TIỀN */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 uppercase flex items-center gap-2">
                  <CreditCard className="size-4" /> Thông tin nhận tiền
                </h3>
                {request.SoTaiKhoan ? (
                  <div className="bg-blue-900/10 border border-blue-900/30 p-3 rounded text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ngân hàng:</span>
                      <span className="text-white font-medium">
                        {request.TenNganHang}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Số tài khoản:</span>
                      <span className="text-white font-mono font-bold tracking-wide">
                        {request.SoTaiKhoan}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Chủ tài khoản:</span>
                      <span className="text-white font-medium uppercase">
                        {request.ChuTaiKhoan}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 italic">
                    Không có thông tin tài khoản nhận tiền.
                  </div>
                )}
              </div>

              {/* THÔNG TIN KHÁCH HÀNG */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 uppercase flex items-center gap-2">
                  <User className="size-4" /> Khách hàng
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Họ tên</p>
                    <p className="text-slate-200">{request.KhachHang.HoTen}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">SĐT</p>
                    <p className="text-slate-200">
                      {request.KhachHang.SoDienThoai}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-500">Email</p>
                    <p className="text-slate-200">{request.KhachHang.Email}</p>
                  </div>
                </div>
              </div>

              {/* CHI TIẾT LÝ DO */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 uppercase flex items-center gap-2">
                  <Clock className="size-4" /> Chi tiết
                </h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Thời gian gửi:</span>
                    <span className="text-slate-200">
                      {format(request.NgayYeuCau, "HH:mm:ss dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Lý do:</span>
                    <div className="p-3 bg-slate-800 rounded text-slate-300 italic border border-slate-700">
                      &quot;{request.LyDo || "Không có lý do"}&quot;
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* MODE APPROVE */}
          {mode === "APPROVE" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-green-900/10 border border-green-900/30 p-3 rounded text-sm text-green-400">
                Vui lòng thực hiện chuyển khoản đến tài khoản bên dưới trước khi
                xác nhận:
                <ul className="list-disc list-inside mt-2 text-slate-300 space-y-1">
                  <li>
                    Ngân hàng:{" "}
                    <span className="font-bold text-white">
                      {request.TenNganHang}
                    </span>
                  </li>
                  <li>
                    STK:{" "}
                    <span className="font-bold text-white">
                      {request.SoTaiKhoan}
                    </span>
                  </li>
                  <li>
                    Chủ TK:{" "}
                    <span className="font-bold text-white">
                      {request.ChuTaiKhoan}
                    </span>
                  </li>
                  <li>
                    Số tiền:{" "}
                    <span className="font-bold text-green-400">
                      {request.SoTienHoan.toLocaleString("vi-VN")} đ
                    </span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <Label>Mã giao dịch ngân hàng (Optional)</Label>
                <Input
                  placeholder="VD: FT123..."
                  className="bg-transparent border-slate-700"
                  value={transactionCode}
                  onChange={(e) => setTransactionCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Ghi chú xử lý</Label>
                <Textarea
                  placeholder="Ghi chú..."
                  className="bg-transparent border-slate-700"
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* MODE REJECT */}
          {mode === "REJECT" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-2">
                <Label className="text-red-400">
                  Lý do từ chối <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Nhập lý do..."
                  className="bg-transparent border-slate-700 focus:border-red-500"
                  rows={4}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between pt-4 border-t border-slate-800">
          <Button
            variant="ghost"
            onClick={() => (mode === "VIEW" ? onClose() : setMode("VIEW"))}
            className="text-slate-400 hover:text-white"
          >
            {mode === "VIEW" ? "Đóng" : "Quay lại"}
          </Button>

          {isPending && mode === "VIEW" && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="destructive" onClick={() => setMode("REJECT")}>
                <XCircle className="size-4 mr-2" /> Từ chối
              </Button>
              <Button
                onClick={() => setMode("APPROVE")}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="size-4 mr-2" /> Duyệt hoàn tiền
              </Button>
            </div>
          )}

          {mode === "APPROVE" && (
            <Button
              onClick={() =>
                onApprove(request, { transactionCode, note: adminNote })
              }
              className="bg-green-600 hover:bg-green-700"
            >
              Xác nhận
            </Button>
          )}
          {mode === "REJECT" && (
            <Button
              onClick={() => onReject(request, adminNote)}
              variant="destructive"
              disabled={!adminNote.trim()}
            >
              Xác nhận từ chối
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
