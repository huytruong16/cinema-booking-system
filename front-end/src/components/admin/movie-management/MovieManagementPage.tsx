"use client";

import React, { useState, useMemo } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from "date-fns";
import { vi } from "date-fns/locale";

type TrangThaiPhim = "SAPCHIEU" | "DANGCHIEU" | "NGUNGCHIEU";

interface Phim {
  MaPhim: number;
  TenPhim: string;
  PosterUrl: string | null;
  TomTatNoiDung: string | null;
  DaoDien: string | null;
  DanhSachDienVien: string | null;
  QuocGia: string | null;
  TrailerUrl: string | null;
  ThoiLuong: number;
  NgayBatDauChieu: Date;
  NgayKetThucChieu: Date;
  DiemDanhGia: number | null;
  TrangThaiPhim: TrangThaiPhim;
}

const mockMovies: Phim[] = [
  {
    MaPhim: 1,
    TenPhim: "Inside Out 2",
    PosterUrl: "https://upload.wikimedia.org/wikipedia/vi/thumb/a/a3/Inside_Out_2_VN_poster.jpg/375px-Inside_Out_2_VN_poster.jpg",
    TomTatNoiDung: "Riley bước vào tuổi dậy thì, đối mặt với những cảm xúc mới mẻ và hỗn loạn, bao gồm Lo Âu, Ganh Tị, Xấu Hổ và Chán Nản.",
    DaoDien: "Kelsey Mann",
    DanhSachDienVien: "Amy Poehler, Maya Hawke, Kensington Tallman, Liza Lapira, Tony Hale",
    QuocGia: "Mỹ",
    TrailerUrl: "https://www.youtube.com/watch?v=VtMinG-h9pw",
    ThoiLuong: 96,
    NgayBatDauChieu: new Date("2024-06-14"),
    NgayKetThucChieu: new Date("2024-08-14"),
    DiemDanhGia: 8.5,
    TrangThaiPhim: "DANGCHIEU",
  },
  {
    MaPhim: 2,
    TenPhim: "Deadpool & Wolverine",
    PosterUrl: "https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg",
    TomTatNoiDung: "Deadpool hợp tác cùng Wolverine trong hành trình cứu vãn đa vũ trụ đầy máu lửa và những câu đùa phá vỡ bức tường thứ tư.",
    DaoDien: "Shawn Levy",
    DanhSachDienVien: "Ryan Reynolds, Hugh Jackman, Emma Corrin, Morena Baccarin",
    QuocGia: "Mỹ",
    TrailerUrl: "https://www.youtube.com/watch?v=u-1INomf-Y",
    ThoiLuong: 127,
    NgayBatDauChieu: new Date("2024-07-26"),
    NgayKetThucChieu: new Date("2024-09-26"),
    DiemDanhGia: 9.1,
    TrangThaiPhim: "SAPCHIEU",
  },
    {
    MaPhim: 3,
    TenPhim: "Kẻ Trộm Mặt Trăng 4",
    PosterUrl: "https://upload.wikimedia.org/wikipedia/en/e/ed/Despicable_Me_4_Theatrical_Release_Poster.jpeg",
    TomTatNoiDung: "Gru và gia đình phải đối mặt với một kẻ thù mới, trong khi Minions lại tạo nên loạn xạ với phiên bản siêu anh hùng.",
    DaoDien: "Chris Renaud",
    DanhSachDienVien: "Steve Carell, Kristen Wiig, Will Ferrell, Pierre Coffin",
    QuocGia: "Mỹ",
    TrailerUrl: "https://www.youtube.com/watch?v=qQ4b9i9i0I",
    ThoiLuong: 95,
    NgayBatDauChieu: new Date("2024-05-01"),
    NgayKetThucChieu: new Date("2024-06-30"),
    DiemDanhGia: 7.8,
    TrangThaiPhim: "NGUNGCHIEU",
  },
];

const trangThaiOptions: { value: TrangThaiPhim; label: string }[] = [
  { value: "SAPCHIEU", label: "Sắp chiếu" },
  { value: "DANGCHIEU", label: "Đang chiếu" },
  { value: "NGUNGCHIEU", label: "Ngừng chiếu" },
];

export default function MovieManagementPage() {
  const [movies, setMovies] = useState<Phim[]>(mockMovies);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Phim | null>(null);
  
  const [selectedMovieForDetail, setSelectedMovieForDetail] = useState<Phim | null>(null);

  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      const matchesSearch = movie.TenPhim.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || movie.TrangThaiPhim === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [movies, searchTerm, statusFilter]);

  const handleAddNew = () => {
    setEditingMovie(null); 
    setIsModalOpen(true);
  };
  const handleEdit = (movie: Phim) => {
    setEditingMovie(movie); 
    setIsModalOpen(true);
  };
  const handleFormSubmit = (formData: Phim) => {
    if (editingMovie) {
        setMovies(prev => prev.map(m => m.MaPhim === formData.MaPhim ? formData : m));
        if (selectedMovieForDetail?.MaPhim === formData.MaPhim) {
            setSelectedMovieForDetail(formData);
        }
    } else {
        setMovies(prev => [...prev, { ...formData, MaPhim: Math.max(...prev.map(m => m.MaPhim)) + 1 }]);
    }
    setIsModalOpen(false);
  };
  const handleDelete = (maPhim: number) => {
      setMovies(prev => prev.filter(m => m.MaPhim !== maPhim));
      if (selectedMovieForDetail?.MaPhim === maPhim) {
          setSelectedMovieForDetail(null);
      }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-white">
      
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quản lý Phim</h1>
          <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
            <Plus className="size-4 mr-2" />
            Thêm phim mới
          </Button>
        </div>

        <div className="flex gap-4 justify-between">
          <div className="relative w-full max-w-sm">
            <Input
              placeholder="Tìm kiếm theo tên phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-transparent border-slate-700"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-transparent border-slate-700">
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

        <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-100">Tên phim</TableHead>
                  <TableHead className="text-slate-100">Trạng thái</TableHead>
                  <TableHead className="text-slate-100">Thời lượng</TableHead>
                  <TableHead className="text-right text-slate-100">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovies.map((movie) => (
                  <TableRow 
                    key={movie.MaPhim} 
                    className={cn(
                        "border-slate-800 cursor-pointer",
                        selectedMovieForDetail?.MaPhim === movie.MaPhim && "bg-slate-800/50"
                    )}
                    onClick={() => setSelectedMovieForDetail(movie)}
                  >
                    <TableCell className="font-medium">{movie.TenPhim}</TableCell>
                    <TableCell>
                      <Badge variant={
                          movie.TrangThaiPhim === "DANGCHIEU" ? "default" :
                          (movie.TrangThaiPhim === "SAPCHIEU" ? "secondary" : "outline")
                      } className={cn(
                          movie.TrangThaiPhim === "DANGCHIEU" && "bg-green-600 text-white",
                          movie.TrangThaiPhim === "SAPCHIEU" && "bg-blue-600 text-white",
                          movie.TrangThaiPhim === "NGUNGCHIEU" && "bg-slate-600 text-slate-200 border-slate-500"
                      )}>
                          {trangThaiOptions.find(o => o.value === movie.TrangThaiPhim)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{movie.ThoiLuong} phút</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(movie); }}>
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
                              Hành động này không thể hoàn tác. Phim &quot;{movie.TenPhim}&quot; sẽ bị xóa vĩnh viễn.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-transparent border-slate-700 hover:bg-slate-800">Hủy</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={(e) => { e.stopPropagation(); handleDelete(movie.MaPhim); }}
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

      <div className="lg:col-span-1">
        {selectedMovieForDetail ? (
            <MovieDetailPanel 
                movie={selectedMovieForDetail} 
                onClose={() => setSelectedMovieForDetail(null)}
                onEdit={() => handleEdit(selectedMovieForDetail)}
            />
        ) : (
            <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg sticky top-24 flex items-center justify-center h-96">
                <p className="text-slate-500">Chọn một phim để xem thông tin</p>
            </Card>
        )}
      </div>

      {isModalOpen && (
        <MovieFormDialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          movie={editingMovie}
        />
      )}
    </div>
  );
}

function MovieDetailPanel({ movie, onEdit }: { movie: Phim; onClose: () => void; onEdit: () => void; }) {
    return (
        <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg sticky top-24">
            <CardHeader className="relative">
                <CardTitle className="text-xl font-semibold text-slate-100 pr-10">{movie.TenPhim}</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[65vh]">
                    <div className="space-y-4 pr-6">
                        {movie.PosterUrl && (
                            <div className="relative aspect-[1.25] w-full rounded-lg overflow-hidden">
                                <Image src={movie.PosterUrl} alt={movie.TenPhim} fill className="object-contain" />
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <Badge variant={
                                movie.TrangThaiPhim === "DANGCHIEU" ? "default" :
                                (movie.TrangThaiPhim === "SAPCHIEU" ? "secondary" : "outline")
                            } className={cn(
                                "text-xs", 
                                movie.TrangThaiPhim === "DANGCHIEU" && "bg-green-600 text-white",
                                movie.TrangThaiPhim === "SAPCHIEU" && "bg-blue-600 text-white",
                                movie.TrangThaiPhim === "NGUNGCHIEU" && "bg-slate-600 text-slate-200 border-slate-500"
                            )}>
                                {trangThaiOptions.find(o => o.value === movie.TrangThaiPhim)?.label}
                            </Badge>
                             <Button variant="outline" size="sm" onClick={onEdit}>
                                <Edit className="size-3 mr-1.5" />
                                Chỉnh sửa
                            </Button>
                        </div>

                        <InfoRow label="Đạo diễn" value={movie.DaoDien} />
                        <InfoRow label="Quốc gia" value={movie.QuocGia} />
                        <InfoRow label="Thời lượng" value={`${movie.ThoiLuong} phút`} />
                        <InfoRow label="Ngày chiếu" value={`${format(movie.NgayBatDauChieu, "dd/MM/yyyy")} - ${format(movie.NgayKetThucChieu, "dd/MM/yyyy")}`} />
                        <InfoRow label="Điểm" value={movie.DiemDanhGia ? `${movie.DiemDanhGia}/10` : "Chưa có"} />
                        <InfoRow label="Trailer" value={movie.TrailerUrl} isLink />
                        
                        <div className="space-y-1">
                            <Label className="text-slate-400 text-xs">Diễn viên</Label>
                            <p className="text-sm text-slate-100">{movie.DanhSachDienVien}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-slate-400 text-xs">Tóm tắt</Label>
                            <p className="text-sm text-slate-100 leading-relaxed">{movie.TomTatNoiDung}</p>
                        </div>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function InfoRow({ label, value, isLink = false }: { label: string, value: string | null | undefined, isLink?: boolean }) {
    if (!value) return null;
    return (
        <div className="space-y-1">
            <Label className="text-slate-400 text-xs">{label}</Label>
            {isLink ? (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline block truncate">
                    {value}
                </a>
            ) : (
                <p className="text-sm text-slate-100">{value}</p>
            )}
        </div>
    );
}

interface MovieFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Phim) => void;
    movie: Phim | null;
}

function MovieFormDialog({ isOpen, onClose, onSubmit, movie }: MovieFormDialogProps) {
    const [formData, setFormData] = useState<Phim>(
        movie || {
            MaPhim: 0,
            TenPhim: "",
            PosterUrl: "", 
            TomTatNoiDung: "",
            DaoDien: "",
            DanhSachDienVien: "",
            QuocGia: "",
            TrailerUrl: "",
            ThoiLuong: 90,
            NgayBatDauChieu: new Date(),
            NgayKetThucChieu: new Date(),
            DiemDanhGia: 0,
            TrangThaiPhim: "SAPCHIEU",
        }
    );

    React.useEffect(() => {
        if (movie) {
            setFormData(movie);
        } else {
            setFormData({
                MaPhim: 0,
                TenPhim: "",
                PosterUrl: "",
                TomTatNoiDung: "",
                DaoDien: "",
                DanhSachDienVien: "",
                QuocGia: "",
                TrailerUrl: "",
                ThoiLuong: 90,
                NgayBatDauChieu: new Date(),
                NgayKetThucChieu: new Date(),
                DiemDanhGia: 0,
                TrangThaiPhim: "SAPCHIEU",
            });
        }
    }, [movie, isOpen]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };
    
    const handleSelectChange = (name: string, value: string) => {
         setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: string, date: Date | undefined) => {
        if (date) {
            setFormData(prev => ({ ...prev, [name]: date }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{movie ? "Cập nhật phim" : "Thêm phim mới"}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Nhập thông tin chi tiết cho bộ phim.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <ScrollArea className="max-h-[70vh] pr-6">
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
                                
                                {/* Cột 1 & 2: Thông tin */}
                                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="TenPhim">Tên phim</Label>
                                        <Input id="TenPhim" name="TenPhim" value={formData.TenPhim} onChange={handleChange} className="bg-transparent border-slate-700" required />
                                    </div>
                                    
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="TomTatNoiDung">Tóm tắt nội dung</Label>
                                        <Textarea id="TomTatNoiDung" name="TomTatNoiDung" value={formData.TomTatNoiDung || ""} onChange={handleChange} className="bg-transparent border-slate-700" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="DaoDien">Đạo diễn</Label>
                                        <Input id="DaoDien" name="DaoDien" value={formData.DaoDien || ""} onChange={handleChange} className="bg-transparent border-slate-700" />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="QuocGia">Quốc gia</Label>
                                        <Input id="QuocGia" name="QuocGia" value={formData.QuocGia || ""} onChange={handleChange} className="bg-transparent border-slate-700" />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="DanhSachDienVien">Diễn viên</Label>
                                        <Textarea id="DanhSachDienVien" name="DanhSachDienVien" value={formData.DanhSachDienVien || ""} onChange={handleChange} className="bg-transparent border-slate-700" />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="ThoiLuong">Thời lượng (phút)</Label>
                                        <Input id="ThoiLuong" name="ThoiLuong" type="number" value={formData.ThoiLuong} onChange={handleChange} className="bg-transparent border-slate-700" required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="DiemDanhGia">Điểm đánh giá (0-10)</Label>
                                        <Input id="DiemDanhGia" name="DiemDanhGia" type="number" step="0.1" min="0" max="10" value={formData.DiemDanhGia || 0} onChange={handleChange} className="bg-transparent border-slate-700" />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Ngày bắt đầu chiếu</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal bg-transparent border-slate-700 hover:bg-slate-800 hover:text-white", !formData.NgayBatDauChieu && "text-slate-400")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {formData.NgayBatDauChieu ? format(formData.NgayBatDauChieu, "PPP", { locale: vi }) : <span>Chọn ngày</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-slate-700 text-white">
                                                <Calendar mode="single" selected={formData.NgayBatDauChieu} onSelect={(date) => handleDateChange("NgayBatDauChieu", date)} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Ngày kết thúc chiếu</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal bg-transparent border-slate-700 hover:bg-slate-800 hover:text-white", !formData.NgayKetThucChieu && "text-slate-400")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {formData.NgayKetThucChieu ? format(formData.NgayKetThucChieu, "PPP", { locale: vi }) : <span>Chọn ngày</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-slate-700 text-white">
                                                <Calendar mode="single" selected={formData.NgayKetThucChieu} onSelect={(date) => handleDateChange("NgayKetThucChieu", date)} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    
                                </div>
                                
                                {/* Cột 3: Poster và URL */}
                                <div className="md:col-span-1 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="PosterUrl">Poster URL</Label>
                                        <Input id="PosterUrl" name="PosterUrl" type="url" value={formData.PosterUrl || ""} onChange={handleChange} className="bg-transparent border-slate-700" />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Xem trước Poster</Label>
                                        <div className="aspect-[2/3] w-full rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                                            {formData.PosterUrl ? (
                                                <Image src={formData.PosterUrl} alt="Poster preview" width={300} height={450} className="object-cover" />
                                            ) : (
                                                <p className="text-slate-500 text-sm">Chưa có ảnh</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="TrailerUrl">Trailer URL</Label>
                                        <Input id="TrailerUrl" name="TrailerUrl" type="url" value={formData.TrailerUrl || ""} onChange={handleChange} className="bg-transparent border-slate-700" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="TrangThaiPhim">Trạng thái phim</Label>
                                        <Select name="TrangThaiPhim" value={formData.TrangThaiPhim} onValueChange={(value: TrangThaiPhim) => handleSelectChange("TrangThaiPhim", value)}>
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
                            </div>
                        </div>
                    </ScrollArea>
                    <DialogFooter className="!mt-6 pt-6 border-t border-slate-700">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="bg-transparent border-slate-700 hover:bg-slate-800">Hủy</Button>
                        </DialogClose>
                        <Button type="submit">{movie ? "Cập nhật" : "Lưu phim"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}