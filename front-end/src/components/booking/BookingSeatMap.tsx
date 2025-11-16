'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Armchair, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';


type LoaiGhe = 'thuong' | 'vip' | 'doi' | 'disabled';
interface SeatMapData {
  rows: string[];
  cols: number;
  seats: Record<string, 'vip' | 'doi' | 'disabled'>;
}

// Sơ đồ ghế mẫu
const mockSeatMap: SeatMapData = {
  rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
  cols: 14,
  seats: {
    "A1": "disabled", "A14": "disabled", "B1": "disabled", "B14": "disabled",
    "E1": "vip", "E2": "vip", "E3": "vip", "E4": "vip", "E5": "vip", "E6": "vip", "E7": "vip", "E8": "vip", "E9": "vip", "E10": "vip", "E11": "vip", "E12": "vip", "E13": "vip", "E14": "vip",
    "F1": "vip", "F2": "vip", "F3": "vip", "F4": "vip", "F5": "vip", "F6": "vip", "F7": "vip", "F8": "vip", "F9": "vip", "F10": "vip", "F11": "vip", "F12": "vip", "F13": "vip", "F14": "vip",
    "G1": "doi", "G2": "doi", "G3": "doi", "G4": "doi", "G5": "doi", "G6": "doi", "G7": "doi", "G8": "doi", "G9": "doi", "G10": "doi", "G11": "doi", "G12": "doi", "G13": "doi", "G14": "doi",
    "H1": "doi", "H2": "doi", "H3": "doi", "H4": "doi", "H5": "doi", "H6": "doi", "H7": "doi", "H8": "doi", "H9": "doi", "H10": "doi", "H11": "doi", "H12": "doi", "H13": "doi", "H14": "doi",
  }
};
const mockBookedSeats: string[] = ["A3", "A4", "C5", "C6", "D10", "F5", "F6", "F7"];

const TICKET_PRICE = 75000;
const VIP_SURCHARGE = 25000;
const DOUBLE_SURCHARGE = 50000; 

const getSeatType = (seatId: string, map: SeatMapData): LoaiGhe => {
    return map.seats[seatId] || 'thuong';
};


export interface SelectedSeat {
  id: string;
  type: 'thuong' | 'vip' | 'doi';
  price: number;
}

interface BookingSeatMapProps {
  selectedSeats: SelectedSeat[];
  onSeatClick: (seat: SelectedSeat) => void;
  onSeatRemove: (seatId: string) => void;
}

export default function BookingSeatMap({ selectedSeats, onSeatClick, onSeatRemove }: BookingSeatMapProps) {
  
  const handleInternalSeatClick = (seatId: string) => {
    const type = getSeatType(seatId, mockSeatMap);
    
    if (type === 'disabled' || mockBookedSeats.includes(seatId)) return;

    const isSelected = selectedSeats.some(s => s.id === seatId);
    if (isSelected) {
      onSeatRemove(seatId);
    } else {
      let price = TICKET_PRICE;
      if (type === 'vip') price += VIP_SURCHARGE;
      if (type === 'doi') price = (TICKET_PRICE * 2) + DOUBLE_SURCHARGE; 

      onSeatClick({ id: seatId, type, price });
    }
  };

  return (
    <Card className="bg-card/50 border border-border text-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">Chọn ghế</CardTitle>
        {/* Chú thích */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 pt-2">
            <div className="flex items-center gap-1.5"><Armchair className="size-4 text-slate-400" /> Thường</div>
            <div className="flex items-center gap-1.5"><Armchair className="size-4 text-yellow-400" /> VIP</div>
            <div className="flex items-center gap-1.5"><Armchair className="size-4 text-purple-400" /> Ghế đôi</div>
            <div className="flex items-center gap-1.5"><Armchair className="size-4 text-primary" /> Đang chọn</div>
            <div className="flex items-center gap-1.5"><Armchair className="size-4 text-slate-700 opacity-70" /> Đã đặt</div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center px-2 sm:px-4">
        <div className="bg-slate-700 text-center py-1.5 px-12 text-sm rounded-md mb-8 w-full max-w-lg uppercase tracking-widest">
          Màn hình
        </div>
        <ScrollArea className="w-full">
            <div className="flex flex-col gap-2 w-full items-center py-2 overflow-x-auto min-w-[600px]">
            {mockSeatMap.rows.map(row => (
                <div key={row} className="flex gap-2 items-center flex-nowrap">
                <span className="text-sm font-medium w-6 text-center text-slate-500">{row}</span>
                {Array.from({ length: mockSeatMap.cols }, (_, i) => {
                    const col = i + 1;
                    const seatId = `${row}${col}`;
                    const type = getSeatType(seatId, mockSeatMap);
                    const isBooked = mockBookedSeats.includes(seatId);
                    const isDisabled = type === 'disabled';
                    const isVip = type === 'vip';
                    const isDouble = type === 'doi';
                    const isSelected = selectedSeats.some(s => s.id === seatId);

                    return (
                    <Button
                        key={seatId}
                        variant="outline"
                        size="icon"
                        className={cn(
                        "size-8 p-0 text-xs flex-shrink-0",
                        // Màu sắc
                        type === 'thuong' && "bg-input hover:bg-accent",
                        isVip && "bg-yellow-400/20 border-yellow-400/50 hover:bg-yellow-400/30 text-yellow-300",
                        isDouble && "bg-purple-400/20 border-purple-400/50 hover:bg-purple-400/30 text-purple-300",
                        
                        // Trạng thái
                        isSelected && "bg-primary border-primary text-primary-foreground hover:bg-primary/80 ring-2 ring-offset-2 ring-offset-background ring-primary", 
                        (isBooked || isDisabled) && "bg-slate-700/50 border-slate-700 text-slate-600 opacity-60 cursor-not-allowed"
                        )}
                        onClick={() => handleInternalSeatClick(seatId)}
                        disabled={isBooked || isDisabled}
                    >
                        {isDisabled ? <X className="size-4" /> : col}
                    </Button>
                    );
                })}
                <span className="text-sm font-medium w-6 text-center text-slate-500">{row}</span>
                </div>
            ))}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}