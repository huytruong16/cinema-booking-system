'use client';

import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
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
import { filmService, FilmFilterParams } from '@/services/film.service';
import { genreService, Genre } from '@/services/genre.service';
import { formatService, Format } from '@/services/format.service';
import { Calendar as CalendarIcon, Search, X, Filter, Loader2, Film, Layers } from 'lucide-react';
import { format, isWithinInterval, startOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Movie } from '@/types/movie';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// Loading fallback component
function FilterPageLoading() {
    return (
        <div className="min-h-screen bg-[#0F0F0F] text-white flex items-center justify-center">
            <div className="flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-zinc-500">Đang tải...</p>
            </div>
        </div>
    );
}

// Main page wrapper with Suspense
export default function FilterPage() {
    return (
        <Suspense fallback={<FilterPageLoading />}>
            <FilterPageContent />
        </Suspense>
    );
}

function FilterPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Movies state
    const [movies, setMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter options from API
    const [genres, setGenres] = useState<Genre[]>([]);
    const [formats, setFormats] = useState<Format[]>([]);
    const [isLoadingFilters, setIsLoadingFilters] = useState(true);

    // Filter values
    const [searchText, setSearchText] = useState("");
    const [selectedGenreId, setSelectedGenreId] = useState("all");
    const [selectedFormatId, setSelectedFormatId] = useState("all");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    // Debounce search text
    const debouncedSearchText = useDebounce(searchText, 300);

    // Read query param 'q' from URL (from navbar search)
    useEffect(() => {
        const querySearch = searchParams.get('q');
        if (querySearch) {
            setSearchText(querySearch);
        }
    }, [searchParams]);

    // Fetch filter options (genres, formats) on mount
    useEffect(() => {
        const fetchFilterOptions = async () => {
            setIsLoadingFilters(true);
            try {
                const [genresData, formatsData] = await Promise.all([
                    genreService.getAll(),
                    formatService.getAll(),
                ]);
                setGenres(genresData || []);
                setFormats(formatsData || []);
            } catch (error) {
                console.error("Failed to fetch filter options", error);
            } finally {
                setIsLoadingFilters(false);
            }
        };
        fetchFilterOptions();
    }, []);

    // Fetch movies when filter changes (server-side filtering)
    const fetchMovies = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: FilmFilterParams = {};

            if (selectedGenreId && selectedGenreId !== "all") {
                params.MaTheLoai = selectedGenreId;
            }
            if (selectedFormatId && selectedFormatId !== "all") {
                params.MaDinhDang = selectedFormatId;
            }

            const data = await filmService.getFilmsWithFilter(params);
            setMovies(data);
        } catch (error) {
            console.error("Failed to fetch movies", error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedGenreId, selectedFormatId]);

    useEffect(() => {
        fetchMovies();
    }, [fetchMovies]);

    // Client-side filtering for search text and date (since BE might not support these)
    const filteredMovies = useMemo(() => {
        return movies.filter((movie) => {
            // Filter by search text (client-side)
            const matchName = !debouncedSearchText ||
                movie.title.toLowerCase().includes(debouncedSearchText.toLowerCase());

            // Filter by date (client-side)
            let matchDate = true;
            if (selectedDate && movie.startDate && movie.endDate) {
                const checkDate = startOfDay(selectedDate);
                const start = startOfDay(movie.startDate);
                const end = startOfDay(movie.endDate);
                matchDate = isWithinInterval(checkDate, { start, end });
            }

            return matchName && matchDate;
        });
    }, [debouncedSearchText, selectedDate, movies]);

    const handleClearFilters = () => {
        setSearchText("");
        setSelectedGenreId("all");
        setSelectedFormatId("all");
        setSelectedDate(undefined);
    };

    const handleBook = (movie: Movie) => {
        router.push(`/movies/${movie.id}`);
    };
    const handleDetail = (movie: Movie) => {
        router.push(`/movies/${movie.id}`);
    };

    const hasActiveFilters = searchText || selectedGenreId !== "all" || selectedFormatId !== "all" || selectedDate;

    return (
        <div className="min-h-screen bg-[#0F0F0F] text-white pb-20">
            <div className="dark py-8 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                        <Filter className="w-8 h-8 text-primary" />
                        Tìm kiếm & Lọc phim
                    </h1>

                    {/* Filter Controls */}
                    <div className="flex flex-col gap-4">
                        {/* Search Bar */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input
                                placeholder="Nhập tên phim..."
                                className="pl-9 bg-zinc-900 border-zinc-700 text-white h-11 focus-visible:ring-primary"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                            {searchText && (
                                <button onClick={() => setSearchText("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Filter Dropdowns */}
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Genre Filter */}
                            <div className="w-full md:w-[200px]">
                                <Select value={selectedGenreId} onValueChange={setSelectedGenreId} disabled={isLoadingFilters}>
                                    <SelectTrigger className="w-full bg-zinc-900 border-zinc-700 text-white !h-11">
                                        <div className="flex items-center gap-2">
                                            <Film className="w-4 h-4 text-zinc-400" />
                                            <SelectValue placeholder={isLoadingFilters ? "Đang tải..." : "Thể loại"} />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                                        <SelectItem value="all">Tất cả thể loại</SelectItem>
                                        {genres.map((genre) => (
                                            <SelectItem key={genre.MaTheLoai} value={genre.MaTheLoai}>
                                                {genre.TenTheLoai}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Format Filter */}
                            <div className="w-full md:w-[200px]">
                                <Select value={selectedFormatId} onValueChange={setSelectedFormatId} disabled={isLoadingFilters}>
                                    <SelectTrigger className="w-full bg-zinc-900 border-zinc-700 text-white !h-11">
                                        <div className="flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-zinc-400" />
                                            <SelectValue placeholder={isLoadingFilters ? "Đang tải..." : "Định dạng"} />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                                        <SelectItem value="all">Tất cả định dạng</SelectItem>
                                        {formats.map((format) => (
                                            <SelectItem key={format.MaDinhDang} value={format.MaDinhDang}>
                                                {format.TenDinhDang}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date Filter */}
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

                            {/* Clear Filters Button */}
                            <Button
                                onClick={handleClearFilters}
                                variant={hasActiveFilters ? "destructive" : "outline"}
                                className={cn(
                                    "h-11 transition-all",
                                    !hasActiveFilters && "bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                )}
                                disabled={!hasActiveFilters}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Xóa bộ lọc
                            </Button>
                        </div>

                        {/* Active Filters Display */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {searchText && (
                                    <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm flex items-center gap-2">
                                        <Search className="w-3 h-3" />
                                        &quot;{searchText}&quot;
                                        <button onClick={() => setSearchText("")} className="hover:text-white">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {selectedGenreId !== "all" && (
                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm flex items-center gap-2">
                                        <Film className="w-3 h-3" />
                                        {genres.find(g => g.MaTheLoai === selectedGenreId)?.TenTheLoai}
                                        <button onClick={() => setSelectedGenreId("all")} className="hover:text-white">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {selectedFormatId !== "all" && (
                                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm flex items-center gap-2">
                                        <Layers className="w-3 h-3" />
                                        {formats.find(f => f.MaDinhDang === selectedFormatId)?.TenDinhDang}
                                        <button onClick={() => setSelectedFormatId("all")} className="hover:text-white">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {selectedDate && (
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm flex items-center gap-2">
                                        <CalendarIcon className="w-3 h-3" />
                                        {format(selectedDate, "dd/MM/yyyy")}
                                        <button onClick={() => setSelectedDate(undefined)} className="hover:text-white">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-zinc-500">Đang tải danh sách phim...</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-zinc-400 text-sm flex items-center justify-between">
                            <span>
                                Tìm thấy <strong className="text-white">{filteredMovies.length}</strong> phim phù hợp
                            </span>
                            {isLoadingFilters && (
                                <span className="flex items-center gap-2 text-xs">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Đang tải bộ lọc...
                                </span>
                            )}
                        </div>

                        {filteredMovies.length > 0 ? (
                            <div className="dark grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
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
                                <p className="text-zinc-500 max-w-md mb-4">
                                    Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn.
                                </p>
                                {hasActiveFilters && (
                                    <Button
                                        variant="destructive"
                                        onClick={handleClearFilters}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Xóa tất cả bộ lọc
                                    </Button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}