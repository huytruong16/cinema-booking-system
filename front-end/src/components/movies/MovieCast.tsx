'use client';

import Image from "next/image";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import type { Actor } from "@/types/actor";

interface MovieCastProps {
    cast: Actor[];
}

export default function MovieCast({ cast }: MovieCastProps) {
    return (
        <div className="w-full max-w-4xl  bg-card rounded-lg p-4">
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full group"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-base font-semibold text-foreground tracking-tight">
                        Cast
                    </h2>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <CarouselPrevious className="static translate-y-0 bg-secondary/40 border border-border hover:bg-accent text-accent-foreground h-6 w-6" />
                        <CarouselNext className="static translate-y-0 bg-secondary/40 border border-border hover:bg-accent text-accent-foreground h-6 w-6" />
                    </div>
                </div>

                {/* Content */}
                <CarouselContent className="-ml-2">
                    {cast.map((actor) => (
                        <CarouselItem
                            key={actor.id}
                            className="pl-2 basis-1/4 sm:basis-1/5 md:basis-1/6"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-1 border border-border/30">
                                    <Image
                                        src={actor.profileUrl}
                                        alt={actor.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <p className="font-medium text-[11px] text-foreground truncate w-full">
                                    {actor.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate w-full">
                                    {actor.character}
                                </p>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
}