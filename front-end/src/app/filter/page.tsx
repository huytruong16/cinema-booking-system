'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { MovieCard } from "@/components/movies/MovieCard";
import { mockMovies } from '@/lib/mockData';
import { Calendar as CalendarIcon, Search, X, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import type { Movie } from '@/types/movie';

export default function FilterPage() {
    const router = useRouter();

    const [searchText, setSearchText] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("all");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const allGenres = useMemo(() => {
        const tags = mockMovies.flatMap(movie => movie.tags || []);
        return ["all", ...Array.from(new Set(tags))];
    }, []);

    const filteredMovies = useMemo(() => {
        return mockMovies.filter((movie) => {
            const matchName = movie.title.toLowerCase().includes(searchText.toLowerCase());
            const matchGenre = selectedGenre === "all" || (movie.tags && movie.tags.includes(selectedGenre));
            const matchDate = true;
            return matchName && matchGenre && matchDate;
        });
    }, [searchText, selectedGenre, selectedDate]);

    const handleClearFilters = () => {
        setSearchText("");
        setSelectedGenre("all");
        setSelectedDate(undefined);
    };

    const handleBook = (movie: Movie) => {
        router.push(`/movies/${movie.id}`);
    };
    const handleDetail = (movie: Movie) => {
        router.push(`/movies/${movie.id}`);
    };

    return (
        <div className="min-h-screen bg-[#0F0F0F] text-white pb-20">
            <div className="dark py-8 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                        <Filter className="w-8 h-8 text-primary" />
                        Tìm kiếm & Lọc phim
                    </h1>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input
                                placeholder="Nhập tên phim..."
                                className="pl-9 bg-zinc-900 border-zinc-700 text-white h-11 focus-visible:ring-primary"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                            {searchText && (
                                <button onClick={() => setSearchText("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="w-full md:w-[200px]">
                            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                                <SelectTrigger className="w-full bg-zinc-900 border-zinc-700 text-white !h-11">
                                    <SelectValue placeholder="Thể loại" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                                    <SelectItem value="all">Tất cả thể loại</SelectItem>
                                    {allGenres.filter(g => g !== 'all').map((genre) => (
                                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full md:w-[200px]">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full h-11 justify-start text-left font-normal bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800 hover:text-white",
                                            !selectedDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {selectedDate ? format(selectedDate, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-zinc-700" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        initialFocus
                                        className="text-white"
                                        locale={vi}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <Button
                            onClick={handleClearFilters}
                            className="h-11"
                        >
                            Xóa bộ lọc
                        </Button>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-4 text-zinc-400 text-sm">
                    Tìm thấy <strong className="text-white">{filteredMovies.length}</strong> phim phù hợp
                </div>

                {filteredMovies.length > 0 ? (
                    <div className=" dark grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
                        {filteredMovies.map((movie) => (
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                onBook={handleBook}
                                onDetail={handleDetail}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-10 h-10 text-zinc-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy phim nào</h3>
                        <p className="text-zinc-500 max-w-md">
                            Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc thể loại của bạn.
                        </p>
                        <Button
                            variant="destructive"
                            className="text-primary mt-2 border-2 border-red-600 hover:border-red-800"
                            onClick={handleClearFilters}
                        >
                            Xóa bộ lọc
                        </Button>
                    </div>
                )}
            </div>

        </div>
    );
}