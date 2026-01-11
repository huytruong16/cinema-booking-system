'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShowtimeFilter } from '@/components/movies/ShowtimeFilter';
import { showtimeService } from '@/services/showtime.service';
import type { Showtime } from '@/types/showtime';
import type { Movie } from '@/types/movie';
import { Loader2, CalendarX, ChevronDown } from 'lucide-react';
import { format, parseISO, isValid, addDays, startOfDay } from 'date-fns';

const ITEMS_PER_PAGE = 20;


const formatShowtimeType = (showtime: Showtime) => {
    const dinhDang = showtime.PhienBanPhim?.DinhDang?.TenDinhDang || '2D';
    const ngonNgu = showtime.PhienBanPhim?.NgonNgu?.TenNgonNgu || 'Phụ đề';
    return `${dinhDang} - ${ngonNgu}`;
};

const getDateString = (isoString: string) => {
    if (!isoString) return '';
    const date = parseISO(isoString);
    return isValid(date) ? format(date, 'yyyy-MM-dd') : '';
};

const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'dd/MM/yyyy') : dateString;
};

// Generate next 14 days for date picker
const generateAvailableDates = () => {
    const dates: string[] = [];
    const today = startOfDay(new Date());
    for (let i = 0; i < 14; i++) {
        dates.push(format(addDays(today, i), 'yyyy-MM-dd'));
    }
    return dates;
};

export default function ShowtimesPage() {
    const router = useRouter();

    const [showtimes, setShowtimes] = useState<Showtime[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasNextPage, setHasNextPage] = useState(false);

    const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [selectedMovieId, setSelectedMovieId] = useState('all');
    const [selectedFormat, setSelectedFormat] = useState('all');
    
    const availableDates = useMemo(() => generateAvailableDates(), []);


    const fetchShowtimes = useCallback(async (cursor?: string, append: boolean = false) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
                setShowtimes([]);
            }

            const today = format(new Date(), 'yyyy-MM-dd');
            const endDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');
            
            const params: any = {
                limit: ITEMS_PER_PAGE,
                TuNgay: `${today}T00:00:00.000Z`,
                DenNgay: `${endDate}T23:59:59.999Z`,
            };

            if (cursor) {
                params.cursor = cursor;
            }
            if (selectedMovieId !== 'all') {
                params.MaPhim = selectedMovieId;
            }

            const response = await showtimeService.getShowtimesPaginated(params);
            
            const activeShowtimes = response.data.filter(st =>
                ['CHUACHIEU', 'DANGCHIEU', 'SAPCHIEU'].includes(st.TrangThai)
            );
            
            if (append) {
                setShowtimes(prev => [...prev, ...activeShowtimes]);
            } else {
                setShowtimes(activeShowtimes);
            }
            
            setNextCursor(response.pagination.nextCursor);
            setHasNextPage(response.pagination.hasNextPage);

        } catch (err) {
            console.error("Failed to fetch showtimes", err);
            setError("Không thể tải lịch chiếu. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [selectedMovieId]); 

    useEffect(() => {
        fetchShowtimes();
    }, [fetchShowtimes]);

    const handleLoadMore = () => {
        if (nextCursor && hasNextPage && !loadingMore) {
            fetchShowtimes(nextCursor, true);
        }
    };

    const filterOptions = useMemo(() => {
        const moviesMap = new Map<string, Movie>();
        showtimes.forEach(st => {
            const phim = st.PhienBanPhim?.Phim;
            if (phim && !moviesMap.has(phim.MaPhim)) {
                moviesMap.set(phim.MaPhim, {
                    id: phim.MaPhim,
                    title: phim.TenHienThi,
                    posterUrl: phim.PosterUrl || '/images/poster-placeholder.jpg',
                    ageRating: phim.NhanPhim?.TenNhanPhim || 'T13',
                    duration: phim.ThoiLuong ? `${phim.ThoiLuong} phút` : 'Updating...',
                    status: 'now_showing',
                    releaseDate: phim.NgayBatDauChieu,
                    genre: phim.PhimTheLoais?.map(ptl => ptl.TheLoai.TenTheLoai).join(', ') || ''
                } as any);
            }
        });
        const movies = Array.from(moviesMap.values());
        const formats = Array.from(new Set(showtimes.map(st => formatShowtimeType(st))));

        return { dates: availableDates, movies, formats };
    }, [showtimes, availableDates]);

    const filteredData = useMemo(() => {
        return showtimes.filter(st => {
            const stDate = getDateString(st.ThoiGianBatDau);
            const matchDate = selectedDate ? stDate === selectedDate : true;
            

            const matchFormat = selectedFormat === 'all' || formatShowtimeType(st) === selectedFormat;
            
            return matchDate && matchFormat;
        });
    }, [showtimes, selectedDate, selectedFormat]);


    const groupedMovies = useMemo(() => {
        const groups = new Map<string, {
            movie: any;
            formats: Map<string, { type: string; times: { time: string; id: string }[] }>
        }>();

        filteredData.forEach(st => {
            const phim = st.PhienBanPhim.Phim;
            const movieId = phim.MaPhim;
            if (!groups.has(movieId)) {
                groups.set(movieId, {
                    movie: {
                        id: phim.MaPhim,
                        title: phim.TenHienThi,
                        posterUrl: phim.PosterUrl,
                        ageRating: phim.NhanPhim?.TenNhanPhim || 'P',
                        duration: `${phim.ThoiLuong} phút`,
                    },
                    formats: new Map()
                });
            }

            const movieGroup = groups.get(movieId)!;
            const formatType = formatShowtimeType(st);

            if (!movieGroup.formats.has(formatType)) {
                movieGroup.formats.set(formatType, { type: formatType, times: [] });
            }

            const startTime = parseISO(st.ThoiGianBatDau);
            if (isValid(startTime)) {
                const timeString = format(startTime, 'HH:mm');
                movieGroup.formats.get(formatType)!.times.push({
                    time: timeString,
                    id: st.MaSuatChieu
                });
            }
        });

        return Array.from(groups.values()).map(group => ({
            ...group,
            formats: Array.from(group.formats.values()).map(fmt => ({
                ...fmt,
                times: fmt.times.sort((a, b) => a.time.localeCompare(b.time))
            }))
        }));
    }, [filteredData]);

    const handleResetFilters = () => {
        setSelectedMovieId('all');
        setSelectedFormat('all');
    };

    const handleBookTicket = (movieId: string, showtimeId: string, time: string, formatLabel: string) => {
        const query = new URLSearchParams({
            movieId,
            showtimeId,
            date: selectedDate,
            time,
            format: formatLabel
        }).toString();

        router.push(`/booking?${query}`);
    };

    if (loading) {
        return (
            <main className="dark bg-background min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Đang tải lịch chiếu...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="dark bg-background min-h-screen flex flex-col items-center justify-center gap-4 text-white">
                <p className="text-xl text-red-500">{error}</p>
                <Button onClick={() => window.location.reload()}>Thử lại</Button>
            </main>
        );
    }

    return (
        <main className="dark bg-background min-h-screen text-foreground">
            <section className="max-w-7xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-bold mb-8 text-white">Lịch chiếu phim</h1>

                <ShowtimeFilter
                    availableDates={filterOptions.dates}
                    availableMovies={filterOptions.movies}
                    availableFormats={filterOptions.formats}
                    selectedDate={selectedDate}
                    selectedMovieId={selectedMovieId}
                    selectedFormat={selectedFormat}
                    onDateChange={setSelectedDate}
                    onMovieChange={setSelectedMovieId}
                    onFormatChange={setSelectedFormat}
                    onReset={handleResetFilters}
                    resultCount={groupedMovies.length}
                />

                <div className="space-y-8">
                    {groupedMovies.length > 0 ? (
                        groupedMovies.map(({ movie, formats }) => (
                            <div
                                key={movie.id}
                                className="flex flex-col md:flex-row gap-6 p-6 bg-card/50 rounded-lg border border-border"
                            >
                                <div className="w-full md:w-1/4 lg:w-1/5 shrink-0">
                                    <Link href={`/movies/${movie.id}`}>
                                        <div className="aspect-[2/3] relative rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-muted">
                                            {movie.posterUrl ? (
                                                <Image
                                                    src={movie.posterUrl}
                                                    alt={movie.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw, 20vw"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                                                    No Poster
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                    <Link href={`/movies/${movie.id}`}>
                                        <h3 className="text-lg font-bold text-white mt-4 hover:text-primary transition-colors line-clamp-2">
                                            {movie.title}
                                        </h3>
                                    </Link>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge className="bg-primary text-primary-foreground">
                                            {movie.ageRating}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">{movie.duration}</span>
                                    </div>
                                </div>

                                <div className="w-full md:w-3/4 lg:w-4/5">
                                    <h4 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
                                        Lịch chiếu ngày <span className="text-white">{formatDateDisplay(selectedDate)}</span>
                                    </h4>

                                    {formats.length > 0 ? (
                                        <div className="space-y-6">
                                            {formats.map(fmt => (
                                                <div key={fmt.type} className="bg-background/40 p-4 rounded-md border border-white/5">
                                                    <p className="font-medium text-white mb-3 text-sm uppercase tracking-wide opacity-90">
                                                        {fmt.type}
                                                    </p>
                                                    <div className="flex flex-wrap gap-3">
                                                        {fmt.times.map(t => (
                                                            <Button
                                                                key={t.id}
                                                                variant="outline"
                                                                className="bg-card hover:bg-primary hover:text-primary-foreground border-primary/30 min-w-[90px] h-10 text-base font-semibold"
                                                                onClick={() => handleBookTicket(movie.id, t.id, t.time, fmt.type)}
                                                            >
                                                                {t.time}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 bg-card/30 rounded-lg border border-dashed border-muted">
                                            <CalendarX className="w-10 h-10 text-muted-foreground mb-2" />
                                            <p className="text-muted-foreground">
                                                Không tìm thấy suất chiếu nào phù hợp với bộ lọc.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 bg-card/20 rounded-lg border border-dashed border-muted">
                            <CalendarX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-white">Không có lịch chiếu</h3>
                            <p className="text-muted-foreground mt-2">
                                Không có suất chiếu nào được tìm thấy trong khoảng thời gian này.
                            </p>
                        </div>
                    )}
                    {hasNextPage && (
                        <div className="flex justify-center pt-8">
                            <Button
                                variant="outline"
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="px-8 h-12"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Đang tải...
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4 mr-2" />
                                        Xem thêm suất chiếu
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}