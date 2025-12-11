"use client";

import React, { useState, useMemo } from 'react';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Edit, Trash2, Shield, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

type Quyen = 
  | 'BANVE' | 'HOANVE' | 'YEUCAUHOANVE' | 'SOATVE' 
  | 'BAOCAODOANHTHU' 
  | 'QLPHIM' | 'QLLICHCHIEU' | 'QLPHONGCHIEU' | 'QLSUATCHIEU' | 'QLGHE' 
  | 'MUAVE' | 'QLCOMBO' | 'QLKHUYENMAI' | 'QLNHANVIEN' | 'QLHOADON';

interface PermissionGroup {
  label: string;
  permissions: { code: Quyen; label: string }[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: "Nghiệp vụ Bán hàng",
    permissions: [
      { code: 'BANVE', label: 'Bán vé tại quầy' },
      { code: 'MUAVE', label: 'Đặt vé (Khách hàng)' },
      { code: 'SOATVE', label: 'Soát vé (Check-in)' },
    ]
  },
  {
    label: "Giao dịch & Hóa đơn",
    permissions: [
      { code: 'HOANVE', label: 'Thực hiện hoàn vé' },
      { code: 'YEUCAUHOANVE', label: 'Duyệt yêu cầu hoàn tiền' },
      { code: 'QLHOADON', label: 'Tra cứu hóa đơn' },
    ]
  },
  {
    label: "Quản lý Nội dung & Lịch chiếu",
    permissions: [
      { code: 'QLPHIM', label: 'Quản lý Phim & Phiên bản' },
      { code: 'QLLICHCHIEU', label: 'Quản lý Lịch chiếu tổng thể' },
      { code: 'QLSUATCHIEU', label: 'Quản lý chi tiết Suất chiếu' },
    ]
  },
  {
    label: "Quản lý Tài nguyên Rạp",
    permissions: [
      { code: 'QLPHONGCHIEU', label: 'Quản lý Phòng chiếu' },
      { code: 'QLGHE', label: 'Quản lý sơ đồ Ghế' },
      { code: 'QLCOMBO', label: 'Quản lý Combo' },
      { code: 'QLKHUYENMAI', label: 'Quản lý Khuyến mãi' },
    ]
  },
  {
    label: "Hệ thống & Thống kê",
    permissions: [
      { code: 'BAOCAODOANHTHU', label: 'Xem báo cáo doanh thu' },
      { code: 'QLNHANVIEN', label: 'Quản lý nhân viên' },
    ]
  }
];

interface NhomNguoiDung {
  MaNhom: string;
  TenNhom: string;
  DanhSachQuyen: Quyen[];
  SoLuongNhanVien?: number;
}

const mockRoles: NhomNguoiDung[] = [
  {
    MaNhom: "role-admin",
    TenNhom: "Quản trị viên (Admin)",
    DanhSachQuyen: ['BANVE', 'HOANVE', 'YEUCAUHOANVE', 'SOATVE', 'BAOCAODOANHTHU', 'QLPHIM', 'QLLICHCHIEU', 'QLPHONGCHIEU', 'QLSUATCHIEU', 'QLGHE', 'QLCOMBO', 'QLKHUYENMAI', 'QLNHANVIEN', 'QLHOADON'],
    SoLuongNhanVien: 2
  },
  {
    MaNhom: "role-staff-sales",
    TenNhom: "Nhân viên Bán vé",
    DanhSachQuyen: ['BANVE', 'HOANVE', 'QLHOADON'],
    SoLuongNhanVien: 5
  },
  {
    MaNhom: "role-staff-checkin",
    TenNhom: "Nhân viên Soát vé",
    DanhSachQuyen: ['SOATVE'],
    SoLuongNhanVien: 3
  },
  {
    MaNhom: "role-manager",
    TenNhom: "Quản lý Rạp",
    DanhSachQuyen: ['QLPHIM', 'QLLICHCHIEU', 'QLSUATCHIEU', 'BAOCAODOANHTHU', 'YEUCAUHOANVE', 'QLCOMBO', 'QLKHUYENMAI'],
    SoLuongNhanVien: 1
  }
];

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<NhomNguoiDung[]>(mockRoles);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<NhomNguoiDung | null>(null);

  const filteredRoles = useMemo(() => {
    return roles.filter(role => 
      role.TenNhom.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm]);

  const handleAddNew = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEdit = (role: NhomNguoiDung) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleDelete = (maNhom: string) => {
    setRoles(prev => prev.filter(r => r.MaNhom !== maNhom));
    toast.success("Đã xóa nhóm quyền thành công");
  };

  const handleSave = (formData: NhomNguoiDung) => {
    if (editingRole) {
        setRoles(prev => prev.map(r => r.MaNhom === formData.MaNhom ? formData : r));
        toast.success("Cập nhật nhóm quyền thành công");
    } else {
        const newRole = { ...formData, MaNhom: `role-${Date.now()}`, SoLuongNhanVien: 0 };
        setRoles(prev => [...prev, newRole]);
        toast.success("Tạo nhóm quyền mới thành công");
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 text-white h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="size-6 text-primary" />
                Quản lý Phân quyền
            </h1>
            <p className="text-slate-400 text-sm mt-1">Định nghĩa vai trò và quyền hạn truy cập hệ thống.</p>
        </div>
        <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
            <Plus className="size-4 mr-2" /> Thêm nhóm quyền
        </Button>
      </div>

      <div className="flex gap-4 shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Input 
            placeholder="Tìm kiếm nhóm quyền..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="pl-10 bg-[#1C1C1C] border-slate-700 focus:border-primary" 
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        </div>
      </div>

      <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto">
            <Table>
                <TableHeader className="sticky top-0 bg-[#1C1C1C] z-10 shadow-sm">
                    <TableRow className="border-slate-700 hover:bg-transparent">
                        <TableHead className="text-slate-100 font-semibold w-[250px]">Tên Nhóm</TableHead>
                        <TableHead className="text-slate-100 font-semibold">Quyền hạn được cấp</TableHead>
                        <TableHead className="text-slate-100 font-semibold text-center w-[150px]">Nhân sự</TableHead>
                        <TableHead className="text-slate-100 font-semibold text-right w-[120px]">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredRoles.map((role) => (
                        <TableRow key={role.MaNhom} className="border-slate-800 hover:bg-slate-800/50">
                            <TableCell className="font-medium text-lg text-primary">
                                {role.TenNhom}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1.5">
                                    {role.DanhSachQuyen.length > 0 ? (
                                        role.DanhSachQuyen.slice(0, 5).map(q => (
                                            <Badge key={q} variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700">
                                                {q}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-slate-500 italic text-sm">Chưa cấp quyền</span>
                                    )}
                                    {role.DanhSachQuyen.length > 5 && (
                                        <Badge variant="outline" className="text-slate-400 border-slate-600">
                                            +{role.DanhSachQuyen.length - 5} quyền khác
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="outline" className="bg-slate-900/50">
                                    {role.SoLuongNhanVien} người
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(role)} className="hover:bg-slate-700">
                                        <Edit className="size-4" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400 hover:bg-red-900/20">
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-[#1C1C1C] border-slate-800 text-white">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Xóa nhóm quyền?</AlertDialogTitle>
                                                <AlertDialogDescription className="text-slate-400">
                                                    Bạn có chắc chắn muốn xóa nhóm &quot;{role.TenNhom}&quot;? 
                                                    <br/>Hành động này không thể hoàn tác và có thể ảnh hưởng đến các nhân viên đang thuộc nhóm này.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="bg-transparent border-slate-700 hover:bg-slate-800">Hủy</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(role.MaNhom)} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </Card>

      {isModalOpen && (
        <RoleFormDialog 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            role={editingRole}
            onSubmit={handleSave}
        />
      )}
    </div>
  );
}

interface RoleFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    role: NhomNguoiDung | null;
    onSubmit: (data: NhomNguoiDung) => void;
}

function RoleFormDialog({ isOpen, onClose, role, onSubmit }: RoleFormDialogProps) {
    const [formData, setFormData] = useState<NhomNguoiDung>(role || {
        MaNhom: "",
        TenNhom: "",
        DanhSachQuyen: [],
    });

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, TenNhom: e.target.value }));
    };

    const handlePermissionToggle = (code: Quyen) => {
        setFormData(prev => {
            const current = prev.DanhSachQuyen || [];
            const isExist = current.includes(code);
            return {
                ...prev,
                DanhSachQuyen: isExist 
                    ? current.filter(p => p !== code) 
                    : [...current, code]
            };
        });
    };

    const handleGroupToggle = (groupPermissions: { code: Quyen }[]) => {
        setFormData(prev => {
            const current = prev.DanhSachQuyen || [];
            const groupCodes = groupPermissions.map(p => p.code);
            const allSelected = groupCodes.every(code => current.includes(code));

            if (allSelected) {
                return { ...prev, DanhSachQuyen: current.filter(c => !groupCodes.includes(c)) };
            } else {
                const newPermissions = Array.from(new Set([...current, ...groupCodes]));
                return { ...prev, DanhSachQuyen: newPermissions };
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                
                <DialogHeader className="px-6 py-4 border-b border-slate-800 bg-[#1C1C1C] z-10 shrink-0">
                    <DialogTitle>{role ? "Cập nhật Nhóm quyền" : "Tạo Nhóm quyền mới"}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Đặt tên nhóm và tích chọn các quyền hạn tương ứng.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="TenNhom">Tên nhóm quyền <span className="text-red-500">*</span></Label>
                            <Input 
                                id="TenNhom" 
                                placeholder="VD: Nhân viên Bán vé" 
                                value={formData.TenNhom}
                                onChange={handleNameChange}
                                className="bg-transparent border-slate-700 focus:border-primary"
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="text-base font-semibold text-primary block border-b border-slate-800 pb-2">
                                Phân quyền chi tiết
                            </Label>
                            
                            {PERMISSION_GROUPS.map((group, idx) => {
                                const groupCodes = group.permissions.map(p => p.code);
                                const isAllSelected = groupCodes.every(c => formData.DanhSachQuyen.includes(c));
                                
                                return (
                                    <div key={idx} className="bg-slate-900/30 border border-slate-800 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                                <Shield className="size-4 text-slate-500" />
                                                {group.label}
                                            </h4>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-6 text-xs text-slate-400 hover:text-white"
                                                onClick={() => handleGroupToggle(group.permissions)}
                                            >
                                                {isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                                            </Button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {group.permissions.map((perm) => (
                                                <div key={perm.code} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={`perm-${perm.code}`} 
                                                        checked={formData.DanhSachQuyen.includes(perm.code)}
                                                        onCheckedChange={() => handlePermissionToggle(perm.code)}
                                                        className="border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                    />
                                                    <label 
                                                        htmlFor={`perm-${perm.code}`} 
                                                        className="text-sm font-medium leading-none text-slate-300 cursor-pointer select-none"
                                                    >
                                                        {perm.label} 
                                                        <span className="text-[10px] text-slate-500 ml-1 font-mono">({perm.code})</span>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer Cố định */}
                <DialogFooter className="px-6 py-4 border-t border-slate-800 bg-[#1C1C1C] shrink-0">
                    <DialogClose asChild>
                        <Button variant="outline" className="bg-transparent border-slate-700 hover:bg-slate-800">Hủy</Button>
                    </DialogClose>
                    <Button 
                        onClick={() => onSubmit(formData)} 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        disabled={!formData.TenNhom.trim()}
                    >
                        {role ? "Cập nhật" : "Tạo mới"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}