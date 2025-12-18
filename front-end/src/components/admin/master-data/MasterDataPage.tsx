/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";

export interface ColumnConfig {
  accessorKey: string;
  header: string;
  type: "text" | "number" | "textarea";
  required?: boolean;
  formatValue?: (value: any) => string | number;
}

interface MasterDataPageProps {
  title: string;
  entityName: string;
  idField: string;
  columns: ColumnConfig[];

  fetchData: () => Promise<any[]>;
  createItem: (data: any) => Promise<any>;
  updateItem: (id: string, data: any) => Promise<any>;
  deleteItem: (id: string) => Promise<any>;
}

export default function MasterDataPage({
  title,
  entityName,
  idField,
  columns,
  fetchData,
  createItem,
  updateItem,
  deleteItem,
}: MasterDataPageProps) {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any | null>(null);

  const [formData, setFormData] = useState<Record<string, any>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchData();
      setData(res);
      setFilteredData(res);
    } catch (error) {
      console.error(error);
      toast.error(`Lỗi tải danh sách ${entityName}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data);
    } else {
      const lower = searchTerm.toLowerCase();
      const searchKey = columns[0].accessorKey;
      const filtered = data.filter((item) =>
        String(item[searchKey]).toLowerCase().includes(lower)
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, data, columns]);

  const handleOpenCreate = () => {
    setCurrentItem(null);
    const initData: any = {};
    columns.forEach(
      (col) => (initData[col.accessorKey] = col.type === "number" ? 0 : "")
    );
    setFormData(initData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setCurrentItem(item);
    setFormData({ ...item });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    for (const col of columns) {
      if (
        col.required &&
        (formData[col.accessorKey] === undefined ||
          formData[col.accessorKey] === "")
      ) {
        toast.warning(`Vui lòng nhập ${col.header}`);
        return;
      }
    }

    try {
      const payload: any = {};

      columns.forEach((col) => {
        const value = formData[col.accessorKey];
        if (col.type === "number") {
          payload[col.accessorKey] = Number(value);
        } else {
          payload[col.accessorKey] = value;
        }
      });

      setIsDialogOpen(false);

      const promise = currentItem
        ? updateItem(currentItem[idField], payload)
        : createItem(payload);

      toast.promise(promise, {
        loading: "Đang xử lý...",
        success: () => {
          loadData();
          return currentItem ? "Cập nhật thành công!" : "Tạo mới thành công!";
        },
        error: (err: any) => {
          return err?.response?.data?.message || "Có lỗi xảy ra";
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!currentItem) return;
    try {
      await deleteItem(currentItem[idField]);
      toast.success("Xóa thành công");
      setIsDeleteAlertOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      toast.error("Xóa thất bại (Dữ liệu đang được sử dụng)");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Tìm kiếm...`}
              className="pl-8 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" /> Thêm Mới
          </Button>
        </div>
      </div>

      <div className="border rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">STT</TableHead>
              {columns.map((col) => (
                <TableHead key={col.accessorKey}>{col.header}</TableHead>
              ))}
              <TableHead className="text-right">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 2}
                  className="text-center py-8"
                >
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 2}
                  className="text-center py-8 text-muted-foreground"
                >
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item, index) => (
                <TableRow key={item[idField]}>
                  <TableCell className="font-medium text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.accessorKey}>
                      {col.formatValue
                        ? col.formatValue(item[col.accessorKey])
                        : item[col.accessorKey]}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(item)}
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCurrentItem(item);
                        setIsDeleteAlertOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>
              {currentItem
                ? `Cập nhật ${entityName}`
                : `Thêm ${entityName} Mới`}
            </DialogTitle>
            <DialogDescription>
              Nhập thông tin bên dưới để lưu vào hệ thống.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {columns.map((col) => (
              <div key={col.accessorKey} className="grid gap-2">
                <Label htmlFor={col.accessorKey}>{col.header}</Label>
                {col.type === "textarea" ? (
                  <Textarea
                    id={col.accessorKey}
                    value={formData[col.accessorKey] || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [col.accessorKey]: e.target.value,
                      })
                    }
                    placeholder={`Nhập ${col.header.toLowerCase()}...`}
                  />
                ) : (
                  <Input
                    id={col.accessorKey}
                    type={col.type === "number" ? "number" : "text"}
                    value={
                      formData[col.accessorKey] ||
                      (col.type === "number" ? 0 : "")
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [col.accessorKey]: e.target.value,
                      })
                    }
                    placeholder={`Nhập ${col.header.toLowerCase()}...`}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
