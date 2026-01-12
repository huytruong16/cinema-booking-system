'use client';
import * as React from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Info, Ticket, TrendingUp } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { TopMovieBanner } from "@/types/home-banner";
import { statisticsService } from "@/services/statistics.service";
import { Skeleton } from "@/components/ui/skeleton";

const formatCurrency = (value: number): string => {
    if (value >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
        return `${(value / 1_000).toFixed(1)}K`;
    }
    return value.toLocaleString('vi-VN');
};

const getRankStyles = (rank: number) => {
    switch (rank) {
        case 1:
            return "bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-lg shadow-yellow-500/30";
        case 2:
            return "bg-gradient-to-r from-gray-300 to-gray-400 text-black shadow-lg shadow-gray-400/30";
        case 3:
            return "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-600/30";
        default:
            return "bg-gradient-to-r from-zinc-600 to-zinc-700 text-white";
    }
};

export default function TopWeeklyHeroBanner() {
    const [banners, setBanners] = React.useState<TopMovieBanner[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [carouselApi, setCarouselApi] = React.useState<any>(null);
    const router = useRouter();

    React.useEffect(() => {
        if (!carouselApi || banners.length <= 1) return;

        const interval = setInterval(() => {
            if (carouselApi.canScrollNext()) {
                carouselApi.scrollNext();
            } else {
                carouselApi.scrollTo(0);
            }
        }, 8000);

        return () => clearInterval(interval);
    }, [carouselApi, banners.length]);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await statisticsService.getTopMoviesForBanner(5);
                setBanners(data);
            } catch (error) {
                console.error('Failed to fetch top movies for banner:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    React.useEffect(() => {
        if (!carouselApi) return;
        const onSelect = () => setSelectedIndex(carouselApi.selectedScrollSnap());
        carouselApi.on("select", onSelect);
        return () => carouselApi.off("select", onSelect);
    }, [carouselApi]);

    const handleBook = (movieId: string | number) => {
        router.push(`/movies/${movieId}`);
    };

    const handleDetail = (movieId: string | number) => {
        router.push(`/movies/${movieId}`);
    };

    if (loading) {
        return (
            <div className="relative w-full h-[85vh] bg-black flex items-end pb-24">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="relative z-20 px-4 md:px-20 max-w-4xl pb-20 md:pb-16 w-full">
                    <Skeleton className="h-8 w-32 mb-4" />
                    <Skeleton className="h-16 w-3/4 mb-4" />
                    <Skeleton className="h-6 w-1/2 mb-6" />
                    <div className="flex gap-2 mb-4">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-20 w-full mb-6" />
                    <div className="flex gap-4">
                        <Skeleton className="h-14 w-40" />
                        <Skeleton className="h-14 w-14 rounded-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!banners || banners.length === 0) return null;

    return (
        <div className="relative w-full h-[85vh] overflow-hidden bg-black">
            <Carousel
                opts={{ loop: true }}
                setApi={setCarouselApi}
                className="w-full h-full relative"
            >
                <CarouselContent>
                    {banners.map((banner, index) => {
                        const { movie, rank, ticketsSold, revenue } = banner;
                        const displayImage = movie.backdropUrl || movie.posterUrl;
                        const isActive = index === selectedIndex;

                        return (
                            <CarouselItem key={movie.id}>
                                <div className="relative w-full h-[85vh] text-white flex items-end pb-24 overflow-hidden">
                                    {/* Background ambiance */}
                                    <div className="absolute inset-0">
                                        <div className="absolute inset-0 overflow-hidden">
                                            <Image
                                                src={displayImage || "/placeholder.jpg"}
                                                alt="Background Ambiance"
                                                fill
                                                priority={index === 0}
                                                sizes="100vw"
                                                className="object-cover object-center opacity-30 scale-110 blur-sm"
                                            />
                                        </div>

                                        {/* Main image with Ken Burns effect */}
                                        <div
                                            className={cn(
                                                "absolute inset-0 z-10 transition-transform duration-[10000ms] ease-out will-change-transform",
                                                isActive ? "scale-110" : "scale-100"
                                            )}
                                        >
                                            <Image
                                                src={displayImage || "/placeholder.jpg"}
                                                alt={movie.title || "Banner"}
                                                fill
                                                priority={index === 0}
                                                sizes="100vw"
                                                className="object-cover md:object-contain object-center"
                                            />
                                        </div>

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-20" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent z-20" />
                                    </div>

                                    {/* Rank Badge - Fixed position top-right */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className={cn(
                                            "absolute top-24 right-4 md:right-8 z-30 inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-base",
                                            getRankStyles(rank)
                                        )}
                                    >
                                        <TrendingUp className="w-5 h-5" />
                                        TOP {rank} TUẦN NÀY
                                    </motion.div>

                                    {/* Content */}
                                    <motion.div
                                        key={movie.id + "-content"}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                                        className="relative z-30 px-4 md:px-20 max-w-4xl pb-20 md:pb-16 w-full"
                                    >
                                        {/* Title */}
                                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-2 drop-shadow-xl md:line-clamp-none line-clamp-2 tracking-tight text-white">
                                            {movie.title}
                                        </h1>

                                        {/* Subtitle */}
                                        {movie.subTitle && (
                                            <p className="text-lg md:text-2xl text-gray-300 font-medium mb-4 tracking-wide drop-shadow-md">
                                                {movie.subTitle}
                                            </p>
                                        )}

                                        {/* Stats */}
                                        <div className="flex flex-wrap items-center gap-4 mb-4">
                                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                                <Ticket className="w-4 h-4 text-green-400" />
                                                <span className="text-sm font-semibold">{ticketsSold.toLocaleString('vi-VN')} vé</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                                <span className="text-sm font-semibold text-yellow-400">₫{formatCurrency(revenue)}</span>
                                            </div>
                                            {movie.rating && movie.rating > 0 && (
                                                <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1.5 rounded-full">
                                                    <span className="text-yellow-400">★</span>
                                                    <span className="text-sm font-semibold">{movie.rating.toFixed(1)}</span>
                                                </div>
                                            )}
                                            {movie.duration && (
                                                <span className="text-sm text-gray-400">{movie.duration}</span>
                                            )}
                                        </div>

                                        {/* Tags */}
                                        {movie.tags && movie.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {movie.tags.slice(0, 4).map((tag) => (
                                                    <Badge
                                                        key={tag}
                                                        variant="outline"
                                                        className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        {/* Description */}
                                        {movie.description && (
                                            <p className="text-gray-300 max-w-2xl text-base md:text-lg mb-6 leading-relaxed line-clamp-2">
                                                {movie.description}
                                            </p>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-4">
                                            <Button
                                                onClick={() => handleBook(movie.id)}
                                                className="relative overflow-hidden group rounded-full px-8 py-7 text-lg font-semibold transition-all duration-300 bg-gradient-to-r from-red-600 to-red-800 hover:scale-105 hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] border border-red-500/50"
                                            >
                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                                <span className="relative flex items-center gap-3">
                                                    <span className="bg-white text-red-600 rounded-full p-2 group-hover:rotate-180 transition-transform duration-500">
                                                        <Play className="w-5 h-5 fill-current" />
                                                    </span>
                                                    <span>Đặt vé ngay</span>
                                                </span>
                                            </Button>

                                            <Button
                                                variant="outline"
                                                onClick={() => handleDetail(movie.id)}
                                                className="rounded-full border-white/30 bg-white/10 hover:bg-white/20 text-white w-14 h-14 p-0 flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-110"
                                            >
                                                <Info className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                </div>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>

                <CarouselPrevious className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full border-none backdrop-blur-sm z-30 transition-all duration-300 hover:scale-110" />
                <CarouselNext className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full border-none backdrop-blur-sm z-30 transition-all duration-300 hover:scale-110" />
            </Carousel>

            {/* Thumbnail Navigation */}
            <div className="absolute bottom-8 right-8 flex gap-3 z-30">
                {banners.map((banner, index) => {
                    const thumbImage = banner.movie.backdropUrl || banner.movie.posterUrl;
                    return (
                        <button
                            key={banner.movie.id}
                            onClick={() => {
                                setSelectedIndex(index);
                                carouselApi?.scrollTo(index);
                            }}
                            className={cn(
                                "relative w-24 h-14 rounded-lg overflow-hidden transition-all duration-300 group",
                                selectedIndex === index
                                    ? "ring-2 ring-red-500 scale-105 shadow-lg shadow-red-500/30"
                                    : "opacity-60 hover:opacity-100 hover:scale-105"
                            )}
                        >
                            <Image
                                src={thumbImage || "/placeholder.jpg"}
                                alt={banner.movie.title}
                                fill
                                sizes="100px"
                                className="object-cover"
                            />
                            {/* Rank overlay */}
                            <div className={cn(
                                "absolute top-1 left-1 text-xs font-bold px-1.5 py-0.5 rounded",
                                getRankStyles(banner.rank)
                            )}>
                                {banner.rank}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Slide indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setSelectedIndex(index);
                            carouselApi?.scrollTo(index);
                        }}
                        className={cn(
                            "h-1 rounded-full transition-all duration-300",
                            selectedIndex === index
                                ? "w-8 bg-red-500"
                                : "w-2 bg-white/40 hover:bg-white/60"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}
