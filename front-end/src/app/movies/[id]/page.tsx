'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { mockMovies, mockShowtimes } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Star, PlayCircle, Calendar } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MovieReviews } from '@/components/movies/MovieReviews';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id;

  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const daysList = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }).map((_, i) => {
      const date = addDays(today, i);
      const dayNumber = format(date, 'd');
      const fullDate = format(date, 'dd/MM');

      let dayLabel = format(date, 'EEEE', { locale: vi });
      if (i === 0) dayLabel = 'Hôm nay';
      else {
        dayLabel = dayLabel.replace("thứ ", "Thứ ").replace("chủ nhật", "CN");
        const dayIndex = date.getDay();
        if (dayIndex > 0) dayLabel = `Thứ ${dayIndex + 1}`;
        if (dayIndex === 0) dayLabel = "CN";
        if (i === 0) dayLabel = "Hôm nay";
      }

      return { date, dayNumber, dayLabel, fullDate };
    });
  }, []);

  const [selectedDate, setSelectedDate] = useState(daysList[0].fullDate);

  const movie = mockMovies.find(m => m.id.toString() === movieId);

  const currentShowtime = useMemo(() => {
    return mockShowtimes.find(show => show.date.includes(selectedDate));
  }, [selectedDate]);

  if (!movie) {
    return (
      <div className="dark bg-background min-h-screen text-foreground flex items-center justify-center">
        <h1 className="text-2xl">Không tìm thấy phim</h1>
      </div>
    );
  }

  const handleBookTicket = (time: string, type: string, date: string) => {
    router.push(
      `/booking?movieId=${movie.id}&date=${encodeURIComponent(
        date
      )}&time=${encodeURIComponent(time)}&format=${encodeURIComponent(type)}`
    );
  };

  return (
    <div className="dark bg-background min-h-screen text-foreground">
      <div className="relative w-full h-[50vh] min-h-[400px]">
        <Image
          src={movie.backdropUrl || movie.posterUrl}
          alt={`${movie.title} backdrop`}
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 pb-20 -mt-[25vh]">
        {/* Thông tin phim */}
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="w-full md:w-2/3 lg:w-3/4 pt-10">
            <h1 className="text-4xl font-bold text-white">{movie.title}</h1>
            <p className="text-lg text-muted-foreground mt-1">{movie.subTitle}</p>

            <div className="flex items-center gap-4 mt-4 text-sm">
              <Badge className="text-base bg-primary text-primary-foreground">{movie.ageRating}</Badge>
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                {movie.rating?.toFixed(1)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-muted-foreground" />
                {movie.duration}
              </span>
              <span>{movie.year}</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {movie.tags?.map(tag => (
                <Badge key={tag} variant="outline" className="border-primary/50 text-primary/90">
                  {tag}
                </Badge>
              ))}
            </div>

            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              {movie.description}
            </p>
            {movie.trailerUrl && (
              <Dialog open={isTrailerOpen} onOpenChange={setIsTrailerOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-6 bg-red-600 hover:bg-red-700 text-white">
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Xem Trailer
                  </Button>
                </DialogTrigger>
                <DialogContent className="dark bg-background text-foreground border-border max-w-5xl p-0">
                  <div className="aspect-video relative">
                    {isTrailerOpen && (
                      <iframe
                        src={movie.trailerUrl}
                        title="Movie Trailer"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                      ></iframe>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white mb-6">
            <Calendar className="w-7 h-7 inline-block mr-3 -mt-1" />
            Lịch chiếu
          </h2>

          <div className="w-full px-8 md:px-10">
            <Carousel
              opts={{
                align: "start",
                slidesToScroll: 3,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {daysList.map((day) => {
                  const isActive = selectedDate === day.fullDate;
                  return (
                    <CarouselItem
                      key={day.fullDate}
                      className="pl-2 md:pl-4 basis-1/3 md:basis-1/5 lg:basis-[14.28%]"
                    >
                      <button
                        onClick={() => setSelectedDate(day.fullDate)}
                        className={cn(
                          "flex flex-col items-center justify-center w-full h-[80px] rounded-lg border transition-all duration-200",
                          isActive
                            ? "bg-[#C41E3A] border-[#C41E3A] text-white shadow-lg shadow-red-900/20 scale-105"
                            : "bg-card/50 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800"
                        )}
                      >
                        <span className={cn("text-xs font-medium mb-1 uppercase", isActive ? "text-white/80" : "text-zinc-500")}>
                          {day.dayLabel}
                        </span>
                        <span className={cn("text-2xl font-bold", isActive ? "text-white" : "text-zinc-200")}>
                          {day.dayNumber}
                        </span>
                      </button>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-primary -left-8 md:-left-10" />
              <CarouselNext className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-primary -right-8 md:-right-10" />
            </Carousel>
          </div>
          <div className="mt-8 space-y-6 min-h-[200px]">
            {currentShowtime ? (
              <div className="animate-in fade-in duration-500">
                <div className="space-y-6">
                  {currentShowtime.types.map(type => (
                    <div key={type.type} className="bg-zinc-900/50 p-5 rounded-xl border border-zinc-800">
                      <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-[#C41E3A] rounded-full inline-block"></span>
                        {type.type}
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {type.times.map(time => (
                          <Button
                            key={time}
                            variant="outline"
                            className="min-w-[100px] h-11 bg-transparent hover:bg-[#C41E3A] hover:text-white border-zinc-700 text-zinc-300 transition-all font-medium text-base"
                            onClick={() => handleBookTicket(time, type.type, currentShowtime.date)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                <Calendar className="w-12 h-12 text-zinc-600 mb-3" />
                <p className="text-zinc-400 font-medium">Chưa có lịch chiếu cho ngày này.</p>
                <p className="text-zinc-500 text-sm mt-1">Vui lòng chọn ngày khác hoặc quay lại sau.</p>
              </div>
            )}
          </div>
        </div>
        <div className='m-10'>
          <MovieReviews movieId={movie.id} movieRating={movie.rating} />
        </div>

      </div>
    </div>
  );
}