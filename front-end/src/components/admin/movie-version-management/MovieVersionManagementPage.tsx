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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import { movieVersionService, MovieVersion } from "@/services/movie-version.service";

const formatVNCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

interface MasterData {
  id: string;
  name: string;
}

export default function MovieVersionManagementPage() {
  const [versions, setVersions] = useState<MovieVersion[]>([]);
  const [filteredVersions, setFilteredVersions] = useState<MovieVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [films, setFilms] = useState<MasterData[]>([]);
  const [formats, setFormats] = useState<MasterData[]>([]);
  const [languages, setLanguages] = useState<MasterData[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<MovieVersion | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    MaPhim: "",
    MaDinhDang: "",
    MaNgonNgu: "",
    GiaVe: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [filmsData, formatsData, languagesData] = await Promise.all([
        movieVersionService.getFilms(),
        movieVersionService.getFormats(),
        movieVersionService.getLanguages(),
      ]);

      const unwrapData = (data: any) => {
          if (Array.isArray(data)) return data;
          if (data && Array.isArray(data.data)) return data.data;
          return [];
      };

      const films_array = unwrapData(filmsData);
      const formats_array = unwrapData(formatsData);
      const languages_array = unwrapData(languagesData);

      setFilms(films_array.map((f: any) => ({ id: f.MaPhim, name: f.TenHienThi })));
      setFormats(formats_array.map((f: any) => ({ id: f.MaDinhDang || f.id, name: f.TenDinhDang })));
      setLanguages(languages_array.map((l: any) => ({ id: l.MaNgonNgu || l.id, name: l.TenNgonNgu })));

      const flatVersions: MovieVersion[] = [];
      films_array.forEach((film: any) => {
        if (film.PhienBanPhims && Array.isArray(film.PhienBanPhims)) {
          film.PhienBanPhims.forEach((pv: any) => {
            const realId = pv.MaPhienBanPhim; 

            if (realId) {
                flatVersions.push({
                  id: realId, 
                  MaPhim: film.MaPhim,
                  TenPhim: film.TenHienThi,
                  MaDinhDang: pv.MaDinhDang,
                  TenDinhDang: pv.DinhDang?.TenDinhDang || "N/A",
                  MaNgonNgu: pv.MaNgonNgu,
                  TenNgonNgu: pv.NgonNgu?.TenNgonNgu || "N/A",
                  GiaVe: Number(pv.GiaVe),
                });
            }
          });
        }
      });

      setVersions(flatVersions);
      setFilteredVersions(flatVersions);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = versions.filter(
      (v) =>
        v.TenPhim.toLowerCase().includes(lowerSearch) ||
        v.TenDinhDang.toLowerCase().includes(lowerSearch)
    );
    setFilteredVersions(filtered);
  }, [searchTerm, versions]);

  const handleOpenCreate = () => {
    setCurrentVersion(null);
    setFormData({ MaPhim: "", MaDinhDang: "", MaNgonNgu: "", GiaVe: 0 });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (version: MovieVersion) => {
    setCurrentVersion(version);
    setFormData({
      MaPhim: version.MaPhim,
      MaDinhDang: version.MaDinhDang,
      MaNgonNgu: version.MaNgonNgu,
      GiaVe: version.GiaVe,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      if (!formData.MaPhim || !formData.MaDinhDang || !formData.MaNgonNgu || formData.GiaVe <= 0) {
        toast.warning("Vui lòng điền đầy đủ thông tin hợp lệ");
        return;
      }

      setIsSubmitting(true);

      if (currentVersion) {
        await movieVersionService.update(currentVersion.id, formData);
        toast.success("Cập nhật thành công");
      } else {
        await movieVersionService.create(formData);
        toast.success("Tạo mới thành công");
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra (kiểm tra lại kết nối hoặc dữ liệu)");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentVersion) return;
    try {
      await movieVersionService.delete(currentVersion.id);
      toast.success("Xóa thành công");
      setIsDeleteAlertOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Xóa thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <h1 className="text-2xl font-bold">Quản Lý Phiên Bản Phim</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên phim..."
              className="pl-8"
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
              <TableHead>Tên Phim</TableHead>
              <TableHead>Định Dạng</TableHead>
              <TableHead>Ngôn Ngữ</TableHead>
              <TableHead>Giá Vé</TableHead>
              <TableHead className="text-right">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : filteredVersions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              filteredVersions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.TenPhim}</TableCell>
                  <TableCell>{item.TenDinhDang}</TableCell>
                  <TableCell>{item.TenNgonNgu}</TableCell>
                  <TableCell>{formatVNCurrency(item.GiaVe)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCurrentVersion(item);
                        setIsDeleteAlertOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
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
            <DialogTitle>{currentVersion ? "Cập Nhật Phiên Bản" : "Tạo Phiên Bản Mới"}</DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết cho phiên bản phim bên dưới.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Phim</Label>
              <div className="col-span-3">
                <Select
                  value={formData.MaPhim}
                  onValueChange={(val) => setFormData({ ...formData, MaPhim: val })}
                  disabled={!!currentVersion} 
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phim" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {films.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Định Dạng</Label>
              <div className="col-span-3">
                <Select
                  value={formData.MaDinhDang}
                  onValueChange={(val) => setFormData({ ...formData, MaDinhDang: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn định dạng" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {formats.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Ngôn Ngữ</Label>
              <div className="col-span-3">
                <Select
                  value={formData.MaNgonNgu}
                  onValueChange={(val) => setFormData({ ...formData, MaNgonNgu: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ngôn ngữ" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {languages.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Giá Vé</Label>
              <div className="col-span-3">
                <Input
                  type="number"
                  value={formData.GiaVe}
                  onChange={(e) => setFormData({ ...formData, GiaVe: Number(e.target.value) })}
                />
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentVersion ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa phiên bản phim này khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}