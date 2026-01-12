'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid, isToday, isTomorrow, addDays } from "date-fns";
import { vi } from "date-fns/locale";
import { RotateCcw, Calendar, Film, Monitor } from "lucide-react";
import type { Movie } from '@/types/movie';

interface ShowtimeFilterProps {
  availableDates: string[];
  availableMovies: Movie[]; 
  availableFormats: string[];
  
  selectedDate: string;
  selectedMovieId: string;
  selectedFormat: string;
  
  onDateChange: (value: string) => void;
  onMovieChange: (value: string) => void;
  onFormatChange: (value: string) => void;
  onReset?: () => void;
  resultCount?: number;
}

const getDayOfWeek = (dateString: string) => {
  if (!dateString) return '';
  const date = parseISO(dateString);
  if (!isValid(date)) return '';
  
  if (isToday(date)) return 'Hôm nay';
  if (isTomorrow(date)) return 'Ngày mai';
  return format(date, 'EEEE', { locale: vi });
};

const getDayNumber = (dateString: string) => {
  if (!dateString) return '';
  const date = parseISO(dateString);
  if (!isValid(date)) return '';
  return format(date, 'dd');
};

export function ShowtimeFilter({
  availableDates,
  availableMovies,
  availableFormats,
  selectedDate,
  selectedMovieId,
  selectedFormat,
  onDateChange,
  onMovieChange,
  onFormatChange,
  onReset,
  resultCount
}: ShowtimeFilterProps) {
  const hasActiveFilters = selectedMovieId !== 'all' || selectedFormat !== 'all';
  const quickDates = availableDates.slice(0, 7);

  return (
    <div className="bg-card/50 p-4 md:p-6 rounded-lg border border-border mb-8 space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Chọn ngày chiếu
        </label>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {quickDates.map(date => (
            <button
              key={date}
              onClick={() => onDateChange(date)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[70px] h-[70px] rounded-lg border-2 transition-all shrink-0",
                selectedDate === date
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background/50 text-muted-foreground hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <span className="text-xs font-medium uppercase">{getDayOfWeek(date)}</span>
              <span className="text-xl font-bold">{getDayNumber(date)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Film className="w-4 h-4" />
            Phim
          </label>
          <Select value={selectedMovieId} onValueChange={onMovieChange}>
            <SelectTrigger className="h-11 w-full [&>span]:truncate [&>span]:max-w-[calc(100%-24px)]">
              <SelectValue placeholder="Tất cả phim" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phim</SelectItem>
              {availableMovies.map(movie => (
                <SelectItem key={movie.id} value={movie.id.toString()}>
                  <span className="truncate block max-w-[280px]">{movie.title}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Định dạng
          </label>
          <Select value={selectedFormat} onValueChange={onFormatChange}>
            <SelectTrigger className="h-11 w-full [&>span]:truncate [&>span]:max-w-[calc(100%-24px)]">
              <SelectValue placeholder="Tất cả định dạng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả định dạng</SelectItem>
              {availableFormats.map(format => (
                <SelectItem key={format} value={format}>
                  <span className="truncate block max-w-[280px]">{format}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-transparent hidden lg:block">Action</label>
          {hasActiveFilters && onReset ? (
            <Button
              variant="outline"
              onClick={onReset}
              className="h-11 w-full border-dashed text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Đặt lại bộ lọc
            </Button>
          ) : (
            <div className="h-11" />
          )}
        </div>

        {/* Result Count */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-transparent hidden lg:block">Result</label>
          <div className="flex items-center justify-end h-11 px-3 rounded-md bg-muted/30 border border-border/50">
            {resultCount !== undefined && (
              <span className="text-sm text-muted-foreground">
                Tìm thấy <span className="text-primary font-semibold">{resultCount}</span> phim
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}