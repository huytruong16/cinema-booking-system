'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Armchair, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

import { SeatType } from '@/types/showtime';

export interface SelectedSeat {
  id: string; // VD: A01, G01
  type: string;
  price: number;
}

export interface SeatRenderMeta {
  type: string;
  price: number;
  status?: string;
}

interface BookingSeatMapProps {
  seatMap: { [key: string]: string[] };
  bookedSeats?: string[];
  seatMetaById?: Record<string, SeatRenderMeta>;
  basePrice: number;
  selectedSeats: SelectedSeat[];
  onSeatClick: (seat: SelectedSeat) => void;
  seatTypes: SeatType[];
}

export default function BookingSeatMap({
  seatMap,
  bookedSeats = [],
  seatMetaById,
  basePrice,
  selectedSeats,
  onSeatClick,
  seatTypes = []
}: BookingSeatMapProps) {

  const rows = Object.keys(seatMap).sort();

  const handleInternalSeatClick = (
    seatId: string,
    seatType: string,
    seatPrice: number
  ) => {
    onSeatClick({ id: seatId, type: seatType, price: seatPrice });
  };

  const getSeatColor = (type: string) => {
    // Normalize type string for comparison
    const normalizedType = type.toLowerCase();

    if (normalizedType.includes('vip')) return "bg-yellow-900/20 border-yellow-700/50 hover:bg-yellow-900/40 text-yellow-500";
    if (normalizedType.includes('doi') || normalizedType.includes('đôi')) return "bg-purple-900/20 border-purple-700/50 hover:bg-purple-900/40 text-purple-400";
    // Default or 'thuong'
    return "bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-300";
  };

  const getSeatIconColor = (type: string) => {
    const normalizedType = type.toLowerCase();
    if (normalizedType.includes('vip')) return "text-yellow-400";
    if (normalizedType.includes('doi') || normalizedType.includes('đôi')) return "text-purple-400";
    return "text-slate-400";
  };

  return (
    <Card className="bg-card/50 border border-border text-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">Chọn ghế</CardTitle>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 pt-2">
          {seatTypes.length > 0 ? (
            seatTypes.map(st => (
              <div key={st.MaLoaiGhe} className="flex items-center gap-1.5">
                <Armchair className={cn("size-4", getSeatIconColor(st.LoaiGhe))} /> {st.LoaiGhe}
              </div>
            ))
          ) : (
            <>
              <div className="flex items-center gap-1.5"><Armchair className="size-4 text-slate-400" /> Thường</div>
              <div className="flex items-center gap-1.5"><Armchair className="size-4 text-yellow-400" /> VIP</div>
              <div className="flex items-center gap-1.5"><Armchair className="size-4 text-purple-400" /> Ghế đôi</div>
            </>
          )}
          <div className="flex items-center gap-1.5"><Armchair className="size-4 text-primary" /> Đang chọn</div>
          <div className="flex items-center gap-1.5"><Armchair className="size-4 text-slate-700 opacity-70" /> Đã đặt</div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center px-2 sm:px-4">
        <div className="bg-slate-700 text-center py-1.5 px-12 text-sm rounded-md mb-8 w-full max-w-lg uppercase tracking-widest shadow-[0_10px_15px_-3px_rgba(255,255,255,0.1)]">
          Màn hình
        </div>

        <ScrollArea className="w-full pb-4">
          <div className="flex flex-col gap-3 w-full items-center py-2 overflow-x-auto min-w-[600px]">
            {rows.map(rowName => {
              const seatList = seatMap[rowName];

              return (
                <div key={rowName} className="flex gap-2 items-center flex-nowrap">
                  <span className="text-sm font-bold w-6 text-center text-slate-500">{rowName}</span>

                  {seatList.map((seatNum, index) => {
                    if (!seatNum) {
                      return <div key={`${rowName}-empty-${index}`} className="w-8" />;
                    }
                    const isNextSame = index < seatList.length - 1 && seatList[index + 1] === seatNum;
                    const isPrevSame = index > 0 && seatList[index - 1] === seatNum;
                    if (isPrevSame) return null;
                    const isDouble = isNextSame;
                    const seatId = `${rowName}${seatNum}`;
                    const meta = seatMetaById?.[seatId];

                    let type: 'thuong' | 'vip' | 'doi' = meta?.type ?? 'thuong';
                    let price = meta?.price ?? basePrice;

                    if (!meta) {
                      // Nếu không có API data, tạm thời fallback về thường (hoặc có thể disable ghế này)
                      // Nhưng không hardcode VIP theo hàng D, E, F nữa
                    }

                    const isBooked = meta?.status ? meta.status !== 'CONTRONG' : bookedSeats.includes(seatId);
                    const isSelected = selectedSeats.some(s => s.id === seatId);

                    return (
                      <Button
                        key={seatId}
                        variant="outline"
                        className={cn(
                          "p-0 text-xs flex-shrink-0 transition-all duration-200",
                          isDouble ? "w-[4.5rem] h-8 rounded-lg" : "size-8 rounded-md",

                          getSeatColor(type),
                          isSelected && "bg-primary border-primary text-primary-foreground hover:bg-primary/80 ring-2 ring-offset-2 ring-offset-background ring-primary",
                          isBooked && "bg-slate-800/50 border-transparent text-slate-600 cursor-not-allowed hover:bg-slate-800/50"
                        )}
                        onClick={() => handleInternalSeatClick(seatId, type, price)}
                        disabled={isBooked}
                        title={`${seatId} - ${price.toLocaleString()}đ`}
                      >
                        {isBooked ? <X className="size-4" /> : seatNum}
                      </Button>
                    );
                  })}

                  <span className="text-sm font-bold w-6 text-center text-slate-500">{rowName}</span>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <div className="w-[80%] h-4 mt-2 bg-gradient-to-t from-slate-800/0 via-slate-700/10 to-transparent rounded-[100%] blur-xl pointer-events-none"></div>
      </CardContent>
    </Card>
  );
}