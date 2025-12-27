'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Ticket, Printer, Search, ArrowLeft, CheckCircle2, QrCode, Camera } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { useAuth } from "@/contexts/AuthContext";
import { invoiceService } from "@/services/invoice.service";
import { TicketResponse } from "@/types/ticket";
import { format } from 'date-fns';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function KioskPrintPage() {
  const [step, setStep] = useState<'input' | 'preview' | 'printing' | 'success'>('input');
  const [bookingCode, setBookingCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [ticketData, setTicketData] = useState<Blob | null>(null);
  const [comboData, setComboData] = useState<Blob | null>(null);
  
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user || (user.role !== 'NHANVIEN' && user.role !== 'ADMIN')) {
        toast.error("Vui lòng đăng nhập với quyền nhân viên để sử dụng Kiosk");
        router.push('/login?redirect=/kiosk/print');
      }
    }
  }, [user, isAuthLoading, router]);

  const processSearch = async (code: string) => {
    if (!code.trim()) return;
    
    setIsLoading(true);
    setTicketData(null);
    setComboData(null);
    
    try {
      let invoice = null;
      try {
        const invoicesRes: any = await invoiceService.getAll({ search: code });
        const invoices = invoicesRes.data || [];
        invoice = invoices.find((inv: any) => inv.Code === code || inv.GiaoDich?.Code === code);
      } catch (err) {
        console.error("Error fetching invoice details", err);
      }

      const data = await invoiceService.getInvoiceByCode(code);
      setTicketData(data as unknown as Blob);

      if (invoice && invoice.Combos && invoice.Combos.length > 0) {
        try {
          const comboBlob = await invoiceService.getComboPdf(invoice.MaHoaDon);
          setComboData(comboBlob as unknown as Blob);
        } catch (comboError) {
          console.error("Failed to fetch combo PDF", comboError);
        }
      }

      setStep('preview');
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.response?.data?.message || "Không tìm thấy mã đặt vé này hoặc có lỗi xảy ra";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await processSearch(bookingCode);
  };

  const handleScan = (result: any[]) => {
      if (result && result[0]) {
          const scannedCode = result[0].rawValue;
          setBookingCode(scannedCode);
          setIsScanning(false);
          processSearch(scannedCode);
      }
  };

  const handlePrint = async () => {
    if (!ticketData) return;
    
    setStep('printing');
    try {
      const url = window.URL.createObjectURL(ticketData);
      
      // Open PDF in new window for printing
      const printWindow = window.open(url);
      if (printWindow) {
   
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = `Ticket-${bookingCode}.pdf`;
        link.click();
      }
      if (comboData) {
        setTimeout(() => {
          const comboUrl = window.URL.createObjectURL(comboData);
          const comboWindow = window.open(comboUrl);
          if (!comboWindow) {
            const link = document.createElement('a');
            link.href = comboUrl;
            link.download = `Combo-${bookingCode}.pdf`;
            link.click();
          }
        }, 1000);
      }
      
      setTimeout(() => {
        setStep('success');
      }, 2000);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.response?.data?.message || "Lỗi khi in vé. Vui lòng thử lại.";
      toast.error(errorMessage);
      setStep('preview');
    }
  };

  const handleReset = () => {
    setStep('input');
    setBookingCode('');
    setTicketData(null);
    setComboData(null);
  };

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">Đang tải...</div>;
  }

  if (!user || (user.role !== 'NHANVIEN' && user.role !== 'ADMIN')) {
    return null; 
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="z-10 w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Kiosk In Vé Tự Động</h1>
          <p className=" text-lg">Vui lòng nhập mã đặt vé hoặc quét mã QR để in vé</p>
        </div>

        {step === 'input' && (
          <Card className=" dark w-full max-w-md mx-auto bg-zinc-900/80 border-zinc-800 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className=" text-xl text-center">Nhập mã đặt vé</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-2">
                  <div className="relative group">
                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors h-5 w-5" />
                    <Input 
                      placeholder="Ví dụ: MVX-12345" 
                      className="pl-10 h-14 text-lg bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                      value={bookingCode}
                      onChange={(e) => setBookingCode(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-zinc-400 text-center">
                    Mã đặt vé đã được gửi đến email của bạn
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-zinc-900 px-2 text-zinc-400">Hoặc</span>
                  </div>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-14 border-dashed border-zinc-600 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-500 text-zinc-300 hover:text-white transition-all group"
                  onClick={() => setIsScanning(true)}
                >
                  <QrCode className="mr-2 h-5 w-5 text-zinc-400 group-hover:text-white transition-colors" />
                  <span className="transition-colors">Quét mã QR</span>
                </Button>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all" 
                  disabled={!bookingCode || isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang tìm kiếm...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Tìm vé
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'preview' && ticketData && (
          <div className="w-full max-w-md mx-auto animate-in fade-in zoom-in duration-300">
            <Card className="bg-zinc-900/80 border-zinc-800">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle className="text-2xl text-yellow-400">Vé đã sẵn sàng</CardTitle>
                <CardDescription>Mã đặt vé: {bookingCode}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-zinc-300 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800">
                  <Printer className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <span>Máy in đã sẵn sàng</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button onClick={handlePrint} className="w-full h-12 text-lg" size="lg">
                  <Printer className="mr-2 h-5 w-5" /> In Vé Ngay
                </Button>
                <Button onClick={() => setStep('input')} variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {step === 'printing' && (
          <Card className="w-full max-w-md mx-auto bg-zinc-900/80 border-zinc-800 text-center py-12">
            <CardContent className="flex flex-col items-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary blur-xl opacity-20 rounded-full animate-pulse"></div>
                <Printer className="h-20 w-20 text-primary relative z-10 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Đang in vé...</h2>
              <p className="text-zinc-400">Vui lòng đợi trong giây lát và nhận vé tại khe in</p>
              
              <div className="w-64 h-2 bg-zinc-800 rounded-full mt-8 overflow-hidden">
                <div className="h-full bg-primary animate-[progress_2s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card className="w-full max-w-md mx-auto bg-zinc-900/80 border-zinc-800 text-center py-12 animate-in zoom-in duration-300">
            <CardContent className="flex flex-col items-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">In vé thành công!</h2>
              <p className="text-zinc-400 mb-8">Chúc bạn xem phim vui vẻ</p>
              
              <Button onClick={handleReset} className="min-w-[200px]">
                In vé khác
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="absolute bottom-4 text-zinc-600 text-sm">
        &copy; 2025 Movix - Rạp chiếu phim hàng đầu UIT
      </div>

      <Dialog open={isScanning} onOpenChange={setIsScanning}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Quét mã QR</DialogTitle>
          </DialogHeader>
          <div className="aspect-square overflow-hidden rounded-lg bg-black">
            {isScanning && (
                <Scanner 
                    onScan={handleScan}
                    styles={{
                        container: { width: '100%', height: '100%' }
                    }}
                />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
