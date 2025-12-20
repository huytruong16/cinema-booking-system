'use client';

import React, { useState, useEffect } from 'react';
import { TicketCard } from '@/components/ticket/TicketCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TicketX, Loader2 } from 'lucide-react';
import { getMyTickets } from '@/services/user.service';
import { TicketResponse } from '@/types/ticket';
import { toast } from 'sonner';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await getMyTickets();
        const mappedTickets = data.map(mapTicketResponseToCardProps);
        setTickets(mappedTickets);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
        toast.error('Không thể tải danh sách vé');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const upcomingTickets = tickets.filter(t => t.status === 'upcoming');
  const historyTickets = tickets;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-2">Vé của tôi</h1>
      <p className="text-zinc-400 mb-8">Quản lý vé xem phim đã đặt và lịch sử giao dịch.</p>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1 mb-6">
          <TabsTrigger 
            value="upcoming" 
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
          >
            Vé sắp chiếu ({upcomingTickets.length})
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
          >
            Lịch sử đặt vé
          </TabsTrigger>
        </TabsList>

        {/* Tab Vé sắp chiếu */}
        <TabsContent value="upcoming" className="space-y-6 animate-in fade-in-50 duration-300">
          {upcomingTickets.length > 0 ? (
            upcomingTickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
              <TicketX className="w-12 h-12 mb-4 opacity-50" />
              <p>Bạn không có vé nào sắp chiếu.</p>
            </div>
          )}
        </TabsContent>

        {/* Tab Lịch sử */}
        <TabsContent value="history" className="space-y-6 animate-in fade-in-50 duration-300">
          {historyTickets.length > 0 ? (
            historyTickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          ) : (
             <div className="flex flex-col items-center justify-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
              <TicketX className="w-12 h-12 mb-4 opacity-50" />
              <p>Lịch sử đặt vé trống.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function mapTicketResponseToCardProps(apiTicket: TicketResponse) {
  const showDateObj = new Date(apiTicket.ThoiGianChieu);
  const now = new Date();
  
  let status = 'upcoming';
  
  const hasPendingRefund = apiTicket.Ves.some(v => v.TrangThai === 'CHOHOANTIEN');
  const hasRefunded = apiTicket.Ves.some(v => v.TrangThai === 'DAHOAN');
  
  if (apiTicket.TrangThaiThanhToan === 'THATBAI' || hasRefunded) {
    status = 'cancelled';
  } else if (hasPendingRefund) {
    status = 'pending_refund';
  } else if (showDateObj < now) {
    status = 'completed';
  }

  return {
    id: apiTicket.MaHoaDon,
    movieTitle: apiTicket.Phim.TenPhim,
    posterUrl: apiTicket.Phim.PosterUrl,
    backdropUrl: apiTicket.Phim.PosterUrl, // Fallback
    cinemaName: 'Movix UIT', // Hardcoded
    roomName: apiTicket.PhongChieu,
    showDate: showDateObj.toLocaleDateString('vi-VN'),
    showTime: showDateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    seats: apiTicket.Ves.map(v => v.SoGhe),
    combos: apiTicket.Combos.map(c => ({ name: c.TenCombo, quantity: c.SoLuong })),
    price: apiTicket.TongTien,
    status: status,
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${apiTicket.MaHoaDon}`
  };
}