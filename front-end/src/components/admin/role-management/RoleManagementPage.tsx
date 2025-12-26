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
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Shield,
  ShieldCheck,
  Save,
  RotateCcw,
  Loader2,
  Plus,
  Trash2,
  MoreVertical,
  LayoutGrid,
  CheckCircle2,
  XCircle,
  Users,
  Settings2,
  SearchX,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { roleService, Role } from "@/services/role.service";
import { getAllUsers, UserProfile } from "@/services/user.service";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { PERMISSION_GROUPS } from "@/lib/permissions";


export default function RoleManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleFormData, setRoleFormData] = useState({ TenNhomNguoiDung: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [usersInGroup, setUsersInGroup] = useState<UserProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [selectedUserIdToAssign, setSelectedUserIdToAssign] = useState("");

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
      (role.TenNhomNguoiDung || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm]);

  const handleOpenCreate = () => {
    setSelectedRole(null);
    setRoleFormData({ TenNhomNguoiDung: "" });
    setIsRoleModalOpen(true);
  };

  const handleOpenEditName = (role: Role) => {
    setSelectedRole(role);
    setRoleFormData({ TenNhomNguoiDung: role.TenNhomNguoiDung });
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

  const handleOpenUsers = async (role: Role) => {
    setSelectedRole(role);
    setIsUsersModalOpen(true);
    setUsersInGroup([]);
    setAllUsers([]);
    setSelectedUserIdToAssign("");

    try {
      const [groupUsers, users] = await Promise.all([
        roleService.getUsersInGroup(role.MaNhomNguoiDung),
        getAllUsers(),
      ]);
      setUsersInGroup(groupUsers);
      setAllUsers(users);
    } catch (error) {
      console.error("Lỗi tải danh sách người dùng:", error);
      toast.error("Không thể tải danh sách người dùng");
    }
  };

  const handleAssignUser = async () => {
    if (!selectedRole || !selectedUserIdToAssign) return;

    setIsSubmitting(true);
    try {
      await roleService.assignGroup(
        selectedUserIdToAssign,
        selectedRole.MaNhomNguoiDung
      );
      toast.success("Gán người dùng thành công");

      const groupUsers = await roleService.getUsersInGroup(
        selectedRole.MaNhomNguoiDung
      );
      setUsersInGroup(groupUsers);
      setSelectedUserIdToAssign("");
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((error as any).response?.data?.message || "Lỗi gán người dùng");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRole = async () => {
    if (!roleFormData.TenNhomNguoiDung.trim()) {
      toast.warning("Tên nhóm không được để trống");
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedRole) {
        await roleService.update(selectedRole.MaNhomNguoiDung, {
          TenNhomNguoiDung: roleFormData.TenNhomNguoiDung,
        });
        toast.success("Cập nhật tên nhóm thành công");
      } else {
        await roleService.create({ TenNhomNguoiDung: roleFormData.TenNhomNguoiDung });
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
      toast.error(
        (error as any).response?.data?.message || "Lỗi cập nhật quyền"
      );
    }
  };

  return (
    <div className="space-y-6 text-white h-[calc(100vh-100px)] flex flex-col p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 shrink-0 bg-[#1C1C1C] p-4 rounded-xl border border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <ShieldCheck className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">
              Phân Quyền Hệ Thống
            </h1>
            <p className="text-slate-400 text-sm">
              Quản lý vai trò và giới hạn truy cập người dùng.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            <Input
              placeholder="Tìm kiếm nhóm quyền..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-[#252525] border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button
            onClick={handleOpenCreate}
            className="shadow-lg shadow-primary/20"
          >
            <Plus className="mr-2 h-4 w-4" /> Thêm Nhóm Mới
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center flex-1 min-h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-primary size-10" />
            <span className="text-slate-500 text-sm">Đang tải dữ liệu...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
          {filteredRoles.map((role) => (
            <RoleCard
              key={role.MaNhomNguoiDung}
              role={role}
              onEditName={() => handleOpenEditName(role)}
              onConfigPermissions={() => handleOpenPermissions(role)}
              onDelete={() => handleOpenDelete(role)}
              onViewUsers={() => handleOpenUsers(role)}
            />
          ))}
          {filteredRoles.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-[#1C1C1C]/50">
              <SearchX className="size-12 mb-3 opacity-50" />
              <p>Không tìm thấy nhóm người dùng nào phù hợp.</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? "Cập Nhật Tên Nhóm" : "Tạo Nhóm Mới"}
            </DialogTitle>
            <DialogDescription>
              Tên nhóm giúp phân biệt các vai trò trong hệ thống.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Tên hiển thị</Label>
              <Input
                value={roleFormData.TenNhomNguoiDung}
                onChange={(e) =>
                  setRoleFormData({ ...roleFormData, TenNhomNguoiDung: e.target.value })
                }
                className="bg-[#252525] border-slate-700"
                placeholder="Ví dụ: Quản lý kho, Nhân viên bán vé..."
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsRoleModalOpen(false)}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </Button>
            <Button onClick={handleSaveRole} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {selectedRole ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedRole && (
        <RolePermissionDialog
          isOpen={isPermissionModalOpen}
          onClose={() => setIsPermissionModalOpen(false)}
          role={selectedRole}
          onSubmit={handleSavePermissions}
        />
      )}

      {selectedRole && (
        <RoleUsersDialog
          isOpen={isUsersModalOpen}
          onClose={() => setIsUsersModalOpen(false)}
          role={selectedRole}
          usersInGroup={usersInGroup}
          allUsers={allUsers}
          selectedUserId={selectedUserIdToAssign}
          onSelectUser={setSelectedUserIdToAssign}
          onAssign={handleAssignUser}
          isSubmitting={isSubmitting}
        />
      )}

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="bg-[#1C1C1C] border-slate-800 text-white">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
              <Trash2 className="size-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-center">
              Xác nhận xóa nhóm?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-slate-400">
              Bạn đang thực hiện xóa nhóm{" "}
              <span className="text-white font-bold">
                {selectedRole?.TenNhomNguoiDung}
              </span>
              .
              <br />
              Hành động này không thể hoàn tác và các tài khoản thuộc nhóm này
              sẽ mất quyền truy cập tương ứng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel className="bg-transparent border-slate-700 hover:bg-slate-800 text-white">
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Xóa vĩnh viễn"
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
  onViewUsers,
}: {
  role: Role;
  onEditName: () => void;
  onConfigPermissions: () => void;
  onDelete: () => void;
  onViewUsers: () => void;
}) {
  const permissions = role.QuyenNhomNguoiDungs?.map((q) => q.Quyen) || [];
  const permissionCount = permissions.length;

  return (
    <Card className="bg-[#1C1C1C] border-slate-800 hover:border-slate-600 transition-all duration-300 group flex flex-col h-full overflow-hidden relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-slate-800 group-hover:bg-primary transition-colors" />

      <CardHeader className="pb-3 pl-7 flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
            {role.TenNhomNguoiDung}
          </CardTitle>
          <p className="text-xs text-slate-500 font-mono">
            ID: {role.MaNhomNguoiDung.slice(0, 8)}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-white"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-[#252525] border-slate-700 text-slate-200"
          >
            <DropdownMenuItem onClick={onViewUsers} className="cursor-pointer">
              Quản lý thành viên
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEditName} className="cursor-pointer">
              Đổi tên nhóm
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-400 focus:text-red-400 cursor-pointer"
            >
              Xóa nhóm
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="pl-7 flex-1">
        <div className="flex items-center gap-2 mb-4">
          <Badge
            variant={permissionCount > 0 ? "default" : "secondary"}
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-semibold",
              permissionCount > 0
                ? "bg-primary/20 text-primary hover:bg-primary/30"
                : "bg-slate-800 text-slate-400"
            )}
          >
            {permissionCount > 0
              ? `${permissionCount} quyền hạn`
              : "Chưa phân quyền"}
          </Badge>
        </div>

        {permissionCount > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {permissions.slice(0, 6).map((p) => (
              <span
                key={p}
                className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700"
              >
                {p}
              </span>
            ))}
            {permissions.length > 6 && (
              <span className="text-[10px] px-1.5 py-0.5 text-slate-500">
                +{permissions.length - 6} khác
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-600 italic">
            Nhóm này chưa có quyền nào được gán.
          </p>
        )}
      </CardContent>

      <CardFooter className="pl-7 pt-2 pb-5 border-t border-slate-800/50 mt-auto bg-slate-900/20 flex gap-2">
        <Button
          variant="secondary"
          onClick={onConfigPermissions}
          className="flex-1 bg-slate-800 text-slate-300 hover:bg-primary hover:text-white transition-colors border border-slate-700"
        >
          <Settings2 className="size-4 mr-2" /> Phân quyền
        </Button>
        <Button
          variant="secondary"
          onClick={onViewUsers}
          className="bg-slate-800 text-slate-300 hover:bg-primary hover:text-white transition-colors border border-slate-700 px-3"
          title="Quản lý thành viên"
        >
          <Users className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

interface RoleUsersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
  usersInGroup: UserProfile[];
  allUsers: UserProfile[];
  selectedUserId: string;
  onSelectUser: (id: string) => void;
  onAssign: () => void;
  isSubmitting: boolean;
}

function RoleUsersDialog({
  isOpen,
  onClose,
  role,
  usersInGroup,
  allUsers,
  selectedUserId,
  onSelectUser,
  onAssign,
  isSubmitting,
}: RoleUsersDialogProps) {
  const availableUsers = allUsers.filter(
    (u) =>
      u.VaiTro !== "KHACHHANG" &&
      !usersInGroup.some((ug) => ug.MaNguoiDung === u.MaNguoiDung)
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thành viên nhóm: {role.TenNhomNguoiDung}</DialogTitle>
          <DialogDescription>
            Quản lý danh sách người dùng thuộc nhóm quyền này.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Add User Section */}
          <div className="flex gap-3 items-end bg-[#252525] p-4 rounded-lg border border-slate-700">
            <div className="flex-1 space-y-2">
              <Label>Thêm thành viên mới</Label>
              <Select value={selectedUserId} onValueChange={onSelectUser}>
                <SelectTrigger className="bg-[#1C1C1C] border-slate-600">
                  <SelectValue placeholder="Chọn người dùng..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1C] border-slate-700 text-white">
                  {availableUsers.map((user) => (
                    <SelectItem
                      key={user.MaNguoiDung}
                      value={user.MaNguoiDung}
                      className="focus:bg-slate-800 focus:text-white cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.AvatarUrl || ""} />
                          <AvatarFallback className="text-[10px] bg-slate-700">
                            {user.HoTen.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {user.HoTen} ({user.Email})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                  {availableUsers.length === 0 && (
                    <div className="p-2 text-sm text-slate-500 text-center">
                      Không còn người dùng nào khả dụng
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={onAssign}
              disabled={!selectedUserId || isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Thêm
            </Button>
          </div>

          <div className="space-y-3">
            <Label>Danh sách thành viên ({usersInGroup.length})</Label>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {usersInGroup.map((user) => (
                  <div
                    key={user.MaNguoiDung}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#252525] border border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.AvatarUrl || ""} />
                        <AvatarFallback className="bg-slate-700">
                          {user.HoTen.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{user.HoTen}</p>
                        <p className="text-xs text-slate-400">{user.Email}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {usersInGroup.length === 0 && (
                  <div className="text-center py-10 text-slate-500 border border-dashed border-slate-800 rounded-lg">
                    Chưa có thành viên nào trong nhóm này.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
  const [filterQuery, setFilterQuery] = useState("");

  useEffect(() => {
    const currentPerms = role.QuyenNhomNguoiDungs?.map((q) => q.Quyen) || [];
    setPermissions(currentPerms);
    setHasChanges(false);
    setFilterQuery("");
  }, [role, isOpen]);

  const handleToggle = (code: string) => {
    setPermissions((prev) => {
      const exists = prev.includes(code);
      const next = exists ? prev.filter((p) => p !== code) : [...prev, code];
      setHasChanges(true);
      return next;
    });
  };

  const handleGroupToggle = (
    groupPerms: { code: string }[],
    forceState?: boolean
  ) => {
    setPermissions((prev) => {
      const codes = groupPerms.map((p) => p.code);

      let shouldSelectAll = forceState;
      if (forceState === undefined) {
        const allSelected = codes.every((c) => prev.includes(c));
        shouldSelectAll = !allSelected;
      }

      setHasChanges(true);

      if (!shouldSelectAll) {
        return prev.filter((c) => !codes.includes(c));
      } else {
        return Array.from(new Set([...prev, ...codes]));
      }
    });
  };

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      const allCodes = PERMISSION_GROUPS.flatMap((g) =>
        g.permissions.map((p) => p.code)
      );
      setPermissions(allCodes as string[]);
    } else {
      setPermissions([]);
    }
    setHasChanges(true);
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

  const filteredGroups = useMemo(() => {
    if (!filterQuery) return PERMISSION_GROUPS;
    const lowerQuery = filterQuery.toLowerCase();

    return PERMISSION_GROUPS.map((group) => {
      const groupMatches = group.label.toLowerCase().includes(lowerQuery);
      const matchingPermissions = group.permissions.filter(
        (p) =>
          p.label.toLowerCase().includes(lowerQuery) ||
          p.code.toLowerCase().includes(lowerQuery)
      );

      if (groupMatches) return group; 
      if (matchingPermissions.length > 0) {
        return { ...group, permissions: matchingPermissions }; 
      }
      return null;
    }).filter(Boolean) as PermissionGroup[];
  }, [filterQuery]);

  const totalPermissions = PERMISSION_GROUPS.reduce(
    (acc, g) => acc + g.permissions.length,
    0
  );
  const selectedCount = permissions.length;
  const isAllSelected =
    selectedCount === totalPermissions && totalPermissions > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose()}>
      <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-slate-800 bg-[#1C1C1C] shrink-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Shield className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  Phân Quyền:{" "}
                  <span className="text-primary">{role.TenNhomNguoiDung}</span>
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Điều chỉnh chi tiết quyền truy cập chức năng cho nhóm người
                  dùng này.
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                <Input
                  placeholder="Tìm quyền (VD: Xóa, Bán vé)..."
                  className="pl-9 h-9 bg-[#252525] border-slate-700 text-sm focus:border-primary"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2 bg-[#252525] px-3 py-1.5 rounded-lg border border-slate-700">
                <Switch
                  id="select-all-global"
                  checked={isAllSelected}
                  onCheckedChange={handleToggleAll}
                  className="scale-90"
                />
                <Label
                  htmlFor="select-all-global"
                  className="text-sm font-medium cursor-pointer whitespace-nowrap"
                >
                  Tất cả ({totalPermissions})
                </Label>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 bg-[#121212] overflow-y-auto">
          <div className="p-6">
            {filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <SearchX className="size-16 mb-4 text-slate-600" />
                <p className="text-slate-400">
                  Không tìm thấy quyền nào phù hợp với từ khóa.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredGroups.map((group) => {
                  const groupCodes = group.permissions.map((p: { code: Quyen }) => p.code);
                  const selectedInGroup = groupCodes.filter((c: Quyen) =>
                    permissions.includes(c)
                  );
                  const isGroupAllSelected =
                    groupCodes.length > 0 &&
                    selectedInGroup.length === groupCodes.length;

                  return (
                    <div
                      key={group.id}
                      className="rounded-xl border border-slate-800 bg-[#1C1C1C] overflow-hidden shadow-sm"
                    >
                      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/50 bg-[#222]">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", group.color)}>
                            <group.icon className="size-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-200">
                              {group.label}
                            </h4>
                            <p className="text-xs text-slate-500 hidden sm:block">
                              {group.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
                            {selectedInGroup.length}/{groupCodes.length}
                          </span>
                          <Switch
                            checked={isGroupAllSelected}
                            onCheckedChange={(checked) =>
                              handleGroupToggle(group.permissions, checked)
                            }
                            className="data-[state=unchecked]:bg-slate-700"
                          />
                        </div>
                      </div>

                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {group.permissions.map((perm: { code: Quyen; label: string; desc?: string }) => {
                          const isChecked = permissions.includes(perm.code);
                          return (
                            <div
                              key={perm.code}
                              onClick={() => handleToggle(perm.code)}
                              className={cn(
                                "relative flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer group/item select-none",
                                isChecked
                                  ? "bg-primary/5 border-primary/40 shadow-[0_0_10px_-5px_rgba(var(--primary),0.3)]"
                                  : "bg-[#252525] border-slate-800 hover:border-slate-600 hover:bg-[#2a2a2a]"
                              )}
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => handleToggle(perm.code)}
                                className={cn(
                                  "mt-0.5 border-slate-500 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors",
                                  isChecked
                                    ? ""
                                    : "group-hover/item:border-slate-400"
                                )}
                              />
                              <div className="flex-1 space-y-1">
                                <p
                                  className={cn(
                                    "text-sm font-medium leading-none transition-colors",
                                    isChecked
                                      ? "text-primary-foreground"
                                      : "text-slate-300"
                                  )}
                                >
                                  {perm.label}
                                </p>
                                <p className="text-xs text-slate-500 line-clamp-1">
                                  {perm.desc || perm.code}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-800 bg-[#1C1C1C] shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 order-2 sm:order-1">
            <div className="flex flex-col text-sm">
              <span className="text-slate-400">Đã chọn:</span>
              <span className="font-bold text-white text-lg">
                {selectedCount}{" "}
                <span className="text-slate-500 text-sm font-normal">
                  / {totalPermissions} quyền
                </span>
              </span>
            </div>
            {hasChanges && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-medium border border-yellow-500/20 animate-pulse">
                <div className="size-2 bg-yellow-500 rounded-full" />
                Thay đổi chưa lưu
              </div>
            )}
          </div>

          <div className="flex gap-3 order-1 sm:order-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges || isSubmitting}
              className="flex-1 sm:flex-none border-slate-700 hover:bg-slate-800 bg-transparent text-slate-300"
            >
              <RotateCcw className="size-4 mr-2" /> Khôi phục
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSubmitting}
              className={cn(
                "flex-1 sm:flex-none min-w-[140px]",
                hasChanges
                  ? "bg-primary hover:bg-primary/90"
                  : "bg-slate-700 text-slate-400 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Lưu...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" /> Lưu Cấu Hình
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
