'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Calendar, Clock, Ticket, Armchair, Ban, AlertCircle, CheckCircle2, Utensils, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TicketDetail } from './TicketDetail'; // <--- IMPORT MỚI
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TicketProps {
  ticket: {
    id: string;
    movieTitle: string;
    posterUrl: string;
    backdropUrl: string;
    cinemaName: string;
    roomName: string;
    showDate: string;
    showTime: string;
    seats: string[];
    combos?: { name: string; quantity: number }[]; 
    price: number;
    status: string;
    qrCode?: string | null;
  };
}

export function TicketCard({ ticket }: TicketProps) {
  const [currentStatus, setCurrentStatus] = useState(ticket.status);
  const [isCancelling, setIsCancelling] = useState(false);
  const [resultDialog, setResultDialog] = useState<{
    open: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({ open: false, type: 'success', title: '', message: '' });

  const isUpcoming = currentStatus === 'upcoming';
  const isCancelled = currentStatus === 'cancelled';

  const statusColor = isUpcoming 
    ? 'bg-green-500 hover:bg-green-600' 
    : isCancelled 
      ? 'bg-red-500 hover:bg-red-600' 
      : 'bg-zinc-500 hover:bg-zinc-600';

  const statusText = isUpcoming 
    ? 'Sắp chiếu' 
    : isCancelled 
      ? 'Đã hủy' 
      : 'Đã xem';

  const handleCancelTicket = () => {
    setIsCancelling(true);

    const showDateTimeString = `${ticket.showDate}T${ticket.showTime}:00`;
    const showDateTime = new Date(showDateTimeString);
    const now = new Date();

    const diffInMs = showDateTime.getTime() - now.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    setTimeout(() => {
      setIsCancelling(false);
      if (diffInHours < 24) {
        setResultDialog({
          open: true,
          type: 'error',
          title: 'Yêu cầu thất bại',
          message: 'Đã quá thời gian cho phép hoàn vé (phải trước giờ chiếu 24h).',
        });
        return;
      }

      setCurrentStatus('cancelled');
      setResultDialog({
        open: true,
        type: 'success',
        title: 'Hủy vé thành công',
        message: `Vé #${ticket.id.split('-')[1]} đã được hủy. Số tiền ${ticket.price.toLocaleString('vi-VN')}đ sẽ được hoàn về ví của bạn trong 24h.`,
      });

    }, 1500); 
  };

  return (
    <>
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden group hover:border-zinc-700 transition-colors">
        <div className="flex flex-col md:flex-row">
          
          {/* Poster */}
          <div className="relative w-full md:w-48 h-64 md:h-auto shrink-0">
            <Image 
              src={ticket.posterUrl} 
              alt={ticket.movieTitle} 
              fill 
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 md:bg-gradient-to-r md:from-transparent md:to-zinc-900/50" />
            
            <div className="absolute top-2 left-2">
              <Badge className={`${statusColor} text-white border-none`}>{statusText}</Badge>
            </div>
          </div>

          {/* Thông tin */}
          <CardContent className="flex-1 p-4 md:p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white line-clamp-1" title={ticket.movieTitle}>
                      {ticket.movieTitle}
                  </h3>
                  <span className="text-sm font-mono text-zinc-500">#{ticket.id.split('-')[1]}</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 mt-4 text-sm text-zinc-300">
                  <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{ticket.showDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{ticket.showTime}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                      <Armchair className="w-4 h-4 text-primary" />
                      <span className="font-medium text-white">Ghế: {ticket.seats.join(', ')} ({ticket.roomName})</span>
                  </div>

                  {ticket.combos && ticket.combos.length > 0 && (
                    <div className="flex items-start gap-2 sm:col-span-2">
                        <Utensils className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <div className="flex flex-col">
                            {ticket.combos.map((combo, index) => (
                                <span key={index} className="text-zinc-300">
                                    {combo.quantity}x {combo.name}
                                </span>
                            ))}
                        </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                  <p className="text-xs text-zinc-500">Tổng thanh toán</p>
                  <p className="text-lg font-bold text-primary">{ticket.price.toLocaleString('vi-VN')} ₫</p>
              </div>

              <div className="flex gap-2">
                  {isUpcoming && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                          <Ban className="w-4 h-4 mr-2" /> 
                          Hủy vé
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Yêu cầu hoàn vé?</AlertDialogTitle>
                          <AlertDialogDescription className="text-zinc-400">
                            Bạn có chắc chắn muốn hủy vé này không? <br/>
                            Hành động này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-transparent border-zinc-700 hover:bg-zinc-800 text-white">Đóng</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleCancelTicket}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={isCancelling}
                          >
                            {isCancelling ? "Đang xử lý..." : "Xác nhận hủy"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  <Dialog>
                      <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                              {isCancelled ? <Eye className="w-4 h-4 mr-2" /> : <Ticket className="w-4 h-4 mr-2" />}
                              {isCancelled ? "Xem lại" : "Chi tiết vé"}
                          </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-transparent border-none shadow-none p-0 max-w-md w-full">
                          <TicketDetail ticket={{...ticket, status: currentStatus}} />
                      </DialogContent>
                  </Dialog>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      <AlertDialog open={resultDialog.open} onOpenChange={(open) => setResultDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              {resultDialog.type === 'success' ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <AlertCircle className="w-6 h-6 text-red-500" />}
              <AlertDialogTitle className={resultDialog.type === 'success' ? 'text-green-500' : 'text-red-500'}>{resultDialog.title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-zinc-300 text-base">{resultDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setResultDialog(prev => ({ ...prev, open: false }))} className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700">Đóng</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}