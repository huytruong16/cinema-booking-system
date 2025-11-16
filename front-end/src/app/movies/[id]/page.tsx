'use client';

import { useParams, useRouter } from 'next/navigation'; 
import Image from 'next/image';
import { mockMovies, mockShowtimes } from '@/lib/mockData';
import { Movie } from '@/types/movie';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Star, PlayCircle, Calendar } from 'lucide-react';
import { useState } from 'react'; 
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"; 

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter(); 
  const movieId = params.id;
  
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  const movie = mockMovies.find(m => m.id.toString() === movieId);

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

          <div className="space-y-10">
            {mockShowtimes.map(day => (
              <div key={day.date}>
                <h3 className="text-xl font-semibold text-primary border-b border-primary/20 pb-2 mb-4">
                  {day.date}
                </h3>
                <div className="space-y-6">
                  {day.types.map(type => (
                    <div key={type.type} className="bg-card/50 p-4 rounded-lg border border-border">
                      <h4 className="text-lg font-bold text-white">{type.type}</h4>
                      <div className="flex flex-wrap gap-3 mt-3">
                        {type.times.map(time => (
                          <Button
                            key={time}
                            variant="outline"
                            className="bg-input hover:bg-primary hover:text-primary-foreground border-primary/30"
                            onClick={() => handleBookTicket(time, type.type, day.date)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}