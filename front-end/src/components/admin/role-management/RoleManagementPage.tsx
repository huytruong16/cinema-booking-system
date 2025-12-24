"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Edit,
  Shield,
  ShieldCheck,
  Save,
  RotateCcw,
  Loader2,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { roleService, Role } from "@/services/role.service";
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

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleFormData, setRoleFormData] = useState({ TenNhom: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await roleService.getAll();
      if (Array.isArray(data)) {
        setRoles(data);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách nhóm:", error);
      toast.error("Không thể tải danh sách nhóm người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const filteredRoles = useMemo(() => {
    return roles.filter((role) =>
      role.TenNhom.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm]);

  // Handlers
  const handleOpenCreate = () => {
    setSelectedRole(null);
    setRoleFormData({ TenNhom: "" });
    setIsRoleModalOpen(true);
  };

  const handleOpenEditName = (role: Role) => {
    setSelectedRole(role);
    setRoleFormData({ TenNhom: role.TenNhom });
    setIsRoleModalOpen(true);
  };

  const handleOpenPermissions = (role: Role) => {
    setSelectedRole(role);
    setIsPermissionModalOpen(true);
  };

  const handleOpenDelete = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteAlertOpen(true);
  };

  const handleSaveRole = async () => {
    if (!roleFormData.TenNhom.trim()) {
      toast.warning("Tên nhóm không được để trống");
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedRole) {
        // Update name
        await roleService.update(selectedRole.MaNhomNguoiDung, {
          TenNhom: roleFormData.TenNhom,
        });
        toast.success("Cập nhật tên nhóm thành công");
      } else {
        // Create new
        await roleService.create({ TenNhom: roleFormData.TenNhom });
        toast.success("Tạo nhóm mới thành công");
      }
      setIsRoleModalOpen(false);
      fetchRoles();
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((error as any).response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    try {
      await roleService.delete(selectedRole.MaNhomNguoiDung);
      toast.success("Xóa nhóm thành công");
      setIsDeleteAlertOpen(false);
      fetchRoles();
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((error as any).response?.data?.message || "Xóa thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePermissions = async (permissions: string[]) => {
    if (!selectedRole) return;
    try {
      await roleService.updatePermissions(
        selectedRole.MaNhomNguoiDung,
        permissions
      );
      toast.success("Cập nhật quyền thành công");
      setIsPermissionModalOpen(false);
      fetchRoles();
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((error as any).response?.data?.message || "Lỗi cập nhật quyền");
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
            Quản lý nhóm người dùng và phân quyền truy cập.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Input
              placeholder="Tìm nhóm quyền..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#1C1C1C] border-slate-700 focus:border-primary"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" /> Thêm Nhóm
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-primary size-8" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-10">
          {filteredRoles.map((role) => (
            <RoleCard
              key={role.MaNhomNguoiDung}
              role={role}
              onEditName={() => handleOpenEditName(role)}
              onConfigPermissions={() => handleOpenPermissions(role)}
              onDelete={() => handleOpenDelete(role)}
            />
          ))}
          {filteredRoles.length === 0 && (
            <div className="col-span-full text-center text-slate-500 py-10">
              Không tìm thấy nhóm người dùng nào.
            </div>
          )}
        </div>
      )}

      {/* Dialog Create/Edit Role Name */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? "Đổi Tên Nhóm" : "Tạo Nhóm Mới"}
            </DialogTitle>
            <DialogDescription>
              Nhập tên cho nhóm người dùng này.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Tên nhóm</Label>
            <Input
              value={roleFormData.TenNhom}
              onChange={(e) =>
                setRoleFormData({ ...roleFormData, TenNhom: e.target.value })
              }
              className="mt-2 bg-[#2a2a2a] border-slate-700"
              placeholder="Ví dụ: Quản lý kho"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsRoleModalOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveRole} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Permissions */}
      {selectedRole && (
        <RolePermissionDialog
          isOpen={isPermissionModalOpen}
          onClose={() => setIsPermissionModalOpen(false)}
          role={selectedRole}
          onSubmit={handleSavePermissions}
        />
      )}

      {/* Alert Delete */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="bg-[#1C1C1C] border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Hành động này sẽ xóa nhóm &quot;
              <span className="text-white font-bold">
                {selectedRole?.TenNhom}
              </span>
              &quot;. Các tài khoản thuộc nhóm này có thể bị mất quyền truy cập.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-slate-700 text-white hover:bg-slate-800">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RoleCard({
  role,
  onEditName,
  onConfigPermissions,
  onDelete,
}: {
  role: Role;
  onEditName: () => void;
  onConfigPermissions: () => void;
  onDelete: () => void;
}) {
  const permissions = role.QuyenNhomNguoiDungs?.map((q) => q.Quyen) || [];

  return (
    <Card className="bg-[#1C1C1C] border-slate-800 flex flex-col hover:border-slate-600 transition-colors group relative">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {role.TenNhom}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onEditName}
              >
                <Pencil className="size-3 text-slate-400 hover:text-white" />
              </Button>
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-1">
              ID: {role.MaNhomNguoiDung.substring(0, 8)}...
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onConfigPermissions}
              className="bg-slate-800 border-slate-700 hover:bg-primary hover:text-white hover:border-primary"
            >
              <Edit className="size-3.5 mr-2" /> Phân quyền
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-slate-500 hover:text-red-500 hover:bg-red-500/10"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
            Quyền hạn ({permissions.length})
          </Label>
          <div className="flex flex-wrap gap-1.5 min-h-[60px]">
            {permissions.length > 0 ? (
              <>
                {permissions.slice(0, 5).map((q) => (
                  <Badge
                    key={q}
                    variant="secondary"
                    className="bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/50"
                  >
                    {q}
                  </Badge>
                ))}
                {permissions.length > 5 && (
                  <Badge
                    variant="outline"
                    className="text-slate-500 border-slate-700 border-dashed"
                  >
                    +{permissions.length - 5}
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
  role: Role;
  onSubmit: (permissions: string[]) => Promise<void>;
}

function RolePermissionDialog({
  isOpen,
  onClose,
  role,
  onSubmit,
}: RolePermissionDialogProps) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const currentPerms = role.QuyenNhomNguoiDungs?.map((q) => q.Quyen) || [];
    setPermissions(currentPerms);
    setHasChanges(false);
  }, [role, isOpen]);

  const handleToggle = (code: string) => {
    setPermissions((prev) => {
      const exists = prev.includes(code);
      const next = exists ? prev.filter((p) => p !== code) : [...prev, code];
      setHasChanges(true);
      return next;
    });
  };

  const handleGroupToggle = (groupPerms: { code: string }[]) => {
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
    const currentPerms = role.QuyenNhomNguoiDungs?.map((q) => q.Quyen) || [];
    setPermissions(currentPerms);
    setHasChanges(false);
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(permissions);
    } finally {
      setIsSubmitting(false);
    }
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
              disabled={!hasChanges || isSubmitting}
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
                disabled={isSubmitting}
              >
                Đóng
              </Button>
            </DialogClose>
            <Button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
              disabled={!hasChanges || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" /> Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
