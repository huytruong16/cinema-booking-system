"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

type TrangThaiCombo = "CONHANG" | "HETHANG";

// Interface dựa theo Table COMBO
interface Combo {
  MaCombo: number;
  TenCombo: string;
  MoTa: string | null;
  GiaTien: number;
  TrangThai: TrangThaiCombo;
  HinhAnh: string | null;
}

// --- DỮ LIỆU GIẢ (MOCK DATA) ---
const mockCombos: Combo[] = [
  {
    MaCombo: 1,
    TenCombo: "Combo Bắp Lớn + 2 Nước",
    MoTa: "1 bắp rang bơ vị mặn/ngọt lớn và 2 ly nước ngọt (L) tùy chọn (Coca, Pepsi, 7Up).",
    GiaTien: 125000,
    TrangThai: "CONHANG",
    HinhAnh: "https://cellphones.com.vn/sforum/wp-content/uploads/2023/07/gia-bap-nuoc-cgv-1.jpg"
  },
  {
    MaCombo: 2,
    TenCombo: "Combo Bắp Vừa + 1 Nước",
    MoTa: "1 bắp rang bơ vị mặn/ngọt vừa và 1 ly nước ngọt (M) tùy chọn.",
    GiaTien: 85000,
    TrangThai: "CONHANG",
    HinhAnh: "https://pbs.twimg.com/media/EQJTE-dUEAEZ2DA.jpg"
  },
  {
    MaCombo: 3,
    TenCombo: "Combo Couple (2 Bắp + 2 Nước)",
    MoTa: "2 bắp rang bơ vừa và 2 nước ngọt (M). Tiết kiệm hơn khi mua lẻ.",
    GiaTien: 150000,
    TrangThai: "HETHANG",
    HinhAnh: "https://tse3.mm.bing.net/th/id/OIP.itP1ZPjuhFbzBTSJ3pw5nAHaHa?cb=ucfimg2ucfimg=1&w=1200&h=1200&rs=1&pid=ImgDetMain&o=7&rm=3"
  },
   {
    MaCombo: 4,
    TenCombo: "Combo Bắp Lẻ",
    MoTa: "1 bắp rang bơ (M).",
    GiaTien: 55000,
    TrangThai: "CONHANG",
    HinhAnh: "https://tse1.mm.bing.net/th/id/OIP.3QZRYs1JBbpHc-AS4A0HugHaHa?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3"
  },
];

const trangThaiOptions: { value: TrangThaiCombo; label: string }[] = [
  { value: "CONHANG", label: "Còn hàng" },
  { value: "HETHANG", label: "Hết hàng" },
];
// --- HẾT DỮ LIỆU GIẢ ---

// Helper lấy màu badge
const getBadgeVariant = (trangThai: TrangThaiCombo) => {
    switch (trangThai) {
        case "CONHANG": return "bg-green-600 text-white";
        case "HETHANG": return "bg-slate-500 text-slate-200 border-slate-400";
        default: return "outline";
    }
};
const getBadgeLabel = (trangThai: TrangThaiCombo) => {
  return trangThaiOptions.find(o => o.value === trangThai)?.label || trangThai;
};

// --- COMPONENT CHÍNH ---
export default function ComboManagementPage() {
  const [combos, setCombos] = useState<Combo[]>(mockCombos);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);

  const filteredCombos = useMemo(() => {
    return combos.filter(combo => {
      const matchesSearch = combo.TenCombo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || combo.TrangThai === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [combos, searchTerm, statusFilter]);

  const handleAddNew = () => {
    setEditingCombo(null); 
    setIsModalOpen(true);
  };
  const handleEdit = (combo: Combo) => {
    setEditingCombo(combo); 
    setIsModalOpen(true);
  };

  const handleFormSubmit = (formData: Combo) => {
    if (editingCombo) {
        // Cập nhật
        setCombos(prev => prev.map(c => c.MaCombo === formData.MaCombo ? formData : c));
    } else {
        // Thêm mới
        const newCombo = { 
            ...formData, 
            MaCombo: Math.max(...combos.map(c => c.MaCombo)) + 1 
        };
        setCombos(prev => [newCombo, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (maCombo: number) => {
      setCombos(prev => prev.filter(c => c.MaCombo !== maCombo));
  };

  return (
    <div className="space-y-6 text-white">
      
      {/* Header và Filters */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold">Quản lý Combo</h1>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-auto md:max-w-sm">
            <Input
              placeholder="Tìm kiếm theo tên combo"
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
            Thêm combo mới
          </Button>
        </div>
      </div>

      {/* Grid Layout (Thay cho Table) */}
      <ScrollArea className="h-[calc(100vh-200px)] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCombos.map((combo) => (
            <ComboCard
                key={combo.MaCombo}
                combo={combo}
                onEdit={() => handleEdit(combo)}
                onDelete={() => handleDelete(combo.MaCombo)}
                getBadgeLabel={getBadgeLabel}
                getBadgeVariant={getBadgeVariant}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Modal Form */}
      {isModalOpen && (
        <ComboFormDialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          combo={editingCombo}
        />
      )}
    </div>
  );
}

// --- COMPONENT CON: CARD COMBO (MỚI) ---
interface ComboCardProps {
    combo: Combo; 
    onEdit: () => void;
    onDelete: () => void;
    getBadgeVariant: (trangThai: TrangThaiCombo) => string;
    getBadgeLabel: (trangThai: TrangThaiCombo) => string;
}

function ComboCard({ combo, onEdit, onDelete, getBadgeVariant, getBadgeLabel }: ComboCardProps) {
    return (
        <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg flex flex-col">
            <CardHeader className="pb-3">
                 <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
                    {combo.HinhAnh ? (
                        <Image src={combo.HinhAnh} alt={combo.TenCombo} fill className="object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <ShoppingCart className="size-16 text-slate-600" />
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-semibold text-slate-100 leading-snug">{combo.TenCombo}</CardTitle>
                    <Badge variant="outline" className={cn("text-xs flex-shrink-0", getBadgeVariant(combo.TrangThai))}>
                        {getBadgeLabel(combo.TrangThai)}
                    </Badge>
                </div>
                
                <p className="text-2xl font-bold text-primary">
                    {combo.GiaTien.toLocaleString('vi-VN')} ₫
                </p>

                <ScrollArea className="h-20 pr-3">
                    <p className="text-sm text-slate-400 leading-relaxed">
                        {combo.MoTa || "(Chưa có mô tả)"}
                    </p>
                </ScrollArea>
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
                        Hành động này không thể hoàn tác. Combo &quot;{combo.TenCombo}&quot; sẽ bị xóa vĩnh viễn.
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

// --- COMPONENT CON: DIALOG FORM (Giữ nguyên) ---
interface ComboFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Combo) => void;
    combo: Combo | null;
}

function ComboFormDialog({ isOpen, onClose, onSubmit, combo }: ComboFormDialogProps) {
    
    const [formData, setFormData] = useState<Omit<Combo, 'MaCombo'>>(
        combo || {
            TenCombo: "",
            MoTa: "",
            GiaTien: 50000,
            TrangThai: "CONHANG",
            HinhAnh: "",
        }
    );

    useEffect(() => {
        if (combo) {
            setFormData(combo);
        } else {
            setFormData({
                TenCombo: "",
                MoTa: "",
                GiaTien: 50000,
                TrangThai: "CONHANG",
                HinhAnh: "",
            });
        }
    }, [combo, isOpen]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };
    
    const handleSelectChange = (value: TrangThaiCombo) => {
         setFormData(prev => ({ ...prev, TrangThai: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const dataToSubmit: Combo = {
            MaCombo: combo?.MaCombo || 0,
            ...formData,
        };
        onSubmit(dataToSubmit);
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{combo ? "Cập nhật combo" : "Thêm combo mới"}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Nhập thông tin chi tiết cho combo.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <ScrollArea className="max-h-[70vh] pr-6">
                        <div className="space-y-4 py-4">
                            
                            <div className="space-y-2">
                                <Label htmlFor="TenCombo">Tên combo</Label>
                                <Input 
                                    id="TenCombo" 
                                    name="TenCombo" 
                                    value={formData.TenCombo} 
                                    onChange={handleChange} 
                                    className="bg-transparent border-slate-700" 
                                    required 
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="MoTa">Mô tả</Label>
                                <Textarea 
                                    id="MoTa" 
                                    name="MoTa" 
                                    value={formData.MoTa || ""} 
                                    onChange={handleChange} 
                                    className="bg-transparent border-slate-700" 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="GiaTien">Giá tiền (VNĐ)</Label>
                                    <Input 
                                        id="GiaTien" 
                                        name="GiaTien" 
                                        type="number" 
                                        value={formData.GiaTien} 
                                        onChange={handleChange} 
                                        className="bg-transparent border-slate-700" 
                                        required 
                                    />
                                </div>
                                
                                 <div className="space-y-2">
                                    <Label htmlFor="TrangThai">Trạng thái</Label>
                                    <Select 
                                        name="TrangThai" 
                                        value={formData.TrangThai} 
                                        onValueChange={handleSelectChange}
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
                            
                            <div className="space-y-2">
                                <Label htmlFor="HinhAnh">URL Hình ảnh</Label>
                                <Input 
                                    id="HinhAnh" 
                                    name="HinhAnh" 
                                    type="url"
                                    value={formData.HinhAnh || ""} 
                                    onChange={handleChange} 
                                    className="bg-transparent border-slate-700"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Xem trước</Label>
                                <div className="aspect-[2.5] w-full rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                                    {formData.HinhAnh ? (
                                        <Image src={formData.HinhAnh} alt="Preview" width={300} height={169} className="object-cover" />
                                    ) : (
                                        <p className="text-slate-500 text-sm">Chưa có ảnh</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </ScrollArea>
                    <DialogFooter className="!mt-6 pt-6 border-t border-slate-700">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="bg-transparent border-slate-700 hover:bg-slate-800">Hủy</Button>
                        </DialogClose>
                        <Button type="submit">{combo ? "Cập nhật" : "Lưu"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}