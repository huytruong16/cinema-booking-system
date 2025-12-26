import React from 'react';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

interface PosDateSelectionProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  dates: Date[];
}

export function PosDateSelection({ selectedDate, onDateSelect, dates }: PosDateSelectionProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {dates.map((date, idx) => (
        <Button
          key={idx}
          variant={selectedDate.getDate() === date.getDate() ? "default" : "outline"}
          className="flex-col h-auto py-2 min-w-[80px]"
          onClick={() => onDateSelect(date)}
        >
          <span className="text-xs font-normal">{idx === 0 ? 'Hôm nay' : format(date, 'EEEE')}</span>
          <span className="text-lg font-bold">{format(date, 'dd/MM')}</span>
        </Button>
      ))}
    </div>
  );
}
