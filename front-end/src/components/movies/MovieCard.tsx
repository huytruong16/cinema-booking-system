"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, Info, Ticket, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Movie } from "@/types/movie";

interface MovieCardProps {
    movie: Movie;
    onBook?: (movie: Movie) => void;
    onLike?: (movie: Movie) => void;
    onDetail?: (movie: Movie) => void;
    className?: string;
}

export function MovieCard({
    movie,
    onBook,
    onLike,
    onDetail,
    className,
}: MovieCardProps) {
    const [hovered, setHovered] = useState(false);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const {
        title,
        subTitle,
        posterUrl,
        year,
        type,
        duration,
        ageRating,
        rating,
        tags = [],
        description,
    } = movie;

    const handleMouseEnter = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => setHovered(true), 300);
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setHovered(false);
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Poster */}
            <div
                className={cn(
                    "relative aspect-[2/3] overflow-hidden rounded-xl bg-card shadow-md transition-all hover:z-20 hover:shadow-lg",
                    className
                )}
            >
                <Image
                    src={posterUrl}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 300px) 50vw, 20vw"
                />
            </div>

            {/* Info  */}
            <div className="mt-2 px-1">
                <p className="text-sm font-semibold text-foreground line-clamp-1">{title}</p>

                {/* ⭐ Rating */}
                <div className="flex items-center gap-1 text-xs text-yellow-400 font-medium mt-0.5">
                    <span>{rating?.toFixed(1)}</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="w-3.5 h-3.5"
                    >
                        <path d="M12 .587l3.668 7.431L24 9.748l-6 5.848L19.335 24 12 19.897 4.665 24 6 15.596 0 9.748l8.332-1.73z" />
                    </svg>
                </div>

                <div className="mt-1 flex items-center justify-between text-xs text-muted">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Clock className="size-3" />
                        {duration}
                    </span>
                    <span className="font-semibold text-primary">{ageRating}</span>
                </div>
            </div>


            {/* Preview */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1/2 top-0 z-50 w-[340px] h-[420px] -translate-x-1/2 -translate-y-[5%] overflow-hidden rounded-2xl bg-card text-card-foreground shadow-2xl"
                    >
                        {/* Ảnh */}
                        <div className="relative h-1/2 w-full">
                            <Image src={posterUrl} alt={title} fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        </div>

                        {/* Thông tin */}
                        <div className="h-1/2 p-5 flex flex-col justify-between">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
                                {subTitle && (
                                    <p className="text-sm text-muted-foreground line-clamp-1">{subTitle}</p>
                                )}

                                <div className="flex flex-wrap gap-2 text-xs">
                                    {type && (
                                        <span className="bg-[var(--chart-2)]/20 text-[var(--chart-2)] px-2 py-0.5 rounded-md font-medium">
                                            {type}
                                        </span>
                                    )}
                                    {year && (
                                        <span className="bg-muted/20 text-muted-foreground px-2 py-0.5 rounded-md font-medium">
                                            {year}
                                        </span>
                                    )}
                                    {tags.map((tag, i) => (
                                        <span
                                            key={tag}
                                            className={`px-2 py-0.5 rounded-md font-medium ${i % 3 === 0
                                                    ? "bg-[var(--chart-3)]/20 text-[var(--chart-3)]"
                                                    : i % 3 === 1
                                                        ? "bg-[var(--chart-4)]/20 text-[var(--chart-4)]"
                                                        : "bg-[var(--chart-5)]/20 text-[var(--chart-5)]"
                                                }`}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>

                            <div className="flex items-center gap-2 mt-3">
                                <Button
                                    size="sm"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground pointer-events-auto"
                                    onClick={() => onBook?.(movie)}
                                >
                                    <Ticket className="size-4 mr-1" /> Đặt vé ngay
                                </Button>
                                <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    onClick={() => onLike?.(movie)}
                                    className="pointer-events-auto"
                                >
                                    <Heart className="size-4" />
                                </Button>
                                <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    onClick={() => onDetail?.(movie)}
                                    className="pointer-events-auto"
                                >
                                    <Info className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
