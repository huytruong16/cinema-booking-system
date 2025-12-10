"use client";

import React, { useState, useMemo } from 'react';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// --- INTERFACES & MOCK DATA ---

interface Movie { id: string; name: string; }
interface Format { id: string; name: string; }
interface Language { id: string; name: string; }

interface MovieVersion {
  id: string; // MaPhienBanPhim
  movieId: string;
  formatId: string;
  languageId: string;
  price: number; // GiaVe
  // Các trường mở rộng để hiển thị (khi join bảng)
  movieName?: string;
  formatName?: string;
  languageName?: string;
}

const mockMovies: Movie[] = [
    { id: "m1", name: "Inside Out 2" },
    { id: "m2", name: "Deadpool & Wolverine" },
    { id: "m3", name: "Kẻ Trộm Mặt Trăng 4" },
];

const mockFormats: Format[] = [
    { id: "f1", name: "2D" },
    { id: "f2", name: "3D" },
    { id: "f3", name: "IMAX" },
];

const mockLanguages: Language[] = [
    { id: "l1", name: "Lồng tiếng" },
    { id: "l2", name: "Phụ đề" },
    { id: "l3", name: "Gốc" },
];

// Dữ liệu mẫu phiên bản phim
const mockVersions: MovieVersion[] = [
    { id: "v1", movieId: "m1", formatId: "f1", languageId: "l1", price: 90000, movieName: "Inside Out 2", formatName: "2D", languageName: "Lồng tiếng" },
    { id: "v2", movieId: "m1", formatId: "f1", languageId: "l2", price: 90000, movieName: "Inside Out 2", formatName: "2D", languageName: "Phụ đề" },
    { id: "v3", movieId: "m2", formatId: "f3", languageId: "l2", price: 150000, movieName: "Deadpool & Wolverine", formatName: "IMAX", languageName: "Phụ đề" },
];

export default function MovieVersionManagementPage() {
  const [versions, setVersions] = useState<MovieVersion[]>(mockVersions);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MovieVersion | null>(null);

  // Filter tìm kiếm theo tên phim
  const filteredVersions = useMemo(() => {
    return versions.filter(v => 
        v.movieName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.formatName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [versions, searchTerm]);

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: MovieVersion) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
      if(confirm("Bạn có chắc chắn muốn xóa phiên bản này?")) {
          setVersions(prev => prev.filter(v => v.id !== id));
          toast.success("Đã xóa thành công");
      }
  };

  const handleSave = (data: MovieVersion) => {
      // Giả lập logic lấy tên từ ID để hiển thị
      const movieName = mockMovies.find(m => m.id === data.movieId)?.name;
      const formatName = mockFormats.find(f => f.id === data.formatId)?.name;
      const languageName = mockLanguages.find(l => l.id === data.languageId)?.name;

      const newData = { ...data, movieName, formatName, languageName };

      if (editingItem) {
          setVersions(prev => prev.map(v => v.id === data.id ? newData : v));
          toast.success("Cập nhật thành công");
      } else {
          setVersions(prev => [...prev, { ...newData, id: Math.random().toString(36).substr(2, 9) }]);
          toast.success("Tạo mới thành công");
      }
      setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 text-white h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="size-6 text-primary" />
            Quản lý Phiên bản Phim
        </h1>
        <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
            <Plus className="size-4 mr-2" /> Thêm phiên bản
        </Button>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="relative w-full max-w-sm shrink-0">
        <Input 
            placeholder="Tìm theo tên phim..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="pl-10 bg-[#1C1C1C] border-slate-700" 
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
      </div>

      {/* Bảng dữ liệu */}
      <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
                <Table>
                    <TableHeader className="sticky top-0 bg-[#1C1C1C] z-10 shadow-sm">
                        <TableRow className="border-slate-700 hover:bg-transparent">
                            <TableHead className="text-slate-100">Phim</TableHead>
                            <TableHead className="text-slate-100">Định dạng</TableHead>
                            <TableHead className="text-slate-100">Ngôn ngữ</TableHead>
                            <TableHead className="text-slate-100">Giá vé cơ bản</TableHead>
                            <TableHead className="text-right text-slate-100">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredVersions.length > 0 ? filteredVersions.map((version) => (
                            <TableRow key={version.id} className="border-slate-800 hover:bg-slate-800/50">
                                <TableCell className="font-medium text-md">{version.movieName}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 border-blue-800">
                                        {version.formatName}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-slate-300 border-slate-600">
                                        {version.languageName}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-bold text-green-400">
                                    {version.price.toLocaleString('vi-VN')} ₫
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(version)} className="hover:bg-slate-700">
                                            <Edit className="size-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(version.id)} className="text-red-500 hover:text-red-400 hover:bg-red-900/20">
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                    Không có dữ liệu
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
      </Card>

      {isModalOpen && (
        <VersionFormDialog 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSubmit={handleSave} 
            initialData={editingItem}
        />
      )}
    </div>
  );
}

// --- FORM DIALOG COMPONENT ---

function VersionFormDialog({ isOpen, onClose, onSubmit, initialData }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSubmit: (data: MovieVersion) => void; 
    initialData: MovieVersion | null 
}) {
    const [formData, setFormData] = useState<MovieVersion>(initialData || {
        id: "",
        movieId: "",
        formatId: "",
        languageId: "",
        price: 0
    });

    const handleChange = (name: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-w-lg shadow-2xl">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-xl font-bold leading-none">
                        {initialData ? "Cập nhật phiên bản" : "Tạo phiên bản mới"}
                    </DialogTitle>
                    <p className="text-sm text-slate-400">
                        Thiết lập thông số cho phiên bản chiếu (Định dạng & Ngôn ngữ).
                    </p>
                </DialogHeader>
                
                <div className="grid gap-5 py-4">
                    {/* Chọn Phim */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-300">
                            Phim áp dụng <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formData.movieId} onValueChange={(v) => handleChange("movieId", v)}>
                            <SelectTrigger className="bg-slate-900/50 border-slate-700 hover:bg-slate-900 transition-colors focus:ring-1 focus:ring-primary h-11">
                                <SelectValue placeholder="Chọn phim..." />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1C1C1C] border-slate-700 text-white max-h-[300px]">
                                {mockMovies.map(m => (
                                    <SelectItem key={m.id} value={m.id} className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800">
                                        {m.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        {/* Chọn Định dạng */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-300">Định dạng</Label>
                            <Select value={formData.formatId} onValueChange={(v) => handleChange("formatId", v)}>
                                <SelectTrigger className="bg-slate-900/50 border-slate-700 hover:bg-slate-900 focus:ring-1 focus:ring-primary">
                                    <SelectValue placeholder="VD: 2D, IMAX" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1C1C1C] border-slate-700 text-white">
                                    {mockFormats.map(f => (
                                        <SelectItem key={f.id} value={f.id} className="cursor-pointer focus:bg-slate-800">
                                            {f.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Chọn Ngôn ngữ */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-300">Ngôn ngữ</Label>
                            <Select value={formData.languageId} onValueChange={(v) => handleChange("languageId", v)}>
                                <SelectTrigger className="bg-slate-900/50 border-slate-700 hover:bg-slate-900 focus:ring-1 focus:ring-primary">
                                    <SelectValue placeholder="VD: Lồng tiếng" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1C1C1C] border-slate-700 text-white">
                                    {mockLanguages.map(l => (
                                        <SelectItem key={l.id} value={l.id} className="cursor-pointer focus:bg-slate-800">
                                            {l.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Nhập Giá vé */}
                    <div className="space-y-2 pt-1">
                        <Label className="text-sm font-medium text-slate-300">Giá vé cơ bản</Label>
                        <div className="relative">
                            <Input 
                                type="number" 
                                value={formData.price} 
                                onChange={(e) => handleChange("price", Number(e.target.value))} 
                                className="bg-slate-900/50 border-slate-700 hover:bg-slate-900 focus:ring-1 focus:ring-primary pr-12 text-right font-medium text-green-400 text-lg h-11" 
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="text-slate-500 text-sm font-bold">VNĐ</span>
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-500 italic">
                            * Giá gốc áp dụng cho ghế thường, chưa bao gồm phụ thu ghế VIP/Đôi.
                        </p>
                    </div>
                </div>

                <DialogFooter className="pt-2">
                    <DialogClose asChild>
                        <Button variant="outline" className="bg-transparent border-slate-700 hover:bg-slate-800 hover:text-white">
                            Hủy bỏ
                        </Button>
                    </DialogClose>
                    <Button onClick={() => onSubmit(formData)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6">
                        {initialData ? "Lưu thay đổi" : "Tạo phiên bản"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}