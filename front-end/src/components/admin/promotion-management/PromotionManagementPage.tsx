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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, CalendarIcon, TicketPercent, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from "date-fns";
import { vi } from "date-fns/locale";

type TrangThaiKhuyenMai = "CONHOATDONG" | "KHONGCONHOATDONG";
type LoaiGiamGia = "CODINH" | "PHANTRAM";

interface KhuyenMai {
  MaKhuyenMai: number;
  TenKhuyenMai: string;
  MoTa: string | null;
  Code: string;
  LoaiGiamGia: LoaiGiamGia;
  GiaTri: number;
  NgayBatDau: Date;
  NgayKetThuc: Date;
  SoLuongMa: number | null; 
  GiaTriDonToiThieu: number | null;
  GiaTriGiamToiDa: number | null;
  TrangThai: TrangThaiKhuyenMai;
}

// --- DỮ LIỆU GIẢ (MOCK DATA) ---
const mockPromotions: KhuyenMai[] = [
  {
    MaKhuyenMai: 1,
    TenKhuyenMai: "Giảm 20% cho thành viên mới",
    MoTa: "Giảm 20% tổng giá trị hóa đơn cho khách hàng đăng ký mới.",
    Code: "HELLOMOVIX",
    LoaiGiamGia: "PHANTRAM",
    GiaTri: 20, // 20%
    NgayBatDau: new Date("2025-11-01"),
    NgayKetThuc: new Date("2025-11-30"),
    SoLuongMa: 1000,
    GiaTriDonToiThieu: 0,
    GiaTriGiamToiDa: 50000,
    TrangThai: "CONHOATDONG",
  },
  {
    MaKhuyenMai: 2,
    TenKhuyenMai: "Giảm 50K (Thứ 4 Vui Vẻ)",
    MoTa: "Giảm ngay 50.000 ₫ cho hóa đơn bất kỳ vào ngày Thứ 4 hàng tuần.",
    Code: "WEDNESDAY50",
    LoaiGiamGia: "CODINH",
    GiaTri: 50000, // 50.000 ₫
    NgayBatDau: new Date("2025-10-01"),
    NgayKetThuc: new Date("2025-12-31"),
    SoLuongMa: null, // Không giới hạn
    GiaTriDonToiThieu: 100000,
    GiaTriGiamToiDa: 50000,
    TrangThai: "CONHOATDONG",
  },
    {
    MaKhuyenMai: 3,
    TenKhuyenMai: "Đồng giá vé 45K (Đã hết hạn)",
    MoTa: "Chương trình đồng giá vé 45K cho sinh viên.",
    Code: "STUDENT45",
    LoaiGiamGia: "CODINH",
    GiaTri: 45000, // (Logic phức tạp hơn, nhưng tạm để 45k)
    NgayBatDau: new Date("2024-09-01"),
    NgayKetThuc: new Date("2024-10-30"),
    SoLuongMa: 500,
    GiaTriDonToiThieu: 0,
    GiaTriGiamToiDa: null,
    TrangThai: "KHONGCONHOATDONG",
  },
];

const trangThaiOptions: { value: TrangThaiKhuyenMai; label: string }[] = [
  { value: "CONHOATDONG", label: "Còn hoạt động" },
  { value: "KHONGCONHOATDONG", label: "Không còn hoạt động" },
];

const loaiGiamGiaOptions: { value: LoaiGiamGia; label: string }[] = [
    { value: "PHANTRAM", label: "Phần trăm (%)" },
    { value: "CODINH", label: "Số tiền cố định (₫)" },
];
// --- HẾT DỮ LIỆU GIẢ ---

// Helper lấy màu badge
const getBadgeVariant = (trangThai: TrangThaiKhuyenMai) => {
    switch (trangThai) {
        case "CONHOATDONG": return "bg-green-600 text-white";
        case "KHONGCONHOATDONG": return "bg-slate-500 text-slate-200 border-slate-400";
        default: return "outline";
    }
};
const getBadgeLabel = (trangThai: TrangThaiKhuyenMai) => {
  return trangThaiOptions.find(o => o.value === trangThai)?.label || trangThai;
};

// --- COMPONENT CHÍNH ---
export default function PromotionManagementPage() {
  const [promotions, setPromotions] = useState<KhuyenMai[]>(mockPromotions);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<KhuyenMai | null>(null);

  const filteredPromotions = useMemo(() => {
    return promotions.filter(promo => {
      const matchesSearch = promo.TenKhuyenMai.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            promo.Code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || promo.TrangThai === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [promotions, searchTerm, statusFilter]);

  const handleAddNew = () => {
    setEditingPromotion(null); 
    setIsModalOpen(true);
  };
  const handleEdit = (promo: KhuyenMai) => {
    setEditingPromotion(promo); 
    setIsModalOpen(true);
  };

  const handleFormSubmit = (formData: KhuyenMai) => {
    if (editingPromotion) {
        setPromotions(prev => prev.map(p => p.MaKhuyenMai === formData.MaKhuyenMai ? formData : p));
    } else {
        const newPromo = { 
            ...formData, 
            MaKhuyenMai: Math.max(...promotions.map(p => p.MaKhuyenMai)) + 1 
        };
        setPromotions(prev => [newPromo, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (maKhuyenMai: number) => {
      setPromotions(prev => prev.filter(p => p.MaKhuyenMai !== maKhuyenMai));
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold">Quản lý Khuyến mãi</h1>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-auto md:max-w-sm">
            <Input
              placeholder="Tìm theo Tên hoặc Code..."
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
            Thêm khuyến mãi
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPromotions.map((promo) => (
            <PromotionCard
                key={promo.MaKhuyenMai}
                promotion={promo}
                onEdit={() => handleEdit(promo)}
                onDelete={() => handleDelete(promo.MaKhuyenMai)}
                getBadgeLabel={getBadgeLabel}
                getBadgeVariant={getBadgeVariant}
            />
          ))}
        </div>
      </ScrollArea>

      {isModalOpen && (
        <PromotionFormDialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          promotion={editingPromotion}
        />
      )}
    </div>
  );
}

interface PromotionCardProps {
    promotion: KhuyenMai; 
    onEdit: () => void;
    onDelete: () => void;
    getBadgeVariant: (trangThai: TrangThaiKhuyenMai) => string;
    getBadgeLabel: (trangThai: TrangThaiKhuyenMai) => string;
}

function PromotionCard({ promotion, onEdit, onDelete, getBadgeVariant, getBadgeLabel }: PromotionCardProps) {
    
    const displayValue = useMemo(() => {
        if (promotion.LoaiGiamGia === 'PHANTRAM') {
            return `GIẢM ${promotion.GiaTri}%`;
        }
        return `GIẢM ${promotion.GiaTri.toLocaleString('vi-VN')} ₫`;
    }, [promotion.LoaiGiamGia, promotion.GiaTri]);

    const conditions = useMemo(() => {
        const parts = [];
        if (promotion.GiaTriDonToiThieu && promotion.GiaTriDonToiThieu > 0) {
            parts.push(`Đơn tối thiểu ${promotion.GiaTriDonToiThieu.toLocaleString('vi-VN')} ₫`);
        }
        if (promotion.LoaiGiamGia === 'PHANTRAM' && promotion.GiaTriGiamToiDa) {
            parts.push(`Giảm tối đa ${promotion.GiaTriGiamToiDa.toLocaleString('vi-VN')} ₫`);
        }
        if (promotion.SoLuongMa) {
            parts.push(`Còn ${promotion.SoLuongMa} lượt`);
        }
        return parts.join(' | ');
    }, [promotion]);

    return (
        <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg flex flex-col">
            <CardHeader className="pb-3">
                 <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-semibold text-slate-100 leading-snug">{promotion.TenKhuyenMai}</CardTitle>
                    <Badge variant="outline" className={cn("text-xs flex-shrink-0", getBadgeVariant(promotion.TrangThai))}>
                        {getBadgeLabel(promotion.TrangThai)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
                <div className="bg-primary/10 border-2 border-dashed border-primary/50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-primary">{displayValue}</p>
                    <p className="text-sm font-semibold text-slate-300 mt-1">Mã: 
                        <span className="ml-1.5 bg-slate-700 text-slate-100 px-2 py-0.5 rounded-md font-mono">{promotion.Code}</span>
                    </p>
                </div>
                
                <div className="space-y-1">
                    <p className="text-sm text-slate-300">
                        Hiệu lực: {format(promotion.NgayBatDau, "dd/MM/yy")} - {format(promotion.NgayKetThuc, "dd/MM/yy")}
                    </p>
                    <p className="text-xs text-slate-400">
                        {conditions || "Áp dụng cho tất cả hóa đơn."}
                    </p>
                </div>

            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2 !pt-4 border-t border-slate-800">
                <Button variant="outline" className="w-full bg-transparent border-slate-700 hover:bg-slate-800" onClick={onEdit}>
                    <Edit className="size-4 mr-2" />
                    Chỉnh sửa
                </Button>
                
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full bg-transparent border-slate-700 text-red-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50">
                            <Trash2 className="size-4 mr-2" />
                            Xóa
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#1C1C1C] border-slate-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                        Hành động này không thể hoàn tác. Khuyến mãi &quot;{promotion.TenKhuyenMai}&quot; sẽ bị xóa vĩnh viễn.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-slate-700 hover:bg-slate-800">Hủy</AlertDialogCancel>
                        <AlertDialogAction 
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={onDelete}
                        >
                        Xác nhận Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    );
}

interface PromotionFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: KhuyenMai) => void;
    promotion: KhuyenMai | null;
}

function PromotionFormDialog({ isOpen, onClose, onSubmit, promotion }: PromotionFormDialogProps) {
    
    const [formData, setFormData] = useState<Omit<KhuyenMai, 'MaKhuyenMai'>>(
        promotion || {
            TenKhuyenMai: "",
            MoTa: "",
            Code: "",
            LoaiGiamGia: "PHANTRAM",
            GiaTri: 10,
            NgayBatDau: new Date(),
            NgayKetThuc: new Date(),
            SoLuongMa: 1000,
            GiaTriDonToiThieu: 0,
            GiaTriGiamToiDa: 50000,
            TrangThai: "CONHOATDONG",
        }
    );

    useEffect(() => {
        if (promotion) {
            setFormData(promotion);
        } else {
            setFormData({
                TenKhuyenMai: "",
                MoTa: "",
                Code: "",
                LoaiGiamGia: "PHANTRAM",
                GiaTri: 10,
                NgayBatDau: new Date(),
                NgayKetThuc: new Date(),
                SoLuongMa: 1000,
                GiaTriDonToiThieu: 0,
                GiaTriGiamToiDa: 50000,
                TrangThai: "CONHOATDONG",
            });
        }
    }, [promotion, isOpen]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === "" ? null : Number(value)) : value, // Cho phép null
        }));
    };
    
    const handleSelectChange = (name: 'LoaiGiamGia' | 'TrangThai', value: string) => {
         setFormData(prev => ({ ...prev, [name]: value }));
    };

     const handleDateChange = (name: string, date: Date | undefined) => {
        if (date) {
            setFormData(prev => ({ ...prev, [name]: date }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const dataToSubmit: KhuyenMai = {
            MaKhuyenMai: promotion?.MaKhuyenMai || 0,
            ...formData,
            GiaTri: formData.GiaTri || 0,
            NgayBatDau: formData.NgayBatDau || new Date(),
            NgayKetThuc: formData.NgayKetThuc || new Date(),
        };
        onSubmit(dataToSubmit);
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{promotion ? "Cập nhật khuyến mãi" : "Tạo khuyến mãi mới"}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Điền đầy đủ các thông tin và điều kiện áp dụng cho mã khuyến mãi.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <ScrollArea className="max-h-[70vh] pr-6">
                        <div className="space-y-4 py-4">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="TenKhuyenMai">Tên chương trình</Label>
                                    <Input id="TenKhuyenMai" name="TenKhuyenMai" value={formData.TenKhuyenMai} onChange={handleChange} className="bg-transparent border-slate-700" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="Code">Mã khuyến mãi (Code)</Label>
                                    <Input id="Code" name="Code" value={formData.Code} onChange={handleChange} className="bg-transparent border-slate-700 font-mono" required />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="MoTa">Mô tả chi tiết</Label>
                                <Textarea id="MoTa" name="MoTa" value={formData.MoTa || ""} onChange={handleChange} className="bg-transparent border-slate-700" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="LoaiGiamGia">Loại giảm giá</Label>
                                    <Select name="LoaiGiamGia" value={formData.LoaiGiamGia} onValueChange={(v: LoaiGiamGia) => handleSelectChange('LoaiGiamGia', v)}>
                                        <SelectTrigger className="w-full bg-transparent border-slate-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1C1C1C] text-slate-100 border-slate-700">
                                            {loaiGiamGiaOptions.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value} className="cursor-pointer focus:bg-slate-700">
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="GiaTri">
                                        Giá trị ({formData.LoaiGiamGia === 'PHANTRAM' ? '%' : 'VNĐ'})
                                    </Label>
                                    <Input id="GiaTri" name="GiaTri" type="number" value={formData.GiaTri || 0} onChange={handleChange} className="bg-transparent border-slate-700" required />
                                </div>
                                {formData.LoaiGiamGia === 'PHANTRAM' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="GiaTriGiamToiDa">Giảm tối đa (VNĐ)</Label>
                                        <Input id="GiaTriGiamToiDa" name="GiaTriGiamToiDa" type="number" value={formData.GiaTriGiamToiDa || 0} onChange={handleChange} className="bg-transparent border-slate-700" />
                                    </div>
                                )}
                            </div>
                            
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="GiaTriDonToiThieu">Đơn tối thiểu (VNĐ)</Label>
                                    <Input id="GiaTriDonToiThieu" name="GiaTriDonToiThieu" type="number" value={formData.GiaTriDonToiThieu || 0} onChange={handleChange} className="bg-transparent border-slate-700" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="SoLuongMa">Số lượng mã (Bỏ trống = không giới hạn)</Label>
                                    <Input id="SoLuongMa" name="SoLuongMa" type="number" value={formData.SoLuongMa || ""} onChange={handleChange} className="bg-transparent border-slate-700" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Ngày bắt đầu</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal bg-transparent border-slate-700 hover:bg-slate-800 hover:text-white", !formData.NgayBatDau && "text-slate-400")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.NgayBatDau ? format(formData.NgayBatDau, "PPP", { locale: vi }) : <span>Chọn ngày</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-slate-700 text-white">
                                            <Calendar mode="single" selected={formData.NgayBatDau} onSelect={(date) => handleDateChange("NgayBatDau", date)} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>Ngày kết thúc</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal bg-transparent border-slate-700 hover:bg-slate-800 hover:text-white", !formData.NgayKetThuc && "text-slate-400")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.NgayKetThuc ? format(formData.NgayKetThuc, "PPP", { locale: vi }) : <span>Chọn ngày</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-slate-700 text-white">
                                            <Calendar mode="single" selected={formData.NgayKetThuc} onSelect={(date) => handleDateChange("NgayKetThuc", date)} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="TrangThai">Trạng thái</Label>
                                <Select name="TrangThai" value={formData.TrangThai} onValueChange={(v: TrangThaiKhuyenMai) => handleSelectChange('TrangThai', v)}>
                                    <SelectTrigger className="w-full bg-transparent border-slate-700">
                                        <SelectValue />
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
                    </ScrollArea>
                    <DialogFooter className="!mt-6 pt-6 border-t border-slate-700">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="bg-transparent border-slate-700 hover:bg-slate-800">Hủy</Button>
                        </DialogClose>
                        <Button type="submit">{promotion ? "Cập nhật" : "Lưu"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}