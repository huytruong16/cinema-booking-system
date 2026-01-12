'use client';

import { useEffect, useState } from "react";
import { MovieCarousel } from "../components/movies/MovieCarrosel";
import { useRouter } from "next/navigation";
import type { Movie } from "@/types/movie";
import { filmService } from "@/services/film.service";
import { Skeleton } from "@/components/ui/skeleton";
import TopWeeklyHeroBanner from "@/components/home/TopWeeklyHeroBanner";

export default function MoviesPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      const data = await filmService.getAllFilms();
      setMovies(data);
      setLoading(false);
    };

    fetchMovies();
  }, []);

  const nowShowingMovies = movies.filter(
    (movie) => movie.status === "now_showing"
  );
  const comingSoonMovies = movies.filter(
    (movie) => movie.status === "coming_soon"
  );

  const handleBook = (movie: Movie) => {
    router.push(`/movies/${movie.id}`);
  };

  const handleLike = (movie: Movie) => {
    alert(`Bạn đã thích phim "${movie.title}"!`);
  };

  const handleDetail = (movie: Movie) => {
    router.push(`/movies/${movie.id}`);
  };

  if (loading) {
    return (
      <main className="dark bg-background min-h-screen text-foreground px-6 py-10">
        <div className="max-w-7xl mx-auto space-y-10">
          <Skeleton className="h-[400px] w-full rounded-xl mb-8" />

          <div>
            <Skeleton className="h-10 w-48 mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-[300px] rounded-xl" />
              ))}
            </div>
          </div>

          <div>
            <Skeleton className="h-10 w-48 mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={`coming-${i}`} className="h-[300px] rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dark bg-background min-h-screen text-foreground">
      <TopWeeklyHeroBanner />

      {nowShowingMovies.length > 0 && (
        <section className="max-w-7xl mx-auto py-6">
          <MovieCarousel
            title="Phim đang chiếu"
            movies={nowShowingMovies}
            onCardBook={handleBook}
            onCardLike={handleLike}
            onCardDetail={handleDetail}
            itemsPerPage={5}
          />
        </section>
      )}

      {comingSoonMovies.length > 0 && (
        <section className="max-w-7xl mx-auto py-6">
          <MovieCarousel
            title="Phim sắp chiếu"
            movies={comingSoonMovies}
            onCardBook={handleBook}
            onCardLike={handleLike}
            onCardDetail={handleDetail}
            itemsPerPage={5}
          />
        </section>
      )}

      {!loading && movies.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          Hiện chưa có dữ liệu phim.
        </div>
      )}
    </main>
  );
}