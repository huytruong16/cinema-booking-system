'use client';

import Image from 'next/image';
import { Calendar, Clock, Armchair, QrCode, Utensils, Receipt } from 'lucide-react'; // Bỏ MapPin
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Định nghĩa lại interface
interface TicketType {
  id: string;
  movieTitle: string;
  posterUrl: string;
  backdropUrl: string;
  cinemaName: string; // Vẫn giữ trong type để tránh lỗi TS nhưng không render
  roomName: string;
  showDate: string;
  showTime: string;
  seats: string[];
  combos?: { name: string; quantity: number }[];
  price: number;
  status: string;
  qrCode?: string | null;
}

interface TicketDetailProps {
  ticket: TicketType;
}

export function TicketDetail({ ticket }: TicketDetailProps) {
  const isCancelled = ticket.status === 'cancelled';

  return (
    <div className="flex flex-col w-full bg-zinc-950 text-white overflow-hidden rounded-lg shadow-xl border border-zinc-800">
      
      {/* --- HEADER: ẢNH PHIM (Thu nhỏ độ cao) --- */}
      <div className="relative h-32 w-full shrink-0">
        <Image
          src={ticket.backdropUrl || ticket.posterUrl}
          alt={ticket.movieTitle}
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950" />
        <div className="absolute bottom-3 left-4 right-4">
           <h2 className="text-xl font-bold leading-tight text-white shadow-black drop-shadow-md line-clamp-1">
             {ticket.movieTitle}
           </h2>
        </div>
      </div>

      {/* --- BODY: THÔNG TIN VÉ (Compact) --- */}
      <div className="p-4 space-y-4 bg-zinc-950">
        
        {/* Thông tin suất chiếu (Gộp 1 dòng) */}
        <div className="flex justify-between items-center text-sm bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/50">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 text-zinc-300">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span className="font-semibold">{ticket.showDate}</span>
             </div>
             <div className="w-px h-3 bg-zinc-700"></div>
             <div className="flex items-center gap-1.5 text-zinc-300">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span className="font-semibold">{ticket.showTime}</span>
             </div>
          </div>
          <div className="flex items-center gap-1.5">
             <span className="text-zinc-500 text-xs uppercase font-bold">Phòng</span>
             <span className="text-white font-bold">{ticket.roomName}</span>
          </div>
        </div>

        {/* Ghế ngồi & Trạng thái */}
        <div className="flex justify-between items-center px-1">
            <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-0.5">Ghế ngồi</span>
                <div className="flex items-center gap-2">
                    <Armchair className="w-4 h-4 text-primary" />
                    <span className="text-lg font-bold text-white tracking-widest">
                        {ticket.seats.join(', ')}
                    </span>
                </div>
            </div>
            <div className="text-right">
                <Badge variant={isCancelled ? "destructive" : "outline"} className={`text-xs ${isCancelled ? "" : "border-green-500 text-green-500 bg-green-500/10"}`}>
                    {isCancelled ? 'Đã hủy' : 'Đã thanh toán'}
                </Badge>
            </div>
        </div>

        {/* Combo (Nếu có) - Thu gọn */}
        {ticket.combos && ticket.combos.length > 0 && (
            <>
            <Separator className="bg-zinc-800" />
            <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
                    <Utensils className="w-3 h-3" /> Combo
                </span>
                <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                    {ticket.combos.map((combo, idx) => (
                        <div key={idx} className="flex justify-between text-xs py-0.5">
                            <span className="text-zinc-300 truncate max-w-[200px]">{combo.name}</span>
                            <span className="font-bold text-white">x{combo.quantity}</span>
                        </div>
                    ))}
                </div>
            </div>
            </>
        )}

        <Separator className="bg-zinc-800" />

        {/* QR Code Area - Thu nhỏ size */}
        {!isCancelled && ticket.qrCode ? (
            <div className="flex flex-row items-center justify-between gap-4 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="bg-white p-1.5 rounded-lg shrink-0">
                    <Image 
                        src={ticket.qrCode} 
                        alt="QR Code" 
                        width={100}  
                        height={100} 
                        className="mix-blend-multiply"
                    />
                </div>
                <div className="flex flex-col justify-center flex-1 text-right space-y-1">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Mã vé vào cổng</p>
                    <p className="text-xl font-mono font-bold text-white tracking-wider">{ticket.id.split('-')[1] || ticket.id}</p>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                        Đưa mã này cho nhân viên soát vé.
                    </p>
                </div>
            </div>
        ) : (
             <div className="flex flex-col items-center justify-center py-6 text-zinc-600 space-y-2 bg-zinc-900/30 rounded-lg border border-dashed border-zinc-800">
                 <QrCode className="w-8 h-8 opacity-20" />
                 <p className="text-xs">Mã vé không khả dụng</p>
             </div>
        )}

        {/* Footer: Tổng tiền */}
        <div className="flex justify-between items-center pt-1">
            <div className="flex items-center gap-1.5 text-zinc-500">
                <Receipt className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase font-bold">Tổng tiền</span>
            </div>
            <span className="text-lg font-bold text-primary">{ticket.price.toLocaleString('vi-VN')} ₫</span>
        </div>

      </div>
    </div>
  );
}