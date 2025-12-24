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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Edit,
  Shield,
  ShieldCheck,
  Lock,
  Save,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { roleService } from "@/services/role.service";
import { cn } from "@/lib/utils";

type Quyen =
  | "BANVE"
  | "HOANVE"
  | "YEUCAUHOANVE"
  | "SOATVE"
  | "BAOCAODOANHTHU"
  | "QLPHIM"
  | "QLLICHCHIEU"
  | "QLPHONGCHIEU"
  | "QLSUATCHIEU"
  | "QLGHE"
  | "MUAVE"
  | "QLCOMBO"
  | "QLKHUYENMAI"
  | "QLNHANVIEN"
  | "QLHOADON";

interface PermissionGroup {
  label: string;
  color: string; 
  permissions: { code: Quyen; label: string }[];
}

// Cấu hình nhóm quyền để hiển thị trên UI
const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: "Bán hàng & Soát vé",
    color: "text-green-400",
    permissions: [
      { code: "BANVE", label: "Bán vé tại quầy" },
      { code: "MUAVE", label: "Đặt vé (Khách hàng)" },
      { code: "SOATVE", label: "Soát vé (Check-in)" },
    ],
  },
  {
    label: "Giao dịch & Hóa đơn",
    color: "text-blue-400",
    permissions: [
      { code: "QLHOADON", label: "Tra cứu hóa đơn" },
      { code: "HOANVE", label: "Thực hiện hoàn vé" },
      { code: "YEUCAUHOANVE", label: "Duyệt yêu cầu hoàn tiền" },
    ],
  },
  {
    label: "Quản lý Phim & Lịch chiếu",
    color: "text-purple-400",
    permissions: [
      { code: "QLPHIM", label: "Quản lý Phim & Phiên bản" },
      { code: "QLLICHCHIEU", label: "Quản lý Lịch chiếu tổng thể" },
      { code: "QLSUATCHIEU", label: "Quản lý chi tiết Suất chiếu" },
    ],
  },
  {
    label: "Tài nguyên & Sản phẩm",
    color: "text-orange-400",
    permissions: [
      { code: "QLPHONGCHIEU", label: "Quản lý Phòng chiếu" },
      { code: "QLGHE", label: "Quản lý Sơ đồ ghế" },
      { code: "QLCOMBO", label: "Quản lý Combo / Bắp nước" },
      { code: "QLKHUYENMAI", label: "Quản lý Khuyến mãi" },
    ],
  },
  {
    label: "Hệ thống & Báo cáo",
    color: "text-red-400",
    permissions: [
      { code: "BAOCAODOANHTHU", label: "Xem báo cáo doanh thu" },
      { code: "QLNHANVIEN", label: "Quản lý Nhân viên" },
    ],
  },
];

interface NhomNguoiDung {
  MaNhom: string;
  TenNhom: string;
  DanhSachQuyen: Quyen[];
  IsAdmin?: boolean; 
}

const FIXED_ROLES: NhomNguoiDung[] = [
  {
    MaNhom: "915cb8af-9554-423e-aab7-4315b6434deb",
    TenNhom: "Nhân viên bán vé",
    DanhSachQuyen: [], 
  },
  {
    MaNhom: "a477df32-d679-42dc-88ca-9522089aa388",
    TenNhom: "Nhân viên soát vé",
    DanhSachQuyen: [],
  },
  {
    MaNhom: "e3641c6c-284b-4cfa-a22b-4c74ebe6bea8",
    TenNhom: "Nhân viên quản lý phim và lịch chiếu",
    DanhSachQuyen: [],
  },
];

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<NhomNguoiDung[]>(FIXED_ROLES);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<NhomNguoiDung | null>(null);

  useEffect(() => {
    const fetchCurrentPermissions = async () => {
      setLoading(true);
      try {
        const data: any[] = await roleService.getAll();

        if (Array.isArray(data) && data.length > 0) {
          const updatedRoles = FIXED_ROLES.map((fixed) => {
            const found = data.find((d) => d.MaNhomNguoiDung === fixed.MaNhom);
            if (found) {
              return {
                ...fixed,
                TenNhom: found.TenNhom, 
                DanhSachQuyen: found.QuyenNhomNguoiDungs.map(
                  (p: any) => p.Quyen
                ),
              };
            }
            return fixed;
          });
          setRoles(updatedRoles);
        }
      } catch (error) {
        console.error("Lỗi tải phân quyền:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentPermissions();
  }, []);

  const filteredRoles = useMemo(() => {
    return roles.filter((role) =>
      role.TenNhom.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm]);

  const handleEdit = (role: NhomNguoiDung) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleSave = async (updatedRole: NhomNguoiDung) => {
    try {
      await roleService.updatePermissions(
        updatedRole.MaNhom,
        updatedRole.DanhSachQuyen
      );

      setRoles((prev) =>
        prev.map((r) => (r.MaNhom === updatedRole.MaNhom ? updatedRole : r))
      );

      toast.success(`Đã cập nhật quyền cho nhóm "${updatedRole.TenNhom}"`);
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu phân quyền.");
    }
  };

  return (
    <div className="space-y-6 text-white h-[calc(100vh-100px)] flex flex-col p-2">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="size-6 text-primary" />
            Phân Quyền Hệ Thống
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Quản lý quyền hạn truy cập cho các nhóm nhân viên mặc định.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Input
            placeholder="Tìm nhóm quyền..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#1C1C1C] border-slate-700 focus:border-primary"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <RoleCard
            key={role.MaNhom}
            role={role}
            onEdit={() => handleEdit(role)}
          />
        ))}
      </div>

      {isModalOpen && editingRole && (
        <RolePermissionDialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          role={editingRole}
          onSubmit={handleSave}
        />
      )}
    </div>
  );
}

function RoleCard({
  role,
  onEdit,
}: {
  role: NhomNguoiDung;
  onEdit: () => void;
}) {
  return (
    <Card className="bg-[#1C1C1C] border-slate-800 flex flex-col hover:border-slate-600 transition-colors">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {role.TenNhom}
              <Lock className="size-3 text-slate-500" />
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-1">
              ID: {role.MaNhom.substring(0, 8)}...
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="bg-slate-800 border-slate-700 hover:bg-primary hover:text-white hover:border-primary"
          >
            <Edit className="size-3.5 mr-2" /> Cấu hình
          </Button>
        </div>

        <div className="space-y-3">
          <Label className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
            Quyền hạn ({role.DanhSachQuyen.length})
          </Label>
          <div className="flex flex-wrap gap-1.5 min-h-[60px]">
            {role.DanhSachQuyen.length > 0 ? (
              <>
                {role.DanhSachQuyen.slice(0, 5).map((q) => (
                  <Badge
                    key={q}
                    variant="secondary"
                    className="bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/50"
                  >
                    {q}
                  </Badge>
                ))}
                {role.DanhSachQuyen.length > 5 && (
                  <Badge
                    variant="outline"
                    className="text-slate-500 border-slate-700 border-dashed"
                  >
                    +{role.DanhSachQuyen.length - 5}
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-sm text-slate-600 italic flex items-center gap-2">
                <Shield className="size-3" /> Chưa được cấp quyền
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "h-1 w-full mt-auto rounded-b-lg bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50"
        )}
      />
    </Card>
  );
}

interface RolePermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: NhomNguoiDung;
  onSubmit: (data: NhomNguoiDung) => void;
}

function RolePermissionDialog({
  isOpen,
  onClose,
  role,
  onSubmit,
}: RolePermissionDialogProps) {
  const [permissions, setPermissions] = useState<Quyen[]>(
    role.DanhSachQuyen || []
  );
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setPermissions(role.DanhSachQuyen || []);
    setHasChanges(false);
  }, [role, isOpen]);

  const handleToggle = (code: Quyen) => {
    setPermissions((prev) => {
      const exists = prev.includes(code);
      const next = exists ? prev.filter((p) => p !== code) : [...prev, code];
      setHasChanges(true); 
      return next;
    });
  };

  const handleGroupToggle = (groupPerms: { code: Quyen }[]) => {
    setPermissions((prev) => {
      const codes = groupPerms.map((p) => p.code);
      const allSelected = codes.every((c) => prev.includes(c));
      setHasChanges(true);

      if (allSelected) {
        return prev.filter((c) => !codes.includes(c));
      } else {
        return Array.from(new Set([...prev, ...codes]));
      }
    });
  };

  const handleReset = () => {
    setPermissions(role.DanhSachQuyen || []);
    setHasChanges(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white w-full max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b border-slate-800 bg-[#151515] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShieldCheck className="size-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                Phân quyền: {role.TenNhom}
              </DialogTitle>
              <DialogDescription className="text-slate-400 mt-1">
                Điều chỉnh quyền hạn truy cập chức năng cho nhóm này.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body: Danh sách quyền */}
        <div className="flex-1 overflow-y-auto bg-[#1C1C1C] custom-scrollbar">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {PERMISSION_GROUPS.map((group, idx) => {
              const groupCodes = group.permissions.map((p) => p.code);
              const isAllSelected = groupCodes.every((c) =>
                permissions.includes(c)
              );
              const isSomeSelected =
                groupCodes.some((c) => permissions.includes(c)) &&
                !isAllSelected;

              return (
                <div
                  key={idx}
                  className="bg-[#222] border border-slate-800 rounded-xl overflow-hidden flex flex-col"
                >
                  <div className="px-4 py-3 bg-[#2a2a2a] border-b border-slate-800 flex justify-between items-center">
                    <h4
                      className={cn(
                        "text-sm font-bold flex items-center gap-2",
                        group.color
                      )}
                    >
                      <Shield className="size-4" />
                      {group.label}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleGroupToggle(group.permissions)}
                      className="h-7 text-xs text-slate-400 hover:text-white hover:bg-slate-700"
                    >
                      {isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                    </Button>
                  </div>

                  <div className="p-4 grid grid-cols-1 gap-3">
                    {group.permissions.map((perm) => {
                      const isChecked = permissions.includes(perm.code);
                      return (
                        <div
                          key={perm.code}
                          className={cn(
                            "flex items-start space-x-3 p-2 rounded-lg transition-colors cursor-pointer border border-transparent",
                            isChecked
                              ? "bg-primary/10 border-primary/20"
                              : "hover:bg-slate-800"
                          )}
                          onClick={() => handleToggle(perm.code)}
                        >
                          <Checkbox
                            id={`perm-${perm.code}`}
                            checked={isChecked}
                            onCheckedChange={() => handleToggle(perm.code)}
                            className="mt-0.5 border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <div className="flex flex-col">
                            <label
                              htmlFor={`perm-${perm.code}`}
                              className={cn(
                                "text-sm font-medium leading-none cursor-pointer",
                                isChecked
                                  ? "text-primary-foreground"
                                  : "text-slate-300"
                              )}
                            >
                              {perm.label}
                            </label>
                            <span className="text-[10px] text-slate-500 font-mono mt-1">
                              {perm.code}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-slate-800 bg-[#151515] shrink-0 flex justify-between sm:justify-between items-center">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            {hasChanges && (
              <span className="text-yellow-500 flex items-center gap-1 animate-pulse">
                ● Có thay đổi chưa lưu
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={!hasChanges}
              className="text-slate-500 hover:text-white"
            >
              <RotateCcw className="size-3.5 mr-1.5" /> Khôi phục
            </Button>
          </div>

          <div className="flex gap-3">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="bg-transparent border-slate-700 hover:bg-slate-800 text-white"
              >
                Đóng
              </Button>
            </DialogClose>
            <Button
              onClick={() => onSubmit({ ...role, DanhSachQuyen: permissions })}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
              disabled={!hasChanges} 
            >
              <Save className="size-4 mr-2" /> Lưu thay đổi
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
