/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, ShoppingCart, Upload, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { comboService, Combo } from '@/services/combo.service';

type TrangThaiCombo = "CONHANG" | "HETHANG";

const trangThaiOptions: { value: TrangThaiCombo; label: string }[] = [
  { value: "CONHANG", label: "Còn hàng" },
  { value: "HETHANG", label: "Hết hàng" },
];

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

export default function ComboManagementPage() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);

  const fetchCombos = async () => {
    try {
      setIsLoading(true);
      const data = await comboService.getAll();
      setCombos(data);
    } catch (error) {
      console.error("Lỗi tải combo:", error);
      toast.error("Không thể tải danh sách combo");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, []);

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

  const handleFormSubmit = async (formData: FormData) => {
    try {
        if (editingCombo) {
            await comboService.update(editingCombo.MaCombo, formData);
            toast.success("Cập nhật combo thành công!");
        } else {
            await comboService.create(formData);
            toast.success("Tạo combo mới thành công!");
        }
        setIsModalOpen(false);
        fetchCombos(); 
    } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (maCombo: string) => {
      try {
          await comboService.delete(maCombo);
          toast.success("Đã xóa combo");
          fetchCombos();
      } catch (error) {
          toast.error("Xóa thất bại");
      }
  };

  return (
    <div className="space-y-6 text-white">
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

      <ScrollArea className="h-[calc(100vh-200px)] pr-4">
        {isLoading ? (
            <div className="text-center text-slate-400 py-10">Đang tải dữ liệu...</div>
        ) : (
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
        )}
      </ScrollArea>

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

// --- COMPONENT CON: CARD COMBO ---
interface ComboCardProps {
    combo: Combo; 
    onEdit: () => void;
    onDelete: () => void;
    getBadgeVariant: (trangThai: TrangThaiCombo) => string;
    getBadgeLabel: (trangThai: TrangThaiCombo) => string;
}

function ComboCard({ combo, onEdit, onDelete, getBadgeVariant, getBadgeLabel }: ComboCardProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg flex flex-col">
            <CardHeader className="pb-3">
                 <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
                    {combo.HinhAnh && !imageError ? (
                        <Image 
                            src={combo.HinhAnh} 
                            alt={combo.TenCombo} 
                            fill 
                            className="object-cover"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <ImageOff className="size-12 mb-2 opacity-50" />
                            <span className="text-xs">Không có ảnh</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-semibold text-slate-100 leading-snug line-clamp-2">{combo.TenCombo}</CardTitle>
                    <Badge variant="outline" className={cn("text-xs flex-shrink-0", getBadgeVariant(combo.TrangThai))}>
                        {getBadgeLabel(combo.TrangThai)}
                    </Badge>
                </div>
                
                <p className="text-2xl font-bold text-primary">
                    {Number(combo.GiaTien).toLocaleString('vi-VN')} ₫
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
                    Sửa
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

interface ComboFormState {
    TenCombo: string;
    MoTa: string;
    GiaTien: number | string;
    TrangThai: TrangThaiCombo;
}

// --- COMPONENT CON: DIALOG FORM ---
interface ComboFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => void;
    combo: Combo | null;
}

function ComboFormDialog({ isOpen, onClose, onSubmit, combo }: ComboFormDialogProps) {
    const [formData, setFormData] = useState<ComboFormState>({
        TenCombo: "",
        MoTa: "",
        GiaTien: 50000,
        TrangThai: "CONHANG",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (combo) {
            setFormData({
                TenCombo: combo.TenCombo,
                MoTa: combo.MoTa || "",
                GiaTien: Number(combo.GiaTien),
                TrangThai: combo.TrangThai,
            });
            setPreviewUrl(combo.HinhAnh);
        } else {
            setFormData({
                TenCombo: "",
                MoTa: "",
                GiaTien: 50000,
                TrangThai: "CONHANG",
            });
            setPreviewUrl(null);
        }
        setSelectedFile(null);
    }, [combo, isOpen]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === "" ? "" : Number(value)) : value,
        }));
    };

    // Xử lý chọn file ảnh
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };
    
    const handleSelectChange = (value: TrangThaiCombo) => {
         setFormData(prev => ({ ...prev, TrangThai: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 1. VALIDATION
        const errors = [];

        const priceRegex = /^[1-9]\d*$/;
        
        if (!formData.TenCombo.trim()) {
             errors.push("Tên combo không được để trống.");
        }

        if (formData.GiaTien === "" || !priceRegex.test(String(formData.GiaTien))) {
             errors.push("Giá tiền phải là số nguyên lớn hơn 0.");
        }

        if (!combo && !selectedFile) {
             errors.push("Vui lòng chọn hình ảnh cho combo mới.");
        }

        if (errors.length > 0) {
             errors.forEach(err => toast.error(err));
             return;
        }

        const data = new FormData();
        data.append('TenCombo', formData.TenCombo);
        data.append('MoTa', formData.MoTa);
        data.append('GiaTien', formData.GiaTien.toString());
        data.append('TrangThai', formData.TrangThai);
        
        if (selectedFile) {
            data.append('comboFile', selectedFile); 
        }

        onSubmit(data);
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
                                <Label htmlFor="TenCombo">Tên combo <span className="text-red-500">*</span></Label>
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
                                    value={formData.MoTa} 
                                    onChange={handleChange} 
                                    className="bg-transparent border-slate-700" 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="GiaTien">Giá tiền (VNĐ) <span className="text-red-500">*</span></Label>
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
                            
                            {/* Input File Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="HinhAnh">Hình ảnh {!combo && <span className="text-red-500">*</span>}</Label>
                                <div className="flex gap-4 items-start">
                                    <div className="flex-1">
                                         <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-8 h-8 mb-3 text-slate-400" />
                                                <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Nhấn để tải lên</span></p>
                                                <p className="text-xs text-slate-500">SVG, PNG, JPG or WEBP</p>
                                            </div>
                                            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                        </label>
                                    </div>
                                    {/* Preview */}
                                    <div className="w-32 h-32 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 relative">
                                        {previewUrl ? (
                                            <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                        ) : (
                                            <span className="text-xs text-slate-500">Preview</span>
                                        )}
                                    </div>
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