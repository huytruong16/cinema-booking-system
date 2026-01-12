"use client";

import React, { useState, useMemo } from "react";
import type { Movie } from "@/types/movie";
import { MovieCard } from "./MovieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
  onCardBook?: (movie: Movie) => void;
  onCardLike?: (movie: Movie) => void;
  onCardDetail?: (movie: Movie) => void;
  itemsPerPage?: number;
}

export function MovieCarousel({
  title,
  movies,
  onCardBook,
  onCardLike,
  onCardDetail,
  itemsPerPage = 5,
}: MovieCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = useMemo(() => {
    return Math.ceil(movies.length / itemsPerPage);
  }, [movies.length, itemsPerPage]);
  const currentMovies = useMemo(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return movies.slice(start, end);
  }, [movies, currentPage, itemsPerPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  if (movies.length === 0) return null;

  return (
    <div className="relative w-full py-6">
      {/* Header */}
      <div className="flex flex-row items-center justify-between mb-5 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {title}
          </h2>
          <span className="text-sm text-zinc-500">
            ({movies.length} phim)
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevPage}
              className="h-9 w-9 rounded-full bg-zinc-800/80 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              className="h-9 w-9 rounded-full bg-zinc-800/80 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6">
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10"
        >
          {currentMovies.map((movie, index) => (
            <div
              key={movie.id}
              className="w-full animate-in fade-in slide-in-from-right-4 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <MovieCard
                movie={movie}
                onBook={onCardBook}
                onLike={onCardLike}
                onDetail={onCardDetail}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={cn(
                "transition-all duration-300 rounded-full",
                currentPage === i
                  ? "w-8 h-2 bg-primary"
                  : "w-2 h-2 bg-zinc-600 hover:bg-zinc-500"
              )}
              aria-label={`Trang ${i + 1}`}
            />
          ))}
          <span className="text-xs text-zinc-500 ml-3">
            {currentPage + 1} / {totalPages}
          </span>
        </div>
      )}
    </div>
  );
}
