import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import BookingSeatMap, { SelectedSeat, SeatRenderMeta } from '@/components/booking/BookingSeatMap';
import { Showtime, SeatType } from '@/types/showtime';

interface PosSeatMapSectionProps {
  selectedShowtime: Showtime | null;
  loadingDetails: boolean;
  bookedSeats: string[];
  seatMetaById: Record<string, SeatRenderMeta>;
  selectedSeats: SelectedSeat[];
  onSeatClick: (seat: SelectedSeat) => void;
  seatTypes: SeatType[];
}

export function PosSeatMapSection({
  selectedShowtime,
  loadingDetails,
  bookedSeats,
  seatMetaById,
  selectedSeats,
  onSeatClick,
  seatTypes
}: PosSeatMapSectionProps) {
  if (!selectedShowtime) return null;

  return (
    <Card className="flex-1 min-h-0 flex flex-col">
      <CardHeader className="py-3 border-b">
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          <span>Sơ đồ ghế - {selectedShowtime.PhongChieu?.TenPhongChieu}</span>
          <div className="flex gap-4 text-xs font-normal">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-zinc-700 rounded-sm" /> Đã đặt</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-primary rounded-sm" /> Đang chọn</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 border border-zinc-500 rounded-sm" /> Trống</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative overflow-hidden">
        {loadingDetails ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="h-full overflow-auto p-4">
            <BookingSeatMap
              seatMap={selectedShowtime.PhongChieu?.SoDoGhe || {}}
              bookedSeats={bookedSeats}
              seatMetaById={seatMetaById}
              basePrice={Number(selectedShowtime.PhienBanPhim.GiaVe)}
              selectedSeats={selectedSeats}
              onSeatClick={onSeatClick}
              seatTypes={seatTypes}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
