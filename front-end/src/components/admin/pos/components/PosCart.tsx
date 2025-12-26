import React from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Armchair, Minus, Plus, TicketCheck, Ticket, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Movie } from '@/types/movie';
import { Showtime } from '@/types/showtime';
import { SelectedSeat } from '@/components/booking/BookingSeatMap';
import { Combo } from '@/services/combo.service';

interface PosCartProps {
  selectedMovie: Movie | null;
  selectedShowtime: Showtime | null;
  selectedDate: Date;
  selectedSeats: SelectedSeat[];
  onSeatRemove: (seat: SelectedSeat) => void;
  combos: Combo[];
  comboQuantities: { [key: string]: number };
  onComboChange: (comboId: string, delta: number) => void;
  customerEmail: string;
  setCustomerEmail: (email: string) => void;
  paymentMethod: "TAIQUAY" | "TRUCTUYEN";
  setPaymentMethod: (method: "TAIQUAY" | "TRUCTUYEN") => void;
  totalAmount: number;
  onCheckout: () => void;
  processingPayment: boolean;
  hasPermission: (permission: string) => boolean;
}

export function PosCart({
  selectedMovie,
  selectedShowtime,
  selectedDate,
  selectedSeats,
  onSeatRemove,
  combos,
  comboQuantities,
  onComboChange,
  customerEmail,
  setCustomerEmail,
  paymentMethod,
  setPaymentMethod,
  totalAmount,
  onCheckout,
  processingPayment,
  hasPermission
}: PosCartProps) {
  return (
    <Card className="flex-1 flex flex-col h-full">
      <CardHeader className="pb-2 border-b">
        <CardTitle>Thông tin đặt vé</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto py-4 space-y-6">
        {/* Movie Info */}
        {selectedMovie && (
          <div className="flex gap-3">
            <div className="relative w-16 aspect-[2/3] rounded overflow-hidden shrink-0">
              <Image src={selectedMovie.posterUrl} alt={selectedMovie.title} fill className="object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-sm">{selectedMovie.title}</h3>
              <p className="text-xs text-muted-foreground">{selectedMovie.subTitle}</p>
              {selectedShowtime && (
                <div className="mt-1 text-xs">
                  <Badge variant="secondary" className="mr-1">{selectedShowtime.PhienBanPhim.DinhDang.TenDinhDang}</Badge>
                  <span className="font-medium text-primary">
                    {format(new Date(selectedShowtime.ThoiGianBatDau), 'HH:mm')} - {format(selectedDate, 'dd/MM/yyyy')}
                  </span>
                  <div className="mt-1 text-muted-foreground">
                    {selectedShowtime.PhongChieu?.TenPhongChieu}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Selected Seats */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Armchair className="w-4 h-4" /> Ghế đã chọn ({selectedSeats.length})
          </h4>
          {selectedSeats.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map(seat => (
                <Badge key={seat.id} variant="outline" className="flex gap-1 items-center">
                  {seat.id}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-500" 
                    onClick={() => onSeatRemove(seat)}
                  />
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">Chưa chọn ghế nào</p>
          )}
        </div>

        <Separator />

        {/* Combos */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Ticket className="w-4 h-4" /> Bắp nước & Combo
          </h4>
          <div className="space-y-3">
            {combos.map(combo => (
              <div key={combo.MaCombo} className="flex items-center justify-between text-sm">
                <div className="flex-1">
                  <div className="font-medium">{combo.TenCombo}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(combo.GiaTien)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" size="icon" className="h-6 w-6"
                    onClick={() => onComboChange(combo.MaCombo, -1)}
                    disabled={!comboQuantities[combo.MaCombo]}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-4 text-center text-xs">{comboQuantities[combo.MaCombo] || 0}</span>
                  <Button 
                    variant="outline" size="icon" className="h-6 w-6"
                    onClick={() => onComboChange(combo.MaCombo, 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Customer Info */}
        <div>
          <h4 className="text-sm font-medium mb-2">Thông tin khách hàng</h4>
          <div className="space-y-2">
            <div className="grid gap-1">
              <Label htmlFor="email" className="text-xs">Email (để nhận vé)</Label>
              <Input 
                id="email" 
                value={customerEmail} 
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs">Phương thức thanh toán</Label>
              <Select 
                value={paymentMethod} 
                onValueChange={(v: any) => setPaymentMethod(v)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TAIQUAY">Tiền mặt (Tại quầy)</SelectItem>
                  <SelectItem value="TRUCTUYEN">Chuyển khoản / Thẻ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-4 border-t pt-4 bg-muted/20">
        <div className="w-full flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Tổng tiền:</span>
          <span className="text-2xl font-bold text-primary">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
          </span>
        </div>
        {hasPermission("BANVE") && (
          <Button 
            className="w-full" 
            size="lg" 
            onClick={onCheckout}
            disabled={processingPayment || !selectedShowtime || selectedSeats.length === 0}
          >
            {processingPayment ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...
              </>
            ) : (
              <>
                <TicketCheck className="mr-2 h-4 w-4" /> Xuất vé & Thanh toán
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
