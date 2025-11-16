'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
}

export function ShowtimeFilter({
  availableDates,
  availableMovies,
  availableFormats,
  selectedDate,
  selectedMovieId,
  selectedFormat,
  onDateChange,
  onMovieChange,
  onFormatChange
}: ShowtimeFilterProps) {
  return (
    <div className="bg-card/50 p-4 rounded-lg border border-border mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Chọn ngày</label>
          <Select value={selectedDate} onValueChange={onDateChange}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Chọn ngày" />
            </SelectTrigger>
            <SelectContent>
              {availableDates.map(date => (
                <SelectItem key={date} value={date}>
                  {date}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Chọn phim</label>
          <Select value={selectedMovieId} onValueChange={onMovieChange}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Tất cả phim" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phim</SelectItem>
              {availableMovies.map(movie => (
                <SelectItem key={movie.id} value={movie.id.toString()}>
                  {movie.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Chọn suất</label>
          <Select value={selectedFormat} onValueChange={onFormatChange}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Tất cả suất" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả suất</SelectItem>
              {availableFormats.map(format => (
                <SelectItem key={format} value={format}>
                  {format}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
      </div>
    </div>
  );
}