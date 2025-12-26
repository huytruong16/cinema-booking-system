import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Showtime } from '@/types/showtime';
import { Movie } from '@/types/movie';

interface PosShowtimeSelectionProps {
  showtimes: Showtime[];
  selectedShowtime: Showtime | null;
  onShowtimeSelect: (showtimeId: string) => void;
  loading: boolean;
  selectedMovie: Movie | null;
}

export function PosShowtimeSelection({ 
  showtimes, 
  selectedShowtime, 
  onShowtimeSelect, 
  loading, 
  selectedMovie 
}: PosShowtimeSelectionProps) {
  if (!selectedMovie) return null;

  return (
    <Card className="shrink-0">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium">Suất chiếu - {selectedMovie.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {loading ? (
          <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
        ) : showtimes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">Không có suất chiếu nào cho ngày này.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {showtimes.map(st => (
              <Button
                key={st.MaSuatChieu}
                variant={selectedShowtime?.MaSuatChieu === st.MaSuatChieu ? "default" : "outline"}
                onClick={() => onShowtimeSelect(st.MaSuatChieu)}
                className="flex flex-col h-auto py-2 px-4"
              >
                <span className="text-lg font-bold">
                  {format(new Date(st.ThoiGianBatDau), 'HH:mm')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {st.PhongChieu?.TenPhongChieu}
                </span>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
