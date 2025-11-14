'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockMovies, mockShowtimes } from '@/lib/mockData';
import type { Movie } from '@/types/movie';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShowtimeFilter } from '@/components/movies/ShowtimeFilter';

const getAvailableDates = () => {
    return mockShowtimes.map(day => day.date);
};

const getNowShowingMovies = () => {
    return mockMovies.filter(movie => movie.status === 'now_showing');
};

const getUniqueFormats = () => {
    const allFormats = mockShowtimes.flatMap(day => day.types.map(t => t.type));
    return [...new Set(allFormats)];
};


export default function ShowtimesPage() {
    const router = useRouter();

    const availableDates = getAvailableDates();
    const availableMovies = getNowShowingMovies();
    const availableFormats = getUniqueFormats();

    const [selectedDate, setSelectedDate] = useState(availableDates[0]);
    const [selectedMovieId, setSelectedMovieId] = useState('all');
    const [selectedFormat, setSelectedFormat] = useState('all');

    const filteredMovies = useMemo(() => {
        if (selectedMovieId === 'all') {
            return availableMovies;
        }
        return availableMovies.filter(movie => movie.id.toString() === selectedMovieId);
    }, [availableMovies, selectedMovieId]);

    const showtimesForSelectedDay = useMemo(() => {
        return mockShowtimes.find(day => day.date === selectedDate);
    }, [selectedDate]);

    const filteredShowtimeTypes = useMemo(() => {
        if (!showtimesForSelectedDay) return [];

        if (selectedFormat === 'all') {
            return showtimesForSelectedDay.types;
        }
        return showtimesForSelectedDay.types.filter(type => type.type === selectedFormat);
    }, [showtimesForSelectedDay, selectedFormat]);


    const handleBookTicket = (movie: Movie, time: string, type: string) => {
        alert(`Đã chọn: ${movie.title} - ${type} - ${selectedDate} - ${time}`);
    };

    return (
        <main className="dark bg-background min-h-screen text-foreground">
            <section className="max-w-7xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-bold mb-8 text-white">Lịch chiếu phim</h1>

                <ShowtimeFilter
                    availableDates={availableDates}
                    availableMovies={availableMovies}
                    availableFormats={availableFormats}
                    selectedDate={selectedDate}
                    selectedMovieId={selectedMovieId}
                    selectedFormat={selectedFormat}
                    onDateChange={setSelectedDate}
                    onMovieChange={setSelectedMovieId}
                    onFormatChange={setSelectedFormat}
                />
                <div className="space-y-12">
                    {filteredMovies.length > 0 ? (
                        filteredMovies.map(movie => (
                            <div
                                key={movie.id}
                                className="flex flex-col md:flex-row gap-6 p-6 bg-card/50 rounded-lg border border-border"
                            >
                                {/* Poster & Info */}
                                <div className="w-full md:w-1/4 lg:w-1/5">
                                    <Link href={`/movies/${movie.id}`}>
                                        <div className="aspect-[2/3] relative rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                                            <Image
                                                src={movie.posterUrl}
                                                alt={movie.title}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw, 20vw"
                                            />
                                        </div>
                                    </Link>
                                    <Link href={`/movies/${movie.id}`}>
                                        <h3 className="text-lg font-bold text-white mt-4 hover:text-primary transition-colors line-clamp-2">
                                            {movie.title}
                                        </h3>
                                    </Link>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge className="bg-primary text-primary-foreground">{movie.ageRating}</Badge>
                                        <span className="text-sm text-muted-foreground">{movie.duration}</span>
                                    </div>
                                </div>

                                {/* Suất chiếu*/}
                                <div className="w-full md:w-3/4 lg:w-4/5">
                                    <h4 className="text-xl font-semibold text-primary mb-4">
                                        Suất chiếu (cho {selectedDate})
                                    </h4>
                                    {filteredShowtimeTypes.length > 0 ? (
                                        <div className="space-y-4">
                                            {filteredShowtimeTypes.map(type => (
                                                <div key={type.type}>
                                                    <p className="font-medium text-white mb-2">{type.type}</p>
                                                    <div className="flex flex-wrap gap-3">
                                                        {type.times.map(time => (
                                                            <Button
                                                                key={time}
                                                                variant="outline"
                                                                className="bg-input hover:bg-primary hover:text-primary-foreground border-primary/30"
                                                                onClick={() => handleBookTicket(movie, time, type.type)}
                                                            >
                                                                {time}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">
                                            Không có suất chiếu nào phù hợp với bộ lọc.
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-card/50 rounded-lg">
                            <p className="text-muted-foreground">
                                Không có phim nào phù hợp với bộ lọc.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}