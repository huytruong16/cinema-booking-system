'use client';

import { MovieCard } from "../components/movies/MovieCard"; 
import { useRouter } from "next/navigation";
import { mockMovies } from "@/lib/mockData"; 
import type { Movie } from "@/types/movie";

export default function MoviesPage() {
  const router = useRouter();

  const nowShowingMovies = mockMovies.filter(
    (movie) => movie.status === "now_showing"
  );
  const comingSoonMovies = mockMovies.filter(
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

  return (
    <main className="dark bg-background min-h-screen text-foreground">
      
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
    </main>
  );
}