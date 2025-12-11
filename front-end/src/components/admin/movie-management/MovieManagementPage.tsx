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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Search, Plus, Edit, Trash2, CalendarIcon, LucideImage } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from "date-fns";
import { vi } from "date-fns/locale";

type TrangThaiPhim = "SAPCHIEU" | "DANGCHIEU" | "NGUNGCHIEU";

interface Phim {
  MaPhim: string | number;
  TenPhim: string;
  PosterUrl: string | null;
  BackdropUrl: string | null;
  TomTatNoiDung: string | null;
  DaoDien: string | null;
  DanhSachDienVien: string | null;
  QuocGia: string | null;
  TrailerUrl: string | null;
  ThoiLuong: number;
  NgayBatDauChieu: Date;
  NgayKetThucChieu: Date;
  MaNhanPhim?: string; 
  MaTheLoais?: string[];
  DiemDanhGia: number | null;
  TrangThaiPhim: TrangThaiPhim;
}

const mockMovies: Phim[] = [
  {
    MaPhim: 1,
    TenPhim: "Inside Out 2",
    PosterUrl: "https://upload.wikimedia.org/wikipedia/vi/thumb/a/a3/Inside_Out_2_VN_poster.jpg/375px-Inside_Out_2_VN_poster.jpg",
    BackdropUrl: "https://image.tmdb.org/t/p/original/xg27NrXi7VXCGUr7MG75UqLl6Vg.jpg",
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
    BackdropUrl: "https://image.tmdb.org/t/p/original/xg27NrXi7VXCGUr7MG75UqLl6Vg.jpg",
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
    BackdropUrl: "https://image.tmdb.org/t/p/original/xg27NrXi7VXCGUr7MG75UqLl6Vg.jpg",
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

const mockGenres = [
    { id: "uuid-g1", name: "Hành động" },
    { id: "uuid-g2", name: "Kinh dị" },
    { id: "uuid-g3", name: "Hài hước" },
    { id: "uuid-g4", name: "Tình cảm" },
    { id: "uuid-g5", name: "Viễn tưởng" },
    { id: "uuid-g6", name: "Hoạt hình" },
    { id: "uuid-g7", name: "Tâm lý" },
    { id: "uuid-g8", name: "Gia đình" },
];

const mockLabels = [
    { id: "uuid-l1", code: "P", name: "Phổ biến mọi lứa tuổi" },
    { id: "uuid-l2", code: "C13", name: "Cấm dưới 13 tuổi" },
    { id: "uuid-l3", code: "C16", name: "Cấm dưới 16 tuổi" },
    { id: "uuid-l4", code: "C18", name: "Cấm dưới 18 tuổi" },
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

function MovieFormDialog({ isOpen, onClose, onSubmit, movie }: { isOpen: boolean; onClose: () => void; onSubmit: (data: Phim) => void; movie: Phim | null; }) {
    // Khởi tạo state form
    const [formData, setFormData] = useState<Phim>(
        movie || {
            MaPhim: 0,
            TenPhim: "",
            PosterUrl: "",
            BackdropUrl: "",
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
            MaNhanPhim: "", 
            MaTheLoais: []  
        }
    );

    React.useEffect(() => {
        if (movie) {
            setFormData(movie);
        } else {
            setFormData({
                MaPhim: 0, TenPhim: "", PosterUrl: "", BackdropUrl: "", TomTatNoiDung: "", DaoDien: "", DanhSachDienVien: "", QuocGia: "", TrailerUrl: "", ThoiLuong: 90, 
                NgayBatDauChieu: new Date(), NgayKetThucChieu: new Date(), DiemDanhGia: 0, TrangThaiPhim: "SAPCHIEU",
                MaNhanPhim: mockLabels[0]?.id || "",
                MaTheLoais: []
            });
        }
    }, [movie, isOpen]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? (value === "" ? 0 : Number(value)) : value 
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
         setFormData(prev => ({ ...prev, [name]: value }));
    };


    const handleDateChange = (name: string, date: Date | undefined) => {
        if (date) setFormData(prev => ({ ...prev, [name]: date }));
    };

    const handleGenreToggle = (genreId: string) => {
        setFormData(prev => {
            const currentGenres = prev.MaTheLoais || [];
            if (currentGenres.includes(genreId)) {
                return { ...prev, MaTheLoais: currentGenres.filter(id => id !== genreId) };
            } else {
                return { ...prev, MaTheLoais: [...currentGenres, genreId] };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white sm:max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b border-slate-800">
                    <DialogTitle>{movie ? "Cập nhật phim" : "Thêm phim mới"}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Nhập thông tin chi tiết cho bộ phim. Các trường có dấu * là bắt buộc.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-y-auto px-6">
                        <div className="space-y-6 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                <div className="md:col-span-8 space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2 space-y-2">
                                            <Label htmlFor="TenPhim">Tên phim <span className="text-red-500">*</span></Label>
                                            <Input id="TenPhim" name="TenPhim" value={formData.TenPhim} onChange={handleChange} className="bg-transparent border-slate-700 focus:border-primary" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Nhãn phim</Label>
                                            <Select name="MaNhanPhim" value={formData.MaNhanPhim} onValueChange={(v) => handleSelectChange("MaNhanPhim", v)}>
                                                <SelectTrigger className="bg-transparent border-slate-700">
                                                    <SelectValue placeholder="Chọn nhãn" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1C1C1C] border-slate-700 text-white">
                                                    {mockLabels.map(label => (
                                                        <SelectItem key={label.id} value={label.id}>
                                                            <span className="font-bold mr-2 text-yellow-500">{label.code}</span>
                                                            <span className="text-slate-400 text-xs">{label.name}</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Thể loại (Chọn nhiều)</Label>
                                        <div className="p-4 border border-slate-800 rounded-lg bg-slate-900/30">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {mockGenres.map(genre => {
                                                    const isChecked = (formData.MaTheLoais || []).includes(genre.id);
                                                    return (
                                                        <div key={genre.id} className="flex items-center space-x-2">
                                                            <Checkbox 
                                                                id={`genre-${genre.id}`} 
                                                                checked={isChecked}
                                                                onCheckedChange={() => handleGenreToggle(genre.id)}
                                                                className="border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                            />
                                                            <label 
                                                                htmlFor={`genre-${genre.id}`} 
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-300 hover:text-white transition-colors"
                                                            >
                                                                {genre.name}
                                                            </label>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="DaoDien">Đạo diễn</Label>
                                            <Input id="DaoDien" name="DaoDien" value={formData.DaoDien || ""} onChange={handleChange} className="bg-transparent border-slate-700" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="QuocGia">Quốc gia</Label>
                                            <Input id="QuocGia" name="QuocGia" value={formData.QuocGia || ""} onChange={handleChange} className="bg-transparent border-slate-700" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="DanhSachDienVien">Diễn viên</Label>
                                        <Textarea id="DanhSachDienVien" name="DanhSachDienVien" value={formData.DanhSachDienVien || ""} onChange={handleChange} className="bg-transparent border-slate-700 min-h-[60px]" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="TomTatNoiDung">Tóm tắt nội dung</Label>
                                        <Textarea id="TomTatNoiDung" name="TomTatNoiDung" value={formData.TomTatNoiDung || ""} onChange={handleChange} className="bg-transparent border-slate-700 min-h-[100px]" />
                                    </div>
    
                                    <div className="space-y-2 pt-2">
                                        <Label className="text-blue-400 font-medium">Backdrop URL (Ảnh ngang 16:9)</Label>
                                        <div className="flex gap-4 items-start p-4 border border-slate-800 rounded-lg bg-slate-900/50">
                                            <div className="flex-1 space-y-2">
                                                <Input name="BackdropUrl" value={formData.BackdropUrl || ""} onChange={handleChange} className="bg-transparent border-slate-700" placeholder="https://..." />
                                                <p className="text-xs text-slate-500">Hình ảnh này sẽ hiển thị làm nền trên trang chi tiết và banner.</p>
                                            </div>
                                            
                                        </div>
                                        <div className="w-full aspect-video bg-slate-800 rounded border border-slate-700 overflow-hidden relative shrink-0 shadow-sm group">
                                                {formData.BackdropUrl ? (
                                                    <Image src={formData.BackdropUrl} alt="Preview" fill className="object-cover transition-transform group-hover:scale-105" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-xs text-slate-500 bg-slate-900">No Image</div>
                                                )}
                                            </div>
                                    </div>
                                </div>

                                <div className="md:col-span-4 space-y-5">
                                    
                                    {/* Poster Preview & Input */}
                                    <div className="space-y-3">
                                        <Label htmlFor="PosterUrl">Poster (Khổ dọc)</Label>
                                        <div className="aspect-[2/3] w-full rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden relative shadow-lg group">
                                            {formData.PosterUrl ? (
                                                <Image src={formData.PosterUrl} alt="Poster" fill className="object-cover transition-transform group-hover:scale-105" />
                                            ) : (
                                                <div className="flex flex-col items-center text-slate-500">
                                                    <LucideImage className="size-8 mb-2 opacity-50"/>
                                                    <span className="text-xs">Chưa có ảnh</span>
                                                </div>
                                            )}
                                        </div>
                                        <Input id="PosterUrl" name="PosterUrl" value={formData.PosterUrl || ""} onChange={handleChange} className="bg-transparent border-slate-700 text-sm" placeholder="https://..." />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="TrailerUrl">Trailer URL (Youtube)</Label>
                                        <Input id="TrailerUrl" name="TrailerUrl" value={formData.TrailerUrl || ""} onChange={handleChange} className="bg-transparent border-slate-700" placeholder="https://youtube.com/..." />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="ThoiLuong">Thời lượng (p)</Label>
                                            <Input id="ThoiLuong" name="ThoiLuong" type="number" value={formData.ThoiLuong} onChange={handleChange} className="bg-transparent border-slate-700 text-center font-medium" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="DiemDanhGia">Điểm (0-10)</Label>
                                            <Input id="DiemDanhGia" name="DiemDanhGia" type="number" step="0.1" max="10" value={formData.DiemDanhGia || 0} onChange={handleChange} className="bg-transparent border-slate-700 text-center font-medium" />
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2 border-t border-slate-800">
                                        <Label>Lịch chiếu</Label>
                                        <div className="flex flex-col gap-3">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal bg-transparent border-slate-700 hover:bg-slate-800 hover:text-white", !formData.NgayBatDauChieu && "text-slate-400")}>
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {formData.NgayBatDauChieu ? format(formData.NgayBatDauChieu, "dd/MM/yyyy") : <span>Từ ngày</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-slate-700 text-white">
                                                    <Calendar mode="single" selected={formData.NgayBatDauChieu} onSelect={(d) => handleDateChange("NgayBatDauChieu", d)} />
                                                </PopoverContent>
                                            </Popover>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal bg-transparent border-slate-700 hover:bg-slate-800 hover:text-white", !formData.NgayKetThucChieu && "text-slate-400")}>
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {formData.NgayKetThucChieu ? format(formData.NgayKetThucChieu, "dd/MM/yyyy") : <span>Đến ngày</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-slate-700 text-white">
                                                    <Calendar mode="single" selected={formData.NgayKetThucChieu} onSelect={(d) => handleDateChange("NgayKetThucChieu", d)} />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 pt-2">
                                        <Label htmlFor="TrangThaiPhim">Trạng thái</Label>
                                        <Select name="TrangThaiPhim" value={formData.TrangThaiPhim} onValueChange={(v: any) => setFormData(p => ({ ...p, TrangThaiPhim: v }))}>
                                            <SelectTrigger className="w-full bg-transparent border-slate-700">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1C1C1C] text-slate-100 border-slate-700">
                                                {trangThaiOptions.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    
                    <DialogFooter className="px-6 py-4 border-t border-slate-800 bg-[#1C1C1C]">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="bg-transparent border-slate-700 hover:bg-slate-800">Hủy</Button>
                        </DialogClose>
                        <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[100px]">
                            {movie ? "Cập nhật" : "Lưu phim"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}