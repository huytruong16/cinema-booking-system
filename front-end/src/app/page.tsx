'use client';

import { MovieCard } from "../components/movies/MovieCard";
import { useRouter } from "next/navigation";

export default function MoviesPage() {
  const router = useRouter();

  const movies = [
    {
      id: 1,
      title: "Inside Out 2",
      subTitle: "Cảm xúc hỗn độn trở lại",
      posterUrl:
        "https://upload.wikimedia.org/wikipedia/vi/thumb/a/a3/Inside_Out_2_VN_poster.jpg/375px-Inside_Out_2_VN_poster.jpg",
      year: 2024,
      type: "2D",
      duration: "1h 45m",
      ageRating: "T18",
      rating: 8.5,
      tags: ["Hoạt hình", "Gia đình"],
      description:
        "Riley bước vào tuổi dậy thì, đối mặt với những cảm xúc mới mẻ và hỗn loạn.",
    },
    {
      id: 2,
      title: "Deadpool & Wolverine",
      subTitle: "Siêu anh hùng song sát",
      posterUrl:
        "https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg",
      year: 2024,
      type: "3D",
      duration: "2h 10m",
      ageRating: "T13",
      rating: 9.1,
      tags: ["Hành động", "Hài hước"],
      description:
        "Deadpool hợp tác cùng Wolverine trong hành trình cứu vãn đa vũ trụ đầy máu lửa.",
    },
    {
      id: 3,
      title: "Despicable Me 4",
      subTitle: "Kẻ cắp mặt trăng 4",
      posterUrl:
        "https://upload.wikimedia.org/wikipedia/en/e/ed/Despicable_Me_4_Theatrical_Release_Poster.jpeg",
      year: 2024,
      type: "2D",
      duration: "1h 40m",
      ageRating: "T18",
      rating: 7.8,
      tags: ["Hoạt hình", "Hài hước"],
      description:
        "Gru và gia đình phải đối mặt với một kẻ thù mới, trong khi Minions lại tạo nên loạn xạ.",
    },
  ];

  const handleBook = (movie: any) => {
    alert(`Bạn đã chọn đặt vé cho phim "${movie.title}"!`);
    // router.push(`/booking/${movie.id}`);
  };

  const handleLike = (movie: any) => {
    alert(`Bạn đã thích phim "${movie.title}"!`);
  };

  const handleDetail = (movie: any) => {
    router.push(`/movies/${movie.id}`);
  };

  return (
    <main className="dark bg-background min-h-screen text-foreground">
      <section className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">Phim đang chiếu</h1>

        {/* Danh sách phim */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
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
