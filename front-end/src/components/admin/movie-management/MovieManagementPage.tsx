/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, CalendarIcon, ChevronsUpDown, Upload, Loader2 } from 'lucide-react';
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from '@/lib/utils';
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
    filmService, BackendFilm, CreateFilmDto, Genre, Label as FilmLabel
} from '@/services/film.service';
import { toast } from 'sonner';

export default function MovieManagementPage() {
  const [films, setFilms] = useState<BackendFilm[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [labels, setLabels] = useState<FilmLabel[]>([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFilm, setEditingFilm] = useState<BackendFilm | null>(null);

  const fetchAllData = async () => {
    try {
        setIsLoading(true);
        const [filmsData, genresData, labelsData] = await Promise.all([
            filmService.getAll(),
            filmService.getAllGenres(),
            filmService.getAllLabels()
        ]);

        const unwrapData = (data: any) => {
            if (Array.isArray(data)) return data;
            if (data && Array.isArray(data.data)) return data.data;
            return [];
        };
        
        setFilms(unwrapData(filmsData));
        setGenres(unwrapData(genresData));
        setLabels(unwrapData(labelsData));
    } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        toast.error("Không thể tải dữ liệu phim/thể loại/nhãn.");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const filteredFilms = useMemo(() => {
    if (!Array.isArray(films)) return [];
    return films.filter(f => 
        (f.TenHienThi || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.TenGoc || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [films, searchTerm]);

  const handleAddNew = () => {
    setEditingFilm(null);
    setIsModalOpen(true);
  };

  const handleEdit = (film: BackendFilm) => {
    setEditingFilm(film);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
        await filmService.delete(id);
        toast.success("Xóa phim thành công!");
        fetchAllData();
    } catch (error) {
        toast.error("Xóa phim thất bại.");
    }
  };

  const handleFormSubmitSuccess = () => {
      setIsModalOpen(false);
      fetchAllData();
  };

  return (
    <div className="space-y-6 text-white h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold">Quản lý Phim</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-[300px]">
                <Input
                    placeholder="Tìm theo tên phim..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-transparent border-slate-700 w-full"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            </div>
            <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                <Plus className="size-4 mr-2" />
                Thêm phim mới
            </Button>
        </div>
      </div>

      {/* Grid List */}
      <ScrollArea className="flex-1 pr-0 sm:pr-4">
        {isLoading ? (
             <div className="text-center text-slate-400 py-10">Đang tải dữ liệu...</div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-20">
                {filteredFilms.map((film) => (
                    <FilmCard 
                        key={film.MaPhim} 
                        film={film} 
                        onEdit={() => handleEdit(film)}
                        onDelete={() => handleDelete(film.MaPhim)}
                    />
                ))}
                {filteredFilms.length === 0 && (
                    <div className="col-span-full text-center text-slate-500 py-10">
                        Không tìm thấy phim nào.
                    </div>
                )}
            </div>
        )}
      </ScrollArea>

      {isModalOpen && (
        <FilmFormDialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleFormSubmitSuccess}
          film={editingFilm}
          genresList={genres}
          labelsList={labels}
        />
      )}
    </div>
  );
}

function FilmCard({ film, onEdit, onDelete }: { film: BackendFilm, onEdit: () => void, onDelete: () => void }) {
    return (
        <Card className="bg-[#1C1C1C] border-slate-800 overflow-hidden flex flex-col h-full group hover:border-primary/50 transition-colors">
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
                {film.PosterUrl ? (
                    <img 
                        src={film.PosterUrl} 
                        alt={film.TenHienThi} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full text-slate-600">No Image</div>
                )}
                <div className="absolute top-2 right-2">
                    <Badge variant={film.TrangThaiPhim === 'DANGCHIEU' ? 'default' : 'secondary'} className="text-[10px]">
                        {film.TrangThaiPhim}
                    </Badge>
                </div>
            </div>

            <CardContent className="p-4 flex-1 flex flex-col gap-2">
                <h3 className="font-bold text-slate-100 line-clamp-1" title={film.TenHienThi}>{film.TenHienThi}</h3>
                <p className="text-xs text-slate-400 line-clamp-1">{film.TenGoc}</p>
                
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded whitespace-nowrap">{film.ThoiLuong} phút</span>
                    <span>•</span>
                    <span className="truncate max-w-[120px]">{film.NhanPhim?.TenNhanPhim || 'Chưa có nhãn'}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarIcon className="size-3 shrink-0" />
                    <span className="truncate">{film.NgayBatDauChieu ? format(new Date(film.NgayBatDauChieu), 'dd/MM/yyyy') : 'N/A'}</span>
                    <span> - </span>
                    <span className="truncate">{film.NgayKetThucChieu ? format(new Date(film.NgayKetThucChieu), 'dd/MM/yyyy') : 'N/A'}</span>
                </div>

                <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" onClick={onEdit} className="bg-transparent border-slate-700 hover:bg-slate-800 w-full">
                        <Edit className="size-3 mr-2" /> Sửa
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="bg-transparent border-slate-700 text-red-500 hover:text-red-500 hover:bg-red-500/10 w-full">
                                <Trash2 className="size-3 mr-2" /> Xóa
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#1C1C1C] border-slate-800 text-white max-w-[90%] sm:max-w-lg rounded-lg">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa phim?</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                    Phim &quot;{film.TenHienThi}&quot; sẽ bị xóa (ẩn) khỏi hệ thống.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                <AlertDialogCancel className="bg-transparent border-slate-700 hover:bg-slate-800 mt-0">Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}

interface FilmFormState {
    TenGoc: string;
    TenHienThi: string;
    TomTatNoiDung: string;
    DaoDien: string;
    DanhSachDienVien: string;
    QuocGia: string;
    TrailerUrl: string;
    ThoiLuong: number;
    NgayBatDauChieu: Date | undefined;
    NgayKetThucChieu: Date | undefined;
    MaNhanPhim: string;
    TheLoais: string[]; 
    posterFile: File | null;
    backdropFile: File | null;
}

function FilmFormDialog({ isOpen, onClose, onSuccess, film, genresList, labelsList }: any) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<FilmFormState>({
        TenGoc: "",
        TenHienThi: "",
        TomTatNoiDung: "",
        DaoDien: "",
        DanhSachDienVien: "",
        QuocGia: "",
        TrailerUrl: "",
        ThoiLuong: 0,
        NgayBatDauChieu: undefined,
        NgayKetThucChieu: undefined,
        MaNhanPhim: "",
        TheLoais: [],
        posterFile: null,
        backdropFile: null,
    });

    const [posterPreview, setPosterPreview] = useState<string | null>(null);
    const [backdropPreview, setBackdropPreview] = useState<string | null>(null);

    useEffect(() => {
    if (film) {
        const rawGenres = film.PhimTheLoais?.map((pt: any) => pt.TheLoai?.MaTheLoai || pt.MaTheLoai) || [];
        const uniqueGenres = Array.from(new Set(rawGenres)) as string[];

        setFormData({
            TenGoc: film.TenGoc,
            TenHienThi: film.TenHienThi,
            TomTatNoiDung: film.TomTatNoiDung || "",
            DaoDien: film.DaoDien || "",
            DanhSachDienVien: film.DanhSachDienVien || "",
            QuocGia: film.QuocGia || "",
            TrailerUrl: film.TrailerUrl || "",
            ThoiLuong: film.ThoiLuong,
            NgayBatDauChieu: film.NgayBatDauChieu ? new Date(film.NgayBatDauChieu) : undefined,
            NgayKetThucChieu: film.NgayKetThucChieu ? new Date(film.NgayKetThucChieu) : undefined,
            MaNhanPhim: film.MaNhanPhim || "",
            TheLoais: uniqueGenres,
            posterFile: null,
            backdropFile: null,
        });
        setPosterPreview(film.PosterUrl);
        setBackdropPreview(film.BackdropUrl);
    } else {
        setFormData({
            TenGoc: "", TenHienThi: "", TomTatNoiDung: "", DaoDien: "",
            DanhSachDienVien: "", QuocGia: "", TrailerUrl: "", ThoiLuong: 90,
            NgayBatDauChieu: new Date(), NgayKetThucChieu: undefined,
            MaNhanPhim: labelsList.length > 0 ? labelsList[0].MaNhanPhim : "",
            TheLoais: [], posterFile: null, backdropFile: null,
        });
        setPosterPreview(null);
        setBackdropPreview(null);
    }
}, [film, isOpen, labelsList]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'posterFile' | 'backdropFile') => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, [field]: file }));
            const url = URL.createObjectURL(file);
            if (field === 'posterFile') setPosterPreview(url);
            else setBackdropPreview(url);
        }
    };

    const handleGenreToggle = (genreId: string) => {
        setFormData(prev => {
            const current = prev.TheLoais;
            if (current.includes(genreId)) {
                return { ...prev, TheLoais: current.filter(id => id !== genreId) };
            } else {
                return { ...prev, TheLoais: [...current, genreId] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSubmitting) return;

        try {
            if (!formData.TenHienThi || !formData.TenGoc || !formData.NgayBatDauChieu || !formData.NgayKetThucChieu || !formData.MaNhanPhim) {
                toast.error("Vui lòng điền các trường bắt buộc (*)!");
                return;
            }
            if (formData.NgayKetThucChieu < formData.NgayBatDauChieu) {
                toast.error("Ngày kết thúc phải lớn hơn hoặc bằng ngày khởi chiếu!");
                return;
            }

            const payload: CreateFilmDto = {
                ...formData,
                NgayBatDauChieu: formData.NgayBatDauChieu.toISOString(),
                NgayKetThucChieu: formData.NgayKetThucChieu.toISOString(),
                ThoiLuong: Number(formData.ThoiLuong),
            };

            setIsSubmitting(true);

            if (film) {
                await filmService.update(film.MaPhim, payload);
                toast.success("Cập nhật phim thành công!");
            } else {
                if (!formData.posterFile || !formData.backdropFile) {
                    toast.warning("Nên có đủ Poster và Backdrop cho phim mới.");
                }
                await filmService.create(payload);
                toast.success("Tạo phim mới thành công!");
            }
            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white w-full max-w-[95vw] sm:max-w-4xl h-[95vh] flex flex-col p-0 overflow-hidden rounded-lg">
                
                <DialogHeader className="p-4 sm:p-6 pb-2 shrink-0">
                    <DialogTitle className="text-lg sm:text-xl">
                        {film ? "Cập nhật phim" : "Thêm phim mới"}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-0">
                    <form id="film-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            <div className="lg:col-span-1 space-y-4">
                                <div className="space-y-2">
                                    <Label>Poster (Dọc) *</Label>
                                    <div 
                                        className="relative aspect-[2/3] w-full rounded-md border-2 border-dashed border-slate-700 bg-slate-900 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 overflow-hidden"
                                        onClick={() => document.getElementById('poster-upload')?.click()}
                                    >
                                        {posterPreview ? (
                                            <img src={posterPreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center p-4">
                                                <Upload className="size-8 mx-auto text-slate-500 mb-2" />
                                                <span className="text-xs text-slate-400">Upload ảnh .jpg, .png</span>
                                            </div>
                                        )}
                                        <input 
                                            id="poster-upload" type="file" accept="image/*" className="hidden" 
                                            onChange={(e) => handleFileChange(e, 'posterFile')}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Backdrop (Ngang)</Label>
                                    <div 
                                        className="relative aspect-video w-full rounded-md border-2 border-dashed border-slate-700 bg-slate-900 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 overflow-hidden"
                                        onClick={() => document.getElementById('backdrop-upload')?.click()}
                                    >
                                        {backdropPreview ? (
                                            <img src={backdropPreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center p-4">
                                                <Upload className="size-6 mx-auto text-slate-500 mb-2" />
                                                <span className="text-xs text-slate-400">Upload ảnh ngang</span>
                                            </div>
                                        )}
                                        <input 
                                            id="backdrop-upload" type="file" accept="image/*" className="hidden" 
                                            onChange={(e) => handleFileChange(e, 'backdropFile')}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-2 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="TenHienThi">Tên hiển thị (VN) *</Label>
                                        <Input id="TenHienThi" name="TenHienThi" value={formData.TenHienThi} onChange={handleChange} required className="bg-transparent border-slate-700" placeholder="Mai: Hành trình..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="TenGoc">Tên gốc (EN) *</Label>
                                        <Input id="TenGoc" name="TenGoc" value={formData.TenGoc} onChange={handleChange} required className="bg-transparent border-slate-700" placeholder="Mai" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="col-span-1 space-y-2">
                                        <Label>Thời lượng (phút)</Label>
                                        <Input type="number" name="ThoiLuong" value={formData.ThoiLuong} onChange={handleChange} className="bg-transparent border-slate-700" />
                                    </div>
                                    <div className="col-span-1 space-y-2">
                                        <Label>Quốc gia</Label>
                                        <Input name="QuocGia" value={formData.QuocGia} onChange={handleChange} className="bg-transparent border-slate-700" />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label>Nhãn phim *</Label>
                                        <Select 
                                            value={formData.MaNhanPhim} 
                                            onValueChange={(val) => setFormData(prev => ({ ...prev, MaNhanPhim: val }))}
                                        >
                                            <SelectTrigger className="bg-transparent border-slate-700">
                                                <SelectValue placeholder="Chọn nhãn" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1C1C1C] text-slate-100 border-slate-700">
                                                {labelsList.map((l: any) => (
                                                    <SelectItem key={l.MaNhanPhim} value={l.MaNhanPhim}>{l.TenNhanPhim}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Ngày khởi chiếu *</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal bg-transparent border-slate-700", !formData.NgayBatDauChieu && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {formData.NgayBatDauChieu ? format(formData.NgayBatDauChieu, "PPP", { locale: vi }) : <span>Chọn ngày</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-slate-700 text-white" align="start">
                                                <Calendar mode="single" selected={formData.NgayBatDauChieu} onSelect={(date) => setFormData(prev => ({ ...prev, NgayBatDauChieu: date }))} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ngày kết thúc</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal bg-transparent border-slate-700", !formData.NgayKetThucChieu && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {formData.NgayKetThucChieu ? format(formData.NgayKetThucChieu, "PPP", { locale: vi }) : <span>Chọn ngày</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-slate-700 text-white" align="start">
                                                <Calendar mode="single" selected={formData.NgayKetThucChieu} onSelect={(date) => setFormData(prev => ({ ...prev, NgayKetThucChieu: date }))} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label>Thể loại</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" className="w-full justify-between bg-transparent border-slate-700 h-auto min-h-[40px] py-2">
                                                <span className="truncate text-left flex-1">
                                                    {formData.TheLoais.length > 0 
                                                        ? `${formData.TheLoais.length} thể loại đã chọn` 
                                                        : "Chọn thể loại..."}
                                                </span>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[280px] sm:w-[400px] p-0 bg-[#1C1C1C] border-slate-700 text-white">
                                            <Command>
                                                <CommandList>
                                                    <CommandGroup>
                                                        {genresList.map((genre: any) => (
                                                            <CommandItem key={genre.MaTheLoai} onSelect={() => handleGenreToggle(genre.MaTheLoai)} className="cursor-pointer hover:bg-slate-800">
                                                                <div className="flex items-center gap-2">
                                                                    <Checkbox 
                                                                        checked={formData.TheLoais.includes(genre.MaTheLoai)}
                                                                        onCheckedChange={() => handleGenreToggle(genre.MaTheLoai)}
                                                                        className="border-slate-500 data-[state=checked]:bg-primary"
                                                                    />
                                                                    {genre.TenTheLoai}
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.TheLoais.map(id => {
                                            const g = genresList.find((x: any) => x.MaTheLoai === id);
                                            return g ? <Badge key={id} variant="secondary" className="bg-slate-800 text-white">{g.TenTheLoai}</Badge> : null;
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Đạo diễn</Label>
                                    <Input name="DaoDien" value={formData.DaoDien} onChange={handleChange} className="bg-transparent border-slate-700" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Diễn viên</Label>
                                    <Input name="DanhSachDienVien" value={formData.DanhSachDienVien} onChange={handleChange} className="bg-transparent border-slate-700" placeholder="A, B, C..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Trailer URL</Label>
                                    <Input name="TrailerUrl" value={formData.TrailerUrl} onChange={handleChange} className="bg-transparent border-slate-700" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tóm tắt nội dung</Label>
                                    <Textarea name="TomTatNoiDung" value={formData.TomTatNoiDung} onChange={handleChange} className="bg-transparent border-slate-700 min-h-[100px]" />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                
                <DialogFooter className="p-4 sm:p-6 pt-2 border-t border-slate-800 bg-[#1C1C1C] shrink-0 flex-col sm:flex-row gap-2">
                    <DialogClose asChild>
                        <Button variant="outline" type="button" className="bg-transparent border-slate-700 w-full sm:w-auto mt-2 sm:mt-0" disabled={isSubmitting}>Hủy</Button>
                    </DialogClose>
                    <Button type="submit" form="film-form" className="w-full sm:w-auto" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {film ? "Lưu thay đổi" : "Tạo phim mới"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}