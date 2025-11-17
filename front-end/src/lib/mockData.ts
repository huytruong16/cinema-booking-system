import { Movie } from "@/types/movie";

export const mockMovies: Movie[] = [
  {
    id: 1,
    title: "Inside Out 2",
    subTitle: "Những mảnh ghép cảm xúc 2",
    posterUrl: "https://upload.wikimedia.org/wikipedia/vi/thumb/a/a3/Inside_Out_2_VN_poster.jpg/375px-Inside_Out_2_VN_poster.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/pI5jxew0I9kub4IXrtsOB8F40dw.jpg",
    year: 2024,
    type: "2D/3D",
    duration: "1h 36m",
    ageRating: "K",
    rating: 8.5,
    tags: ["Hoạt hình", "Gia đình", "Hài hước"],
    description: "Riley bước vào tuổi dậy thì, đối mặt với những cảm xúc mới mẻ và hỗn loạn như Lo lắng, Ganh tị, Xấu hổ và Chán nản...",
    trailerUrl: "https://www.youtube.com/embed/LEjhY15eCx0?si=Gb1YCXqZeKejb3RI",
    status: "now_showing",
  },
  {
    id: 2,
    title: "Deadpool & Wolverine",
    subTitle: "Siêu anh hùng song sát",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/j290n2wN3MNGsQ2p8o9S0sS0E8.jpg",
    year: 2024,
    type: "2D/IMAX",
    duration: "2h 07m",
    ageRating: "T18",
    rating: 9.1,
    tags: ["Hành động", "Hài hước"],
    description: "Deadpool được tổ chức TVA kéo khỏi cuộc sống yên bình và giao nhiệm vụ cứu vãn Đa vũ trụ...",
    trailerUrl: "https://www.youtube.com/embed/u_JbX2c_wlI",
    status: "now_showing",
  },
  {
    id: 3,
    title: "A Quiet Place: Day One",
    subTitle: "Vùng đất câm lặng: Ngày đầu tiên",
    posterUrl: "https://image.tmdb.org/t/p/original/g5ra0GScw3svfCxGczTAohUH2yY.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/z1aZkp16kzguKi3BHKCuRGRNGq4.jpg",
    year: 2024,
    type: "2D",
    duration: "1h 40m",
    ageRating: "T16",
    rating: 8.1,
    tags: ["Kinh dị", "Giật gân"],
    description: "Trải nghiệm ngày đầu tiên thế giới bị xâm chiếm bởi những sinh vật ngoài hành tinh săn mồi bằng âm thanh.",
    trailerUrl: "https://www.youtube.com/embed/YPY7J-f9bVM",
    status: "coming_soon",
  },
  {
    id: 4,
    title: "Mission: Impossible – Dead Reckoning Part One",
    subTitle: "Nhiệm vụ bất khả thi: Quá trình giải cứu phần một",
    posterUrl: "https://image.tmdb.org/t/p/original/eoLBADTttXo4HJLLUK9amxE4RRM.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/mRdNsdTJsn5FGjnMs8FyyiQKCaV.jpg",
    year: 2023,
    type: "IMAX/3D",
    duration: "2h 43m",
    ageRating: "T16",
    rating: 8.3,
    tags: ["Hành động", "Gián điệp", "Mạo hiểm"],
    description: "Ethan Hunt tiếp tục cuộc chiến chống lại những thế lực đen tối trong phần mới nhất của loạt phim Mission: Impossible.",
    trailerUrl: "https://www.youtube.com/embed/7bV2v6_F7fw",
    status: "now_showing",
  },
  {
    id: 5,
    title: "The Marvels",
    subTitle: "Những Marvels",
    posterUrl: "https://image.tmdb.org/t/p/original/dffTM3qQ30xC0bJ7MUs2s3HrZ4e.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/w4pRLYYbhHn3sh9kqRgPZM6GjyS.jpg",
    year: 2024,
    type: "2D/IMAX",
    duration: "1h 45m",
    ageRating: "T14",
    rating: 7.8,
    tags: ["Hành động", "Siêu anh hùng", "Khoa học viễn tưởng"],
    description: "Các siêu anh hùng của Vũ trụ Marvel hợp lực để chống lại mối đe dọa toàn cầu.",
    trailerUrl: "https://www.youtube.com/embed/WzU7Gv_FZ3A",
    status: "coming_soon",
  }
];

export const mockGenres = [
  "Hành động",
  "Hài hước",
  "Kinh dị",
  "Hoạt hình",
  "Gia đình",
  "Giật gân",
  "Siêu anh hùng",
  "Khoa học viễn tưởng",
  "Gián điệp",
];
export const mockShowtimes = [
  {
    date: "Hôm nay, 13/11",
    types: [
      {
        type: "2D Phụ đề (Phòng 1)",
        times: ["18:00", "19:30", "20:45", "22:00"]
      },
      {
        type: "IMAX 2D Phụ đề (Phòng 3)",
        times: ["19:00", "21:30"]
      },
      {
        type: "2D Lồng tiếng (Phòng 2)",
        times: ["18:15", "19:45", "21:00"]
      }
    ]
  },
  {
    date: "Ngày mai, 14/11",
    types: [
      {
        type: "2D Phụ đề (Phòng 1)",
        times: ["14:00", "16:30", "18:00", "20:15", "22:00"]
      },
      {
        type: "2D Lồng tiếng (Phòng 2)",
        times: ["15:00", "17:15", "19:30"]
      },
      {
        type: "IMAX 2D Phụ đề (Phòng 3)",
        times: ["19:00", "21:30"]
      }
    ]
  }
];
export const mockCombos = [
  {
    id: 'combo_gaubong',
    name: 'COMBO NHÀ GẤU',
    price: 249000,
    imageUrl: 'https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS037_COMBO_NHA_GAU.png?rand=1723084117',
  },
  {
    id: 'combo_couple',
    name: 'COMBO ĐÔI',
    price: 150000,
    imageUrl: 'https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS036_COMBO_CO_GAU.png?rand=1723084117',
  },
  {
    id: 'combo_single',
    name: 'COMBO ĐƠN',
    price: 90000,
    imageUrl: 'https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS035_COMBO_GAU.png?rand=1723084117',
  },
];
export const mockPromotions = [
  {
    id: 1,
    code: "HELLOMOVIX",
    description: "Giảm 20% cho thành viên mới",
    type: "PERCENT", // PHANTRAM
    value: 20,
    maxDiscount: 50000,
    minOrder: 0,
  },
  {
    id: 2,
    code: "WEDNESDAY50",
    description: "Giảm 50K (Thứ 4 Vui Vẻ)",
    type: "FIXED", // CODINH
    value: 50000,
    maxDiscount: null,
    minOrder: 100000,
  },
];
export const mockUserTickets = [
  {
    id: "MVX-892312",
    movieId: 1,
    movieTitle: "Inside Out 2",
    posterUrl: "https://upload.wikimedia.org/wikipedia/vi/thumb/a/a3/Inside_Out_2_VN_poster.jpg/375px-Inside_Out_2_VN_poster.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/pI5jxew0I9kub4IXrtsOB8F40dw.jpg",
    cinemaName: "Movix Thủ Đức",
    roomName: "Phòng 2 (2D)",
    showDate: "2024-06-15", 
    showTime: "19:30",
    seats: ["F5", "F6"],
    // --- THÊM COMBO ---
    combos: [
        { name: "Combo Bắp Lớn + 2 Nước", quantity: 1 }
    ],
    // -----------------
    price: 190000,
    status: "upcoming", 
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MVX-892312",
  },
  {
    id: "MVX-123456",
    movieId: 2,
    movieTitle: "Deadpool & Wolverine",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/j290n2wN3MNGsQ2p8o9S0sS0E8.jpg",
    cinemaName: "Movix Quận 1",
    roomName: "Phòng 1 (IMAX)",
    showDate: "2024-08-20",
    showTime: "20:00",
    seats: ["H10", "H11"],
    // --- THÊM COMBO ---
    combos: [
        { name: "Bắp Phô Mai (L)", quantity: 1 },
        { name: "Coca-Cola (L)", quantity: 2 }
    ],
    // -----------------
    price: 320000,
    status: "upcoming",
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MVX-123456",
  },
  {
    id: "MVX-777888",
    movieId: 4,
    movieTitle: "Mission: Impossible – Dead Reckoning",
    posterUrl: "https://image.tmdb.org/t/p/original/eoLBADTttXo4HJLLUK9amxE4RRM.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/mRdNsdTJsn5FGjnMs8FyyiQKCaV.jpg",
    cinemaName: "Movix Thủ Đức",
    roomName: "Phòng 3",
    showDate: "2023-07-14",
    showTime: "18:15",
    seats: ["E5"],
    combos: [], // Không mua combo
    price: 95000,
    status: "completed",
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MVX-777888",
  },
  {
    id: "MVX-999000",
    movieId: 3,
    movieTitle: "A Quiet Place: Day One",
    posterUrl: "https://image.tmdb.org/t/p/original/g5ra0GScw3svfCxGczTAohUH2yY.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/z1aZkp16kzguKi3BHKCuRGRNGq4.jpg",
    cinemaName: "Movix Quận 7",
    roomName: "Phòng 5",
    showDate: "2024-05-01",
    showTime: "21:00",
    seats: ["J1", "J2", "J3"],
    combos: [
        { name: "Combo Couple", quantity: 1 }
    ],
    price: 270000,
    status: "cancelled", 
    qrCode: null,
  }
];