"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ticketService } from '@/services/ticket.service';
import { CheckCircle2, XCircle, Loader2, QrCode, Camera } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';

interface CheckInLog {
  code: string;
  timestamp: Date;
  status: 'success' | 'error';
  message: string;
}

export default function CheckInPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<CheckInLog[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const processCheckIn = async (checkInCode: string) => {
    if (!checkInCode.trim()) {
      toast.error("Vui lòng nhập mã vé");
      return;
    }

    setLoading(true);
    try {
      const res = await ticketService.checkIn(checkInCode);
      toast.success(res.message || "Checkin thành công");
      
      setLogs(prev => [{
        code: checkInCode,
        timestamp: new Date(),
        status: 'success',
        message: res.message || "Checkin thành công"
      }, ...prev]);
      
      setCode("");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Checkin thất bại";
      toast.error(errorMessage);
      
      setLogs(prev => [{
        code: checkInCode,
        timestamp: new Date(),
        status: 'error',
        message: errorMessage
      }, ...prev]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleCheckIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await processCheckIn(code);
  };

  const handleScan = (result: any[]) => {
      if (result && result[0]) {
          const scannedCode = result[0].rawValue;
          setCode(scannedCode);
          setIsScanning(false);
          processCheckIn(scannedCode);
      }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <QrCode className="w-8 h-8 text-primary " />
        <h1 className="text-2xl font-bold">Soát Vé</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Input Section */}
        <Card className="flex flex-col justify-center">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Nhập mã vé</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheckIn} className="flex flex-col gap-6 max-w-md mx-auto w-full">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder="Nhập hoặc quét mã vé..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={loading}
                  className="text-xl h-14 px-4"
                  autoComplete="off"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 shrink-0"
                  onClick={() => setIsScanning(true)}
                  title="Mở Camera"
                >
                  <Camera className="h-6 w-6" />
                </Button>
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="w-full text-xl h-14"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Check In"
                )}
              </Button>
              <p className="text-base text-muted-foreground text-center">
                Nhấn Enter để check-in nhanh
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Recent Logs Section */}
        <Card className="flex flex-col h-full overflow-hidden">
          <CardHeader>
            <CardTitle>Lịch sử check-in phiên này</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2">
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Chưa có lượt check-in nào
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log, index) => (
                  <div 
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      log.status === 'success' 
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900' 
                        : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900'
                    }`}
                  >
                    {log.status === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        Mã: {log.code}
                      </div>
                      <div className={`text-sm ${
                        log.status === 'success' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {log.message}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {log.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isScanning} onOpenChange={setIsScanning}>
        <DialogContent className="sm:max-w-md">
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
