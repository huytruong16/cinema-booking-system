/* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
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
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  CreditCard,
  Calendar,
  FileText,
  Film,
  MapPin,
  Popcorn, 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { refundService } from "@/services/refund.service";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";

type TrangThaiYeuCau = "DANGCHO" | "DAHOAN" | "DAHUY";


interface VeChiTiet {
  MaVe: string;
  GiaVe: string;
  TrangThaiVe: string;
  GheSuatChieu: {
    SuatChieu: {
      ThoiGianBatDau: string;
      PhienBanPhim: {
        Phim: {
          TenHienThi: string;
          TomTatNoiDung: string;
          TenGoc: string;
          PosterUrl: string;
          ThoiLuong: number;
        };
      };
    };
    GhePhongChieu: {
      GheLoaiGhe: {
        LoaiGhe: { LoaiGhe: string };
        Ghe: { Hang: string; Cot: string };
      };
    };
  };
}

interface HoaDonCombo {
  SoLuong: number;
  DonGia: string | number;
  Combo: {
    TenCombo: string;
  };
}

interface YeuCauHoanVeDetail {
  MaYeuCau: string;
  MaHoaDon: string;
  TrangThai: "DANGCHO" | "DAHOAN" | "TUCHOI";
  LyDoHoan: string;
  SoTien: string;
  CreatedAt: string;

  MaNganHang: string;
  SoTaiKhoan: string;
  TenChuTaiKhoan: string;
  TenNganHangHienThi?: string;

  HoaDon: {
    Code: string;
    Email: string;
    NgayLap: string;
    TongTien: string;
    Ves: VeChiTiet[];
    HoaDonCombos?: HoaDonCombo[];
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "DAHOAN":
      return "bg-green-500/20 text-green-400 border-green-500/50";
    case "DANGCHO":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
    case "DAHUY":
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
    case "DAHUY":
      return "Đã từ chối";
    default:
      return status;
  }
};

export default function RefundManagementPage() {
  const { hasPermission } = useAuth();
  const [requests, setRequests] = useState<YeuCauHoanVeDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [banks, setBanks] = useState<any[]>([]);

  const [selectedRequest, setSelectedRequest] =
    useState<YeuCauHoanVeDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const banksRes = await apiClient.get("/banks");
      const bankList = (banksRes.data as any[]) || [];
      setBanks(bankList);

      const response = await refundService.getAll();
      const rawData = (response as any).data || [];

      const mappedList = rawData.map((item: any) => ({
        ...item,
        TenNganHangHienThi:
          bankList.find((b) => b.MaNganHang === item.MaNganHang)?.TenNganHang ||
          item.MaNganHang,
      }));

      setRequests(mappedList);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const lowerSearch = searchTerm.toLowerCase();
      const code = req.HoaDon?.Code?.toLowerCase() || "";
      const email = req.HoaDon?.Email?.toLowerCase() || "";

      const matchSearch =
        code.includes(lowerSearch) ||
        email.includes(lowerSearch) ||
        req.MaYeuCau.toLowerCase().includes(lowerSearch);

      const matchStatus =
        statusFilter === "all" || req.TrangThai === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const handleViewDetail = async (id: string) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await refundService.getDetail(id);
      const detailData = res.data as YeuCauHoanVeDetail;

      const bankName =
        banks.find((b) => b.MaNganHang === detailData.MaNganHang)
          ?.TenNganHang || detailData.MaNganHang;

      setSelectedRequest({
        ...detailData,
        TenNganHangHienThi: bankName,
      });
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải thông tin chi tiết.");
      setIsDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

    const handleApproveRefund = async (
      req: YeuCauHoanVeDetail,
      data: { transactionCode: string; note: string }
    ) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        await refundService.approveRefund({
          MaYeuCauHoanTien: req.MaYeuCau,
          PhuongThuc: "TRUCTUYEN",
        });
        await refundService.updateStatus(req.MaYeuCau, "DAHOAN");
        toast.success(`Đã tạo giao dịch hoàn tiền thành công!`);
        setIsDetailOpen(false);
        fetchData();
      } catch (error: any) {
        console.error(error);
        const msg = error.response?.data?.message;
        const displayMsg = Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Lỗi khi xử lý hoàn tiền.";
        toast.error(displayMsg);
      } finally {
        setIsSubmitting(false);
      }
    };

  const handleRejectRefund = async (req: YeuCauHoanVeDetail, note: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await refundService.updateStatus(req.MaYeuCau, "DAHUY", note);
      toast.info(`Đã hủy yêu cầu hoàn vé.`);
      setIsDetailOpen(false);
      fetchData();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message;
      const displayMsg = Array.isArray(msg)
        ? msg.join(", ")
        : msg || "Lỗi khi từ chối yêu cầu.";
      toast.error(displayMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-white h-[calc(100vh-100px)] flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <RefreshCcw className="size-6 text-primary" />
            Quản lý Hoàn tiền
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Duyệt yêu cầu hoàn tiền hóa đơn (Bao gồm Vé và Combo).
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

      {/* FILTER */}
      <div className="flex flex-col sm:flex-row gap-4 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Tìm theo Mã hóa đơn, Email..."
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
            <SelectItem value="DAHUY">Đã từ chối</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* TABLE */}
      <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader className="sticky top-0 bg-[#1C1C1C] z-10 shadow-sm">
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-100">Mã YC</TableHead>
                <TableHead className="text-slate-100">Khách hàng</TableHead>
                <TableHead className="text-slate-100">Hóa đơn</TableHead>
                <TableHead className="text-slate-100 text-right">
                  Số tiền
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
                    onClick={() => handleViewDetail(req.MaYeuCau)}
                  >
                    <TableCell className="font-mono text-slate-400 text-xs">
                      {req.MaYeuCau.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {req.TenChuTaiKhoan}
                        </span>
                        <span className="text-xs text-slate-500">
                          {req.HoaDon?.Email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-slate-800 font-mono"
                      >
                        #{req.HoaDon?.Code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-400">
                      {Number(req.SoTien).toLocaleString("vi-VN")} ₫
                    </TableCell>
                    <TableCell className="text-sm text-slate-300">
                      {format(new Date(req.CreatedAt), "dd/MM/yyyy HH:mm", {
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
                          handleViewDetail(req.MaYeuCau);
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
                    {!loading && "Không có dữ liệu."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {isDetailOpen && (
        <RefundDetailDialog
          isOpen={isDetailOpen}
          isLoading={detailLoading}
          onClose={() => setIsDetailOpen(false)}
          request={selectedRequest}
          onApprove={handleApproveRefund}
          onReject={handleRejectRefund}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
interface RefundDetailDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  request: YeuCauHoanVeDetail | null;
  onApprove: (
    req: YeuCauHoanVeDetail,
    data: { transactionCode: string; note: string }
  ) => void;
  onReject: (req: YeuCauHoanVeDetail, note: string) => void;
  isSubmitting: boolean;
}

function RefundDetailDialog({
  isOpen,
  isLoading,
  onClose,
  request,
  onApprove,
  onReject,
  isSubmitting,
}: RefundDetailDialogProps) {
  const [mode, setMode] = useState<"VIEW" | "APPROVE" | "REJECT">("VIEW");
  const [transactionCode, setTransactionCode] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const { hasPermission } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setMode("VIEW");
      setTransactionCode("");
      setAdminNote("");
    }
  }, [isOpen]);

  if (!request) return null;

  const isPending = request.TrangThai === "DANGCHO";
  const movieInfo =
    request.HoaDon?.Ves?.[0]?.GheSuatChieu?.SuatChieu?.PhienBanPhim?.Phim;
  const showtimeInfo =
    request.HoaDon?.Ves?.[0]?.GheSuatChieu?.SuatChieu?.ThoiGianBatDau;
  const comboList = request.HoaDon?.HoaDonCombos || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] [&>button]:hidden border-slate-800 text-white w-[90vw] h-[95vh] sm:max-w-[60vw] max-w-none flex flex-col p-0 overflow-hidden">
        {/* HEADER */}
        <DialogHeader className="p-6 pb-2 border-b border-slate-800 bg-[#151515]">
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            {mode === "VIEW" && "Chi tiết Yêu cầu Hoàn tiền"}
            {mode === "APPROVE" && "Xác nhận Duyệt"}
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
        </DialogHeader>

        <div className="flex-1 p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin text-primary size-8" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* 1. THÔNG TIN PHIM */}
              {movieInfo ? (
                <div className="flex gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  {movieInfo.PosterUrl && (
                    <div className="relative w-20 h-28 shrink-0 rounded-lg overflow-hidden border border-slate-700">
                      <Image
                        src={movieInfo.PosterUrl}
                        alt={movieInfo.TenHienThi}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-bold text-lg text-primary">
                      {movieInfo.TenHienThi}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                      {showtimeInfo && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-4 text-slate-500" />
                          {format(new Date(showtimeInfo), "dd/MM/yyyy", {
                            locale: vi,
                          })}
                        </div>
                      )}
                      {showtimeInfo && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-4 text-slate-500" />
                          {format(new Date(showtimeInfo), "HH:mm", {
                            locale: vi,
                          })}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Film className="size-4 text-slate-500" />
                        {movieInfo.ThoiLuong} phút
                      </div>
                    </div>
                    <h3 className="text-sm text-slate-500 italic mt-2 line-clamp-2">
                      {movieInfo.TomTatNoiDung}
                    </h3>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-900/30 rounded-lg text-slate-500 text-sm italic text-center">
                  Không tìm thấy thông tin phim
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 2. CỘT TRÁI: CHI TIẾT HÓA ĐƠN (VÉ + COMBO) */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-300 uppercase flex items-center gap-2">
                      <MapPin className="size-4" /> Danh sách ghế hoàn
                    </h4>
                    <div className="bg-slate-900/30 rounded-lg border border-slate-800 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-slate-900">
                          <TableRow className="border-slate-800 hover:bg-transparent">
                            <TableHead className="h-9 text-xs text-white">
                              Ghế
                            </TableHead>
                            <TableHead className="h-9 text-xs text-white">
                              Loại
                            </TableHead>
                            <TableHead className="h-9 text-xs text-right text-white">
                              Giá vé
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {request.HoaDon?.Ves?.map((ve) => (
                            <TableRow
                              key={ve.MaVe}
                              className="border-slate-800 hover:bg-slate-800/50"
                            >
                              <TableCell className="font-bold text-white">
                                {
                                  ve.GheSuatChieu?.GhePhongChieu?.GheLoaiGhe
                                    ?.Ghe?.Hang
                                }
                                {
                                  ve.GheSuatChieu?.GhePhongChieu?.GheLoaiGhe
                                    ?.Ghe?.Cot
                                }
                              </TableCell>
                              <TableCell className="text-xs text-slate-400">
                                {
                                  ve.GheSuatChieu?.GhePhongChieu?.GheLoaiGhe
                                    ?.LoaiGhe?.LoaiGhe
                                }
                              </TableCell>
                              <TableCell className="text-right text-xs">
                                {Number(ve.GiaVe).toLocaleString()}đ
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {comboList.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-300 uppercase flex items-center gap-2">
                        <Popcorn className="size-4" /> Danh sách Combo
                      </h4>
                      <div className="bg-slate-900/30 rounded-lg border border-slate-800 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-slate-900">
                            <TableRow className="border-slate-800 hover:bg-transparent">
                              <TableHead className="h-9 text-xs text-white">
                                Tên Combo
                              </TableHead>
                              <TableHead className="h-9 text-xs text-center text-white">
                                SL
                              </TableHead>
                              <TableHead className="h-9 text-xs text-right text-white">
                                Thành tiền
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {comboList.map((cb, idx) => (
                              <TableRow
                                key={idx}
                                className="border-slate-800 hover:bg-slate-800/50"
                              >
                                <TableCell className="text-xs font-medium text-white">
                                  {cb.Combo?.TenCombo}
                                </TableCell>
                                <TableCell className="text-xs text-center text-slate-400">
                                  x{cb.SoLuong}
                                </TableCell>
                                <TableCell className="text-right text-xs text-green-400">
                                  {(
                                    Number(cb.DonGia) * cb.SoLuong
                                  ).toLocaleString()}
                                  đ
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. CỘT PHẢI: THÔNG TIN THANH TOÁN & KHÁCH HÀNG */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-300 uppercase flex items-center gap-2">
                      <CreditCard className="size-4" /> Thông tin nhận tiền
                    </h4>
                    <div className="bg-blue-900/10 border border-blue-900/30 p-3 rounded-lg text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ngân hàng:</span>{" "}
                        <span className="text-white font-medium">
                          {request.TenNganHangHienThi}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Số tài khoản:</span>{" "}
                        <span className="text-white font-mono font-bold tracking-wide">
                          {request.SoTaiKhoan}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Chủ tài khoản:</span>{" "}
                        <span className="text-white font-medium uppercase">
                          {request.TenChuTaiKhoan}
                        </span>
                      </div>
                      <div className="border-t border-blue-900/30 pt-2 flex justify-between items-center">
                        <span className="text-slate-400">Tổng tiền hoàn:</span>
                        <span className="text-green-400 font-bold text-2xl">
                          {Number(request.SoTien).toLocaleString()} ₫
                        </span>
                      </div>
                      {comboList.length > 0 && (
                        <div className="text-xs text-blue-400/80 italic text-right mt-1">
                          * Đã bao gồm tiền vé và combo
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <h4 className="text-sm font-semibold text-slate-300 uppercase flex items-center gap-2">
                      <FileText className="size-4" /> Lý do & Hóa đơn
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-400">
                      <span>
                        Mã HĐ:{" "}
                        <span className="text-white font-mono">
                          #{request.HoaDon?.Code}
                        </span>
                      </span>
                      <span>
                        Email:{" "}
                        <span className="text-white">
                          {request.HoaDon?.Email}
                        </span>
                      </span>
                    </div>
                    <div className="p-3 bg-slate-800 rounded border border-slate-700 italic text-slate-300 mt-2">
                      &quot;{request.LyDoHoan || "Không có lý do"}&quot;
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-4 border-t border-slate-800 bg-[#151515] flex sm:justify-between items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => (mode === "VIEW" ? onClose() : setMode("VIEW"))}
            className="text-slate-400 hover:text-black"
            disabled={isSubmitting}
          >
            {mode === "VIEW" ? "Đóng" : "Quay lại"}
          </Button>

          {isPending && mode === "VIEW" && hasPermission("QLHOANVE") && (
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
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                `Xác nhận đã chuyển ${Number(request.SoTien).toLocaleString()}đ`
              )}
            </Button>
          )}

          {mode === "REJECT" && (
            <Button
              onClick={() => onReject(request, adminNote)}
              variant="destructive"
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Gửi từ chối"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
