'use client';

import React, { useState, useEffect } from 'react';
import { TicketCard } from '@/components/ticket/TicketCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TicketX, Loader2, Clock, CheckCircle2, XCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { getMyTickets } from '@/services/user.service';
import { refundService, RefundRequest, RefundStatus } from '@/services/refund.service';
import { TicketResponse } from '@/types/ticket';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const getStatusBadge = (status: RefundStatus) => {
  switch (status) {
    case 'DANGCHO':
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Đang chờ xử lý</Badge>;
    case 'DAHOAN':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />Đã hoàn tiền</Badge>;
    case 'DAHUY':
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Đã từ chối</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRefunds, setLoadingRefunds] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

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

  useEffect(() => {
    fetchRefundRequests();
  }, []);

  const fetchRefundRequests = async (cursor?: string, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoadingRefunds(true);
      }
      
      const response = await refundService.getMyRequests({ 
        limit: 10,
        cursor: cursor 
      });
      
      if (append) {
        setRefundRequests(prev => [...prev, ...response.data]);
      } else {
        setRefundRequests(response.data);
      }
      
      setNextCursor(response.meta.nextCursor);
      setHasNextPage(response.meta.hasNextPage);
    } catch (error) {
      console.error('Failed to fetch refund requests:', error);
      toast.error('Không thể tải danh sách yêu cầu hoàn vé');
    } finally {
      setLoadingRefunds(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (nextCursor && hasNextPage && !loadingMore) {
      fetchRefundRequests(nextCursor, true);
    }
  };

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
          <TabsTrigger 
            value="refunds" 
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
          >
            Yêu cầu hoàn vé ({refundRequests.length})
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

        {/* Tab Yêu cầu hoàn vé */}
        <TabsContent value="refunds" className="space-y-4 animate-in fade-in-50 duration-300">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-zinc-400">Danh sách các yêu cầu hoàn vé của bạn</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => fetchRefundRequests()}
              disabled={loadingRefunds}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingRefunds ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>

          {loadingRefunds ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : refundRequests.length > 0 ? (
            <>
              {refundRequests.map(request => (
                <Card key={request.MaYeuCau} className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono text-zinc-500">
                            #{request.MaYeuCau.slice(0, 8)}
                          </span>
                          {getStatusBadge(request.TrangThai)}
                        </div>
                        <p className="text-sm text-zinc-300">
                          <span className="text-zinc-500">Lý do:</span> {request.LyDoHoan || 'Không có lý do'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                          <span>
                            Ngày tạo: {format(new Date(request.CreatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                          </span>
                          {request.NganHang && (
                            <span className="flex items-center gap-1">
                              {request.NganHang.Logo && (
                                <img src={request.NganHang.Logo} alt="" className="w-4 h-4" />
                              )}
                              {request.NganHang.Code}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-500">Số tiền hoàn</p>
                        <p className="text-lg font-bold text-primary">
                          {(request.SoTien || 0).toLocaleString('vi-VN')} ₫
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Load more button */}
              {hasNextPage && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="border-zinc-700"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang tải...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Xem thêm
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
              <RefreshCw className="w-12 h-12 mb-4 opacity-50" />
              <p>Bạn chưa có yêu cầu hoàn vé nào.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function mapTicketResponseToCardProps(apiTicket: TicketResponse) {
  const showDateObj = apiTicket.ThoiGianChieu ? new Date(apiTicket.ThoiGianChieu) : null;
  const now = new Date();
  
  let status = 'upcoming';
  
  const hasPendingRefund = apiTicket.Ves.some(v => v.TrangThai === 'CHOHOANTIEN');
  const hasRefunded = apiTicket.Ves.some(v => v.TrangThai === 'DAHOAN');
  
  if (apiTicket.GiaoDich?.TrangThai === 'THATBAI' || hasRefunded) {
    status = 'cancelled';
  } else if (hasPendingRefund) {
    status = 'pending_refund';
  } else if (!showDateObj || (showDateObj && showDateObj < now)) {
    status = 'completed';
  }

  return {
    id: apiTicket.MaHoaDon,
    movieTitle: apiTicket.Phim?.TenPhim || 'Không xác định',
    posterUrl: apiTicket.Phim?.PosterUrl || '',
    backdropUrl: apiTicket.Phim?.PosterUrl || '', // Fallback
    cinemaName: 'Movix UIT', // Hardcoded
    roomName: apiTicket.PhongChieu || 'N/A',
    showDate: showDateObj ? showDateObj.toLocaleDateString('vi-VN') : 'N/A',
    showTime: showDateObj ? showDateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
    seats: apiTicket.Ves.map(v => v.SoGhe),
    combos: apiTicket.Combos.map(c => ({ name: c.TenCombo, quantity: c.SoLuong })),
    price: apiTicket.TongTien,
    status: status,
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${apiTicket.MaHoaDon}`
  };
}