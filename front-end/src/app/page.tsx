'use client';

import { useEffect, useState } from "react";
import { MovieCard } from "../components/movies/MovieCard"; 
import { useRouter } from "next/navigation";
import type { Movie } from "@/types/movie";
import { filmService } from "@/lib/api/filmService";
import { Skeleton } from "@/components/ui/skeleton"; 

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
            <Skeleton className="h-10 w-48 mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-[300px] rounded-xl" />
                ))}
            </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dark bg-background min-h-screen text-foreground">
      
      {nowShowingMovies.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-4xl font-bold mb-6 text-white">Phim đang chiếu</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
            {nowShowingMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onBook={handleBook}
                onLike={handleLike}
                onDetail={handleDetail}
              />
            ))}
          </div>
        </section>
      )}

      {comingSoonMovies.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-4xl font-bold mb-6 text-white">Phim sắp chiếu</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
            {comingSoonMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onBook={handleBook}
                onLike={handleLike}
                onDetail={handleDetail}
              />
            ))}
          </div>
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