/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Plus,
  Edit,
  Loader2,
  User,
  Users,
  CalendarIcon,
  Trash2,
  Lock,
  Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { employeeService } from "@/services/employee.service";
import { customerService } from "@/services/customer.service";
import { userService } from "@/services/user.service";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const ROLES = [
  { value: 2, label: "QL Phim & Lịch chiếu" },
  { value: 3, label: "Nhân viên Bán vé" },
  { value: 4, label: "Nhân viên Soát vé" },
];

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState("employees");

  return (
    <div className="space-y-6 text-white h-[calc(100vh-100px)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="size-6 text-primary" />
            Quản lý Người dùng
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Quản lý tài khoản nhân viên và thông tin khách hàng.
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="bg-[#1C1C1C] border border-slate-800 w-fit">
          <TabsTrigger
            value="employees"
            className="data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Danh sách Nhân viên
          </TabsTrigger>
          <TabsTrigger
            value="customers"
            className="data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Danh sách Khách hàng
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 mt-4 min-h-0 relative">
          <TabsContent
            value="employees"
            className="h-full mt-0 absolute inset-0"
          >
            <EmployeeManager />
          </TabsContent>
          <TabsContent
            value="customers"
            className="h-full mt-0 absolute inset-0"
          >
            <CustomerManager />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function EmployeeManager() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [employeeToDelete, setEmployeeToDelete] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionUser, setActionUser] = useState<{
    user: any;
    type: "lock" | "unlock";
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res: any = await employeeService.getAll();
      const rawData = Array.isArray(res) ? res : res.data || [];

      const mappedData = rawData.map((item: any) => {
        const user = item.NguoiDungPhanMem || {};
        return {
          ...item,
          HoTen: user.HoTen || "Không tên",
          Email: user.Email || "",
          SoDienThoai: user.SoDienThoai,
          MaNhomNguoiDung: user.MaNhomNguoiDung,
          NguoiDung: {
            ...user,
            AvatarUrl: user.AvatarUrl,
            TrangThaiNguoiDung: user.TrangThai || "CHUAKICHHOAT",
          },
          TrangThai: item.TrangThai,
        };
      });

      setEmployees(mappedData);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filtered = employees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = emp.HoTen?.toLowerCase().includes(term) || false;
    const emailMatch = emp.Email?.toLowerCase().includes(term) || false;
    return nameMatch || emailMatch;
  });

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingUser) {
        const updatePayload = {
          TrangThai: data.TrangThai,
          NgayVaoLam: format(data.NgayVaoLam, "yyyy-MM-dd"),
        };
        await employeeService.update(editingUser.MaNhanVien, updatePayload);
        toast.success("Cập nhật trạng thái nhân viên thành công!");
      } else {


        const createPayload = {
          Email: data.Email,
          MatKhau: data.MatKhau,
          HoTen: data.HoTen,
          NgayVaoLam: data.NgayVaoLam
            ? format(data.NgayVaoLam, "yyyy-MM-dd")
            : format(new Date(), "yyyy-MM-dd"),
        };

        await userService.assignEmployee(createPayload);
        toast.success("Tạo tài khoản nhân viên thành công!");
      }

      setIsModalOpen(false);
      fetchEmployees();
    } catch (error: any) {
      console.error("Submit Error:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi lưu dữ liệu"
      );
    }
  };

  const handleToggleLockStatus = async () => {
    if (!actionUser) return;
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const userId = actionUser.user.NguoiDung?.MaNguoiDung;
      if (!userId) {
        toast.error("Không tìm thấy mã người dùng");
        return;
      }

      if (actionUser.type === "lock") {
        await userService.lockUser(userId);
        toast.success(`Đã khóa tài khoản ${actionUser.user.HoTen}`);
      } else {
        await userService.unlockUser(userId);
        toast.success(`Đã mở khóa tài khoản ${actionUser.user.HoTen}`);
      }

      setActionUser(null);
      fetchEmployees(); 
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Lỗi khi cập nhật trạng thái tài khoản"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const renderAccountStatusBadge = (status: string) => {
    switch (status) {
      case "CONHOATDONG":
        return (
          <Badge
            variant="outline"
            className="text-blue-500 border-blue-500/30 bg-blue-500/10"
          >
            Active
          </Badge>
        );
      case "KHONGHOATDONG":
      case "BIKHOA":
        return (
          <Badge
            variant="outline"
            className="text-red-500 border-red-500/30 bg-red-500/10"
          >
            Locked
          </Badge>
        );
      case "CHUAKICHHOAT":
        return (
          <Badge
            variant="outline"
            className="text-yellow-500 border-yellow-500/30 bg-yellow-500/10"
          >
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-slate-500">
            Unknown ({status})
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex justify-between items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Tìm nhân viên (Tên, Email)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#1C1C1C] border-slate-700 focus:border-primary"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        </div>
        <Button
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="size-4 mr-2" /> Thêm nhân viên
        </Button>
      </div>

      <Card className="bg-[#1C1C1C] border-slate-800 flex-1 overflow-hidden">
        <CardContent className="p-0 h-full overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-[#1C1C1C] z-10 shadow-sm">
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-100">Nhân viên</TableHead>
                <TableHead className="text-slate-100">Chức vụ</TableHead>
                <TableHead className="text-slate-100">Liên hệ</TableHead>
                <TableHead className="text-slate-100">Ngày vào làm</TableHead>
                <TableHead className="text-slate-100 text-center">
                  Trạng thái
                </TableHead>
                <TableHead className="text-right text-slate-100">
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="animate-spin size-6 mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-slate-500"
                  >
                    Không tìm thấy nhân viên nào.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((emp) => {
                  const accountStatus = emp.NguoiDung?.TrangThaiNguoiDung;
                  const isAccountActive = accountStatus === "CONHOATDONG";
                  const roleLabel = emp.MaNhomNguoiDung
                    ? ROLES.find((r) => r.value === emp.MaNhomNguoiDung)?.label || "Nhân viên"
                    : emp.NguoiDung?.VaiTro || "Nhân viên";

                  return (
                    <TableRow
                      key={emp.MaNhanVien}
                      className="border-slate-800 hover:bg-slate-800/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9 border border-slate-700">
                            <AvatarImage src={emp.NguoiDung?.AvatarUrl} />
                            <AvatarFallback className="bg-slate-700">
                              <User className="size-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-slate-200">
                              {emp.HoTen}
                            </div>
                            <div className="text-xs text-slate-500">
                              Mã: {emp.MaNhanVien.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-slate-800 hover:bg-slate-700"
                        >
                          {emp.MaNhomNguoiDung === 2
                            ? "QL Phim & Lịch chiếu"
                            : emp.MaNhomNguoiDung === 3
                            ? "NV Bán vé"
                            : emp.MaNhomNguoiDung === 4
                            ? "NV Soát vé"
                            : "Nhân viên"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-300">
                          {emp.Email}
                        </div>
                        <div className="text-xs text-slate-500">
                          {emp.SoDienThoai || "---"}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {emp.NgayVaoLam
                          ? format(new Date(emp.NgayVaoLam), "dd/MM/yyyy", {
                              locale: vi,
                            })
                          : "-"}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            emp.TrangThai === "CONLAM"
                              ? "text-green-500 border-green-500/30 bg-green-500/10"
                              : "text-slate-500 border-slate-500 bg-slate-500/10"
                          )}
                        >
                          {emp.TrangThai === "CONLAM" ? "Đang làm" : "Đã nghỉ"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        {renderAccountStatusBadge(accountStatus)}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost" size="icon"
                            className="hover:bg-slate-800 text-blue-400 hover:text-blue-300"
                            onClick={() => {
                              setEditingUser(emp);
                              setIsModalOpen(true);
                            }}
                          >
                            <Edit className="size-4" />
                          </Button>

                          {isAccountActive ? (
                            <Button
                              variant="ghost" size="icon"
                              className="hover:bg-slate-800 text-orange-400 hover:text-orange-300"
                              title="Khóa tài khoản"
                              onClick={() => setActionUser({ user: emp, type: 'lock' })}
                            >
                              <Lock className="size-4" />
                            </Button>
                          ) : (
                             <Button
                              variant="ghost" size="icon"
                              className="hover:bg-slate-800 text-green-400 hover:text-green-300"
                              title="Mở khóa tài khoản"
                              onClick={() => setActionUser({ user: emp, type: 'unlock' })}
                            >
                              <Unlock className="size-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EmployeeFormDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        user={editingUser}
      />

      <AlertDialog
        open={!!actionUser}
        onOpenChange={(open) => !open && setActionUser(null)}
      >
        <AlertDialogContent className="bg-[#1C1C1C] border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionUser?.type === "lock"
                ? "Khóa tài khoản nhân viên?"
                : "Mở khóa tài khoản nhân viên?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Bạn có chắc chắn muốn{" "}
              {actionUser?.type === "lock" ? "khóa" : "mở khóa"} tài khoản
              <b> {actionUser?.user?.HoTen}</b>?
              {actionUser?.type === "lock" && (
                <span className="block mt-2 text-yellow-500/80 text-xs">
                  Nhân viên sẽ không thể đăng nhập vào hệ thống.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-transparent border-slate-700 hover:bg-slate-800 text-white hover:text-white"
              disabled={isProcessing}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleToggleLockStatus();
              }}
              className={cn(
                "text-white",
                actionUser?.type === "lock"
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-green-600 hover:bg-green-700"
              )}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="animate-spin size-4" />
              ) : actionUser?.type === "lock" ? (
                "Khóa"
              ) : (
                "Mở khóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CustomerManager() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [actionCustomer, setActionCustomer] = useState<{
    user: any;
    type: "lock" | "unlock";
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res: any = await customerService.getAll();
      const rawData = Array.isArray(res) ? res : res.data || [];

      const mappedData = rawData.map((item: any) => {
        const user = item.NguoiDungPhanMem || {};
        return {
          ...item,
          HoTen: user.HoTen || "Khách hàng",
          Email: user.Email || "",
          SoDienThoai: user.SoDienThoai,
          NguoiDung: {
            ...user,
            AvatarUrl: user.AvatarUrl,
            TrangThaiNguoiDung: user.TrangThai || "CHUAKICHHOAT",
          },
        };
      });

      setCustomers(mappedData);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleLockStatus = async () => {
    if (!actionCustomer) return;
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const userId = actionCustomer.user.NguoiDung?.MaNguoiDung;
      if (!userId) {
        toast.error("Không tìm thấy mã người dùng");
        return;
      }

      if (actionCustomer.type === "lock") {
        await userService.lockUser(userId);
        toast.success("Đã khóa khách hàng thành công");
      } else {
        await userService.unlockUser(userId);
        toast.success("Đã mở khóa khách hàng thành công");
      }

      setActionCustomer(null);
      fetchCustomers();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Lỗi khi cập nhật trạng thái"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const filtered = customers.filter((cus) => {
    const term = searchTerm.toLowerCase();
    return (
      cus.HoTen?.toLowerCase().includes(term) ||
      cus.Email?.toLowerCase().includes(term)
    );
  });

  const renderAccountStatusBadge = (status: string) => {
    switch (status) {
      case "CONHOATDONG":
        return (
          <Badge
            variant="outline"
            className="text-green-500 border-green-500/30 bg-green-500/10"
          >
            Active
          </Badge>
        );
      case "KHONGHOATDONG":
        return (
          <Badge
            variant="outline"
            className="text-red-500 border-red-500/30 bg-red-500/10"
          >
            Locked
          </Badge>
        );
      case "CHUAKICHHOAT":
        return (
          <Badge
            variant="outline"
            className="text-yellow-500 border-yellow-500/30 bg-yellow-500/10"
          >
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-slate-500">
            Unknown
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="relative w-full max-w-sm">
        <Input
          placeholder="Tìm khách hàng (Tên, Email)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-[#1C1C1C] border-slate-700 focus:border-primary"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
      </div>

      <Card className="bg-[#1C1C1C] border-slate-800 flex-1 overflow-hidden">
        <CardContent className="p-0 h-full overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-[#1C1C1C] z-10 shadow-sm">
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-100">Khách hàng</TableHead>
                <TableHead className="text-slate-100">Liên hệ</TableHead>
                <TableHead className="text-slate-100">Ngày đăng ký</TableHead>
                <TableHead className="text-slate-100 text-center">
                  Trạng thái
                </TableHead>
                <TableHead className="text-right text-slate-100">
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="animate-spin size-6 mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-slate-500"
                  >
                    Không tìm thấy khách hàng nào.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((cus) => {
                  const accountStatus = cus.NguoiDung?.TrangThaiNguoiDung;
                  const isAccountActive = accountStatus === "CONHOATDONG";

                  return (
                    <TableRow
                      key={cus.MaKhachHang}
                      className="border-slate-800 hover:bg-slate-800/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9 border border-slate-700">
                            <AvatarImage src={cus.NguoiDung?.AvatarUrl} />
                            <AvatarFallback className="bg-slate-700">
                              <User className="size-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-slate-200">
                              {cus.HoTen}
                            </div>
                            <div
                              className="text-xs text-slate-500"
                              title={cus.MaKhachHang}
                            >
                              Code: {cus.MaKhachHang.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-300">
                          {cus.Email}
                        </div>
                        <div className="text-xs text-slate-500">
                          {cus.SoDienThoai || "---"}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {cus.CreatedAt
                          ? format(new Date(cus.CreatedAt), "dd/MM/yyyy", {
                              locale: vi,
                            })
                          : "-"}
                      </TableCell>

                      <TableCell className="text-center">
                        {renderAccountStatusBadge(accountStatus)}
                      </TableCell>

                      <TableCell className="text-right">
                        {isAccountActive ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-slate-800 text-red-400 hover:text-red-300"
                            title="Khóa tài khoản"
                            onClick={() =>
                              setActionCustomer({ user: cus, type: "lock" })
                            }
                          >
                            <Lock className="size-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-slate-800 text-green-400 hover:text-green-300"
                            title="Mở khóa tài khoản"
                            onClick={() =>
                              setActionCustomer({ user: cus, type: "unlock" })
                            }
                          >
                            <Unlock className="size-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!actionCustomer}
        onOpenChange={(open) => !open && setActionCustomer(null)}
      >
        <AlertDialogContent className="bg-[#1C1C1C] border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionCustomer?.type === "lock"
                ? "Khóa khách hàng?"
                : "Mở khóa khách hàng?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Hành động này sẽ{" "}
              {actionCustomer?.type === "lock" ? "khóa" : "mở khóa"} tài khoản
              của khách hàng <b>{actionCustomer?.user?.HoTen}</b>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-transparent border-slate-700 hover:bg-slate-800 text-white hover:text-white"
              disabled={isProcessing}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleToggleLockStatus();
              }}
              className={cn(
                "text-white",
                actionCustomer?.type === "lock"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              )}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="animate-spin size-4" />
              ) : actionCustomer?.type === "lock" ? (
                "Khóa"
              ) : (
                "Mở khóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmployeeFormDialog({ isOpen, onClose, onSubmit, user }: any) {
  const [formData, setFormData] = useState({
    HoTen: "",
    Email: "",
    SoDienThoai: "",
    MatKhau: "",
    MaNhomNguoiDung: "2",
    NgayVaoLam: new Date(),
    TrangThai: "CONLAM",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          HoTen: user.HoTen || "",
          Email: user.Email || "",
          SoDienThoai: user.SoDienThoai || "",
          MatKhau: "",
          MaNhomNguoiDung: user.MaNhomNguoiDung?.toString() || "2",
          NgayVaoLam: user.NgayVaoLam ? new Date(user.NgayVaoLam) : new Date(),
          TrangThai: user.TrangThai || "CONLAM",
        });
      } else {
        setFormData({
          HoTen: "",
          Email: "",
          SoDienThoai: "",
          MatKhau: "",
          MaNhomNguoiDung: "2",
          NgayVaoLam: new Date(),
          TrangThai: "CONLAM",
        });
      }
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        MaNhomNguoiDung: Number(formData.MaNhomNguoiDung),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {user ? "Cập nhật nhân viên" : "Tạo tài khoản nhân viên mới"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>
              Họ tên <span className="text-red-500">*</span>
            </Label>
            <Input
              required
              disabled={!!user} 
              value={formData.HoTen}
              onChange={(e) =>
                setFormData({ ...formData, HoTen: e.target.value })
              }
              className="bg-transparent border-slate-700 focus:border-primary disabled:opacity-50"
              placeholder="VD: Nguyễn Văn A"
            />
          </div>


            <div className="space-y-2">
              <Label>
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                required
                type="email"
                disabled={!!user}
                value={formData.Email}
                onChange={(e) =>
                  setFormData({ ...formData, Email: e.target.value })
                }
                className="bg-transparent border-slate-700 focus:border-primary disabled:opacity-50"
                placeholder="staff@example.com"
              />
            </div>
          
          

          {!user && (
            <div className="space-y-2">
              <Label>
                Mật khẩu khởi tạo <span className="text-red-500">*</span>
              </Label>
              <Input
                required
                type="password"
                minLength={6}
                value={formData.MatKhau}
                onChange={(e) =>
                  setFormData({ ...formData, MatKhau: e.target.value })
                }
                className="bg-transparent border-slate-700 focus:border-primary"
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Chức vụ</Label>
              <Select
                disabled={true}
                value={formData.MaNhomNguoiDung}
                onValueChange={(v) =>
                  setFormData({ ...formData, MaNhomNguoiDung: v })
                }
              >
                <SelectTrigger className="bg-transparent border-slate-700 focus:ring-offset-0 disabled:opacity-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1C] border-slate-700 text-white">
                  {ROLES.map((r) => (
                    <SelectItem
                      key={r.value}
                      value={r.value.toString()}
                      className="cursor-pointer hover:bg-slate-800"
                    >
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ngày vào làm</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-transparent border-slate-700 hover:bg-slate-800 hover:text-white",
                      !formData.NgayVaoLam && "text-slate-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.NgayVaoLam ? (
                      format(formData.NgayVaoLam, "dd/MM/yyyy", {
                        locale: vi,
                      })
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-slate-700 text-white">
                  <Calendar
                    mode="single"
                    selected={formData.NgayVaoLam}
                    onSelect={(date) =>
                      date && setFormData({ ...formData, NgayVaoLam: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {user && (
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={formData.TrangThai}
                onValueChange={(v) =>
                  setFormData({ ...formData, TrangThai: v })
                }
              >
                <SelectTrigger className="bg-transparent border-slate-700 focus:ring-offset-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1C] border-slate-700 text-white">
                  <SelectItem value="CONLAM">Đang làm việc</SelectItem>
                  <SelectItem value="DANGHI">Đã nghỉ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="mt-4 border-t border-slate-800 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="hover:text-white hover:bg-slate-800"
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin size-4 mr-2" />}
              {user ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
