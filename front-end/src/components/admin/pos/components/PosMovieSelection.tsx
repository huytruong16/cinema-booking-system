import React from 'react';
import Image from 'next/image';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Movie } from '@/types/movie';

interface PosMovieSelectionProps {
  movies: Movie[];
  selectedMovie: Movie | null;
  onMovieSelect: (movie: Movie) => void;
  loading: boolean;
}

export function PosMovieSelection({ movies, selectedMovie, onMovieSelect, loading }: PosMovieSelectionProps) {
  if (loading) {
    return <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap pb-2">
      <div className="flex gap-4">
        {movies.map(movie => (
          <div 
            key={movie.id} 
            className={cn(
              "relative w-[120px] cursor-pointer transition-all rounded-md overflow-hidden border-2",
              selectedMovie?.id === movie.id ? "border-primary scale-105" : "border-transparent opacity-70 hover:opacity-100"
            )}
            onClick={() => onMovieSelect(movie)}
          >
            <div className="aspect-[2/3] relative">
              <Image 
                src={movie.posterUrl} 
                alt={movie.title} 
                fill 
                className="object-cover"
              />
            </div>
            <div className="p-2 bg-background/90 text-xs font-medium truncate text-center">
              {movie.title}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
