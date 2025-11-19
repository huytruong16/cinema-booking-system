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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, Edit, Trash2, CalendarIcon, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from "date-fns";
import { vi } from "date-fns/locale";

type TrangThaiNhanVien = "CONLAM" | "DANGHI";
type TrangThaiNguoiDung = "CHUAKICHHOAT" | "CONHOATDONG" | "KHONGHOATDONG";

interface NhomNguoiDung {
  MaNhomNguoiDung: number;
  TenNhomNguoiDung: string;
}

interface NhanVienView {
  MaNhanVien: number;
  TenNhanVien: string; 
  NgayVaoLam: Date;     
  TrangThai: TrangThaiNhanVien; 
  
  MaNguoiDung: number;  
  TenTaiKhoan: string; 
  Email: string;        
  SoDienThoai: string | null; 
  TrangThaiTaiKhoan: TrangThaiNguoiDung; 

  MaNhomNguoiDung: number; 
  TenNhomNguoiDung: string; 
  
  AvatarUrl: string | null; 
}

// --- DỮ LIỆU GIẢ (MOCK DATA) ---
const mockNhomNguoiDung: NhomNguoiDung[] = [
  { MaNhomNguoiDung: 1, TenNhomNguoiDung: "Ban Quản lý (Admin)" },
  { MaNhomNguoiDung: 2, TenNhomNguoiDung: "NV Quản lý Phim & Lịch chiếu" },
  { MaNhomNguoiDung: 3, TenNhomNguoiDung: "NV Bán vé" },
  { MaNhomNguoiDung: 4, TenNhomNguoiDung: "NV Soát vé" },
];

const mockUsers: NhanVienView[] = [
  {
    MaNhanVien: 1, TenNhanVien: "Nguyễn Văn Admin", NgayVaoLam: new Date("2023-01-15"), TrangThai: "CONLAM",
    MaNguoiDung: 101, TenTaiKhoan: "admin", Email: "admin@movix.com", SoDienThoai: "0901234567", TrangThaiTaiKhoan: "CONHOATDONG",
    MaNhomNguoiDung: 1, TenNhomNguoiDung: "Ban Quản lý (Admin)", AvatarUrl: "https://i.pravatar.cc/150?img=1"
  },
  {
    MaNhanVien: 2, TenNhanVien: "Trần Thị Bán Vé", NgayVaoLam: new Date("2024-03-01"), TrangThai: "CONLAM",
    MaNguoiDung: 102, TenTaiKhoan: "banve_tran", Email: "tran.thi@movix.com", SoDienThoai: "0901112223", TrangThaiTaiKhoan: "CONHOATDONG",
    MaNhomNguoiDung: 3, TenNhomNguoiDung: "NV Bán vé", AvatarUrl: "https://i.pravatar.cc/150?img=2"
  },
  {
    MaNhanVien: 3, TenNhanVien: "Lê Văn Soát Vé", NgayVaoLam: new Date("2024-03-01"), TrangThai: "CONLAM",
    MaNguoiDung: 103, TenTaiKhoan: "soatve_le", Email: "le.van@movix.com", SoDienThoai: "0903334445", TrangThaiTaiKhoan: "CONHOATDONG",
    MaNhomNguoiDung: 4, TenNhomNguoiDung: "NV Soát vé", AvatarUrl: "https://i.pravatar.cc/150?img=3"
  },
    {
    MaNhanVien: 4, TenNhanVien: "Phạm Thị Quản Lý Phim", NgayVaoLam: new Date("2023-06-10"), TrangThai: "CONLAM",
    MaNguoiDung: 104, TenTaiKhoan: "manager_pham", Email: "pham.thi@movix.com", SoDienThoai: "0905556667", TrangThaiTaiKhoan: "CONHOATDONG",
    MaNhomNguoiDung: 2, TenNhomNguoiDung: "NV Quản lý Phim & Lịch chiếu", AvatarUrl: "https://i.pravatar.cc/150?img=4"
  },
  {
    MaNhanVien: 5, TenNhanVien: "Hoàng Văn Cũ", NgayVaoLam: new Date("2023-02-01"), TrangThai: "DANGHI",
    MaNguoiDung: 105, TenTaiKhoan: "cu_hoang", Email: "hoang.van@movix.com", SoDienThoai: "0907778889", TrangThaiTaiKhoan: "KHONGHOATDONG",
    MaNhomNguoiDung: 3, TenNhomNguoiDung: "NV Bán vé", AvatarUrl: "https://i.pravatar.cc/150?img=5"
  },
];

const trangThaiOptions: { value: TrangThaiNhanVien; label: string }[] = [
  { value: "CONLAM", label: "Còn làm" },
  { value: "DANGHI", label: "Đã nghỉ" },
];
// --- HẾT DỮ LIỆU GIẢ ---

export default function UserManagementPage() {
  const [users, setUsers] = useState<NhanVienView[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all"); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<NhanVienView | null>(null);
  
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<NhanVienView | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.TenNhanVien.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.Email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || user.TrangThai === statusFilter;
      const matchesRole = roleFilter === "all" || user.MaNhomNguoiDung === Number(roleFilter);
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  const handleAddNew = () => {
    setEditingUser(null); 
    setIsModalOpen(true);
  };
  const handleEdit = (user: NhanVienView) => {
    setEditingUser(user); 
    setIsModalOpen(true);
  };

  const handleFormSubmit = (formData: NhanVienView) => {
    if (editingUser) {
        setUsers(prev => prev.map(u => u.MaNhanVien === formData.MaNhanVien ? formData : u));
        if (selectedUserForDetail?.MaNhanVien === formData.MaNhanVien) {
            setSelectedUserForDetail(formData);
        }
    } else {
        const newId = Math.max(...users.map(u => u.MaNhanVien)) + 1;
        const newUser = { 
            ...formData, 
            MaNhanVien: newId,
            MaNguoiDung: newId + 100,
        };
        setUsers(prev => [newUser, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (maNhanVien: number) => {
      setUsers(prev => prev.filter(u => u.MaNhanVien !== maNhanVien));
      if (selectedUserForDetail?.MaNhanVien === maNhanVien) {
          setSelectedUserForDetail(null);
      }
  };

  const getBadgeVariant = (trangThai: TrangThaiNhanVien) => {
      switch (trangThai) {
          case "CONLAM": return "bg-green-600 text-white";
          case "DANGHI": return "bg-slate-500 text-slate-200 border-slate-400";
          default: return "outline";
      }
  };
   const getBadgeLabel = (trangThai: TrangThaiNhanVien) => {
    return trangThaiOptions.find(o => o.value === trangThai)?.label || trangThai;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-white">
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quản lý Nhân viên</h1>
          <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
            <Plus className="size-4 mr-2" />
            Thêm nhân viên
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:flex-1">
            <Input
              placeholder="Tìm theo Tên hoặc Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-transparent border-slate-700"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          </div>
          {/* Filter Chức vụ */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-[200px] bg-transparent border-slate-700">
              <SelectValue placeholder="Lọc theo chức vụ" />
            </SelectTrigger>
            <SelectContent className="bg-[#1C1C1C] text-slate-100 border-slate-700">
              <SelectItem value="all" className="cursor-pointer focus:bg-slate-700">Tất cả chức vụ</SelectItem>
              {mockNhomNguoiDung.map(role => (
                  <SelectItem key={role.MaNhomNguoiDung} value={role.MaNhomNguoiDung.toString()} className="cursor-pointer focus:bg-slate-700">
                      {role.TenNhomNguoiDung}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Filter Trạng thái */}
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
        </div>

        {/* Bảng dữ liệu */}
        <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-100">Nhân viên</TableHead>
                  <TableHead className="text-slate-100">Chức vụ</TableHead>
                  <TableHead className="text-slate-100">Trạng thái</TableHead>
                  <TableHead className="text-right text-slate-100">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow 
                    key={user.MaNhanVien} 
                    className={cn(
                        "border-slate-800 cursor-pointer",
                        selectedUserForDetail?.MaNhanVien === user.MaNhanVien && "bg-slate-800/50"
                    )}
                    onClick={() => setSelectedUserForDetail(user)}
                  >
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            <Avatar className="size-9">
                                <AvatarImage src={user.AvatarUrl || ""} alt={user.TenNhanVien} />
                                <AvatarFallback>{user.TenNhanVien.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium">{user.TenNhanVien}</div>
                                <div className="text-xs text-slate-400">{user.Email}</div>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>{user.TenNhomNguoiDung}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", getBadgeVariant(user.TrangThai))}>
                          {getBadgeLabel(user.TrangThai)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(user); }}>
                          <Edit className="size-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-500 hover:bg-red-500/10" onClick={(e) => e.stopPropagation()}>
                              <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#1C1C1C] border-slate-800 text-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                              Hành động này không thể hoàn tác. Nhân viên &quot;{user.TenNhanVien}&quot; sẽ bị xóa vĩnh viễn.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-transparent border-slate-700 hover:bg-slate-800">Hủy</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={(e) => { e.stopPropagation(); handleDelete(user.MaNhanVien); }}
                            >
                              Xác nhận Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Cột phải: Panel chi tiết */}
      <div className="lg:col-span-1">
        {selectedUserForDetail ? (
            <UserDetailPanel 
                user={selectedUserForDetail} 
                onClose={() => setSelectedUserForDetail(null)}
                onEdit={() => handleEdit(selectedUserForDetail)}
                getBadgeVariant={getBadgeVariant}
                getBadgeLabel={getBadgeLabel}
            />
        ) : (
            <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg sticky top-24 flex items-center justify-center h-96">
                <p className="text-slate-500">Chọn một nhân viên để xem thông tin</p>
            </Card>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <UserFormDialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          user={editingUser}
        />
      )}
    </div>
  );
}

// --- COMPONENT CON: PANEL CHI TIẾT ---
interface DetailPanelProps {
    user: NhanVienView; 
    onClose: () => void; 
    onEdit: () => void;
    getBadgeVariant: (trangThai: TrangThaiNhanVien) => string;
    getBadgeLabel: (trangThai: TrangThaiNhanVien) => string;
}

function UserDetailPanel({ user, onClose, onEdit, getBadgeVariant, getBadgeLabel }: DetailPanelProps) {
    return (
        <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg sticky top-24">
            <CardHeader className="relative items-center text-center">
                <Avatar className="size-24 mx-auto border-4 border-slate-700">
                    <AvatarImage src={user.AvatarUrl || ""} alt={user.TenNhanVien} />
                    <AvatarFallback className="text-3xl">{user.TenNhanVien.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl font-semibold text-slate-100 pt-2">{user.TenNhanVien}</CardTitle>
                <CardDescription className="text-base text-primary">{user.TenNhomNguoiDung}</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[55vh]">
                    <div className="space-y-4 pr-6">
                        
                        <div className="flex justify-between items-center">
                            <Badge variant="outline" className={cn("text-xs", getBadgeVariant(user.TrangThai))}>
                                {getBadgeLabel(user.TrangThai)}
                            </Badge>
                             <Button variant="outline" size="sm" onClick={onEdit} className="bg-transparent border-slate-700 hover:bg-slate-800">
                                <Edit className="size-3 mr-1.5" />
                                Chỉnh sửa
                            </Button>
                        </div>

                        <InfoRow label="Email" value={user.Email} />
                        <InfoRow label="Số điện thoại" value={user.SoDienThoai} />
                        <InfoRow label="Tên tài khoản" value={user.TenTaiKhoan} />
                        <InfoRow label="Ngày vào làm" value={format(user.NgayVaoLam, "dd/MM/yyyy", { locale: vi })} />
                        <InfoRow label="Trạng thái tài khoản" value={user.TrangThaiTaiKhoan} />
                        <InfoRow label="Mã nhân viên" value={user.MaNhanVien.toString()} />
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
function InfoRow({ label, value }: { label: string, value: string | null | undefined }) {
    if (!value) return null;
    return (
        <div className="space-y-1 border-t border-slate-800 pt-3 first:border-t-0 first:pt-0">
            <Label className="text-slate-400 text-xs uppercase tracking-wider">{label}</Label>
            <p className="text-sm text-slate-100">{value}</p>
        </div>
    );
}


interface UserFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: NhanVienView) => void;
    user: NhanVienView | null;
}

function UserFormDialog({ isOpen, onClose, onSubmit, user }: UserFormDialogProps) {
    const [formData, setFormData] = useState({
        TenNhanVien: "",
        Email: "",
        SoDienThoai: "",
        TenTaiKhoan: "",
        MatKhau: "", 
        NgayVaoLam: new Date(),
        MaNhomNguoiDung: mockNhomNguoiDung[1]?.MaNhomNguoiDung || 0, 
        TrangThai: "CONLAM" as TrangThaiNhanVien,
        TrangThaiTaiKhoan: "CONHOATDONG" as TrangThaiNguoiDung,
        AvatarUrl: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                TenNhanVien: user.TenNhanVien,
                Email: user.Email,
                SoDienThoai: user.SoDienThoai || "",
                TenTaiKhoan: user.TenTaiKhoan,
                MatKhau: "", // Không bao giờ tải mật khẩu cũ vào form
                NgayVaoLam: user.NgayVaoLam,
                MaNhomNguoiDung: user.MaNhomNguoiDung,
                TrangThai: user.TrangThai,
                TrangThaiTaiKhoan: user.TrangThaiTaiKhoan,
                AvatarUrl: user.AvatarUrl || "",
            });
        } else {
            // Reset về state mặc định khi thêm mới
            setFormData({
                TenNhanVien: "", Email: "", SoDienThoai: "", TenTaiKhoan: "", MatKhau: "",
                NgayVaoLam: new Date(),
                MaNhomNguoiDung: mockNhomNguoiDung[1]?.MaNhomNguoiDung || 0,
                TrangThai: "CONLAM",
                TrangThaiTaiKhoan: "CHUAKICHHOAT", // Mặc định khi tạo mới
                AvatarUrl: "",
            });
        }
    }, [user, isOpen]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSelectChange = (name: string, value: string | number) => {
         setFormData(prev => ({ ...prev, [name]: value }));
    };

     const handleDateChange = (name: string, date: Date | undefined) => {
        if (date) {
            setFormData(prev => ({ ...prev, [name]: date }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Lấy TenNhomNguoiDung dựa trên MaNhomNguoiDung đã chọn
        const selectedRole = mockNhomNguoiDung.find(r => r.MaNhomNguoiDung === Number(formData.MaNhomNguoiDung));
        
        const dataToSubmit: NhanVienView = {
            MaNhanVien: user?.MaNhanVien || 0,
            MaNguoiDung: user?.MaNguoiDung || 0,
            TenNhanVien: formData.TenNhanVien,
            Email: formData.Email,
            SoDienThoai: formData.SoDienThoai || null,
            TenTaiKhoan: formData.TenTaiKhoan,
            NgayVaoLam: formData.NgayVaoLam,
            MaNhomNguoiDung: Number(formData.MaNhomNguoiDung),
            TenNhomNguoiDung: selectedRole?.TenNhomNguoiDung || "Không rõ",
            TrangThai: formData.TrangThai,
            TrangThaiTaiKhoan: formData.TrangThaiTaiKhoan,
            AvatarUrl: formData.AvatarUrl || null,
            // MatKhau không được truyền trong View
        };
        // TODO: Gửi formData.MatKhau đến API nếu là thêm mới
        
        onSubmit(dataToSubmit);
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{user ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <ScrollArea className="max-h-[70vh] pr-6">
                        <div className="space-y-4 py-4">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="TenNhanVien">Họ và tên</Label>
                                    <Input id="TenNhanVien" name="TenNhanVien" value={formData.TenNhanVien} onChange={handleChange} className="bg-transparent border-slate-700" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="NgayVaoLam">Ngày vào làm</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal bg-transparent border-slate-700 hover:bg-slate-800 hover:text-white", !formData.NgayVaoLam && "text-slate-400")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.NgayVaoLam ? format(formData.NgayVaoLam, "PPP", { locale: vi }) : <span>Chọn ngày</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-slate-700 text-white">
                                            <Calendar mode="single" selected={formData.NgayVaoLam} onSelect={(date) => handleDateChange("NgayVaoLam", date)} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="AvatarUrl">URL Ảnh đại diện</Label>
                                <Input id="AvatarUrl" name="AvatarUrl" value={formData.AvatarUrl} onChange={handleChange} className="bg-transparent border-slate-700" />
                            </div>

                            <div className="my-4 h-px bg-slate-700" />
                            
                            <h4 className="text-md font-semibold text-primary">Thông tin tài khoản</h4>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <Label htmlFor="Email">Email</Label>
                                    <Input id="Email" name="Email" type="email" value={formData.Email} onChange={handleChange} className="bg-transparent border-slate-700" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="SoDienThoai">Số điện thoại</Label>
                                    <Input id="SoDienThoai" name="SoDienThoai" value={formData.SoDienThoai} onChange={handleChange} className="bg-transparent border-slate-700" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="TenTaiKhoan">Tên tài khoản</Label>
                                    <Input id="TenTaiKhoan" name="TenTaiKhoan" value={formData.TenTaiKhoan} onChange={handleChange} className="bg-transparent border-slate-700" required />
                                </div>
                                
                                {!user && ( // Chỉ hiển thị khi thêm mới
                                    <div className="space-y-2">
                                        <Label htmlFor="MatKhau">Mật khẩu</Label>
                                        <Input id="MatKhau" name="MatKhau" type="password" value={formData.MatKhau} onChange={handleChange} className="bg-transparent border-slate-700" required={!user} />
                                    </div>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="MaNhomNguoiDung">Chức vụ (Nhóm)</Label>
                                    <Select name="MaNhomNguoiDung" value={formData.MaNhomNguoiDung.toString()} onValueChange={(v) => handleSelectChange('MaNhomNguoiDung', Number(v))}>
                                        <SelectTrigger className="w-full bg-transparent border-slate-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1C1C1C] text-slate-100 border-slate-700">
                                            {mockNhomNguoiDung.map(role => (
                                                <SelectItem key={role.MaNhomNguoiDung} value={role.MaNhomNguoiDung.toString()} className="cursor-pointer focus:bg-slate-700">
                                                    {role.TenNhomNguoiDung}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="TrangThai">Trạng thái Nhân viên</Label>
                                    <Select name="TrangThai" value={formData.TrangThai} onValueChange={(v: TrangThaiNhanVien) => handleSelectChange('TrangThai', v)}>
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
                        </div>
                    </ScrollArea>
                    <DialogFooter className="!mt-6 pt-6 border-t border-slate-700">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="bg-transparent border-slate-700 hover:bg-slate-800">Hủy</Button>
                        </DialogClose>
                        <Button type="submit">{user ? "Cập nhật" : "Tạo nhân viên"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}