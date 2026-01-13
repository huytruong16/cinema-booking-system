import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2 } from 'lucide-react';

interface PosPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentUrl: string | null;
}

export function PosPaymentDialog({
  open,
  onOpenChange,
  paymentUrl,
}: PosPaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Thanh toán đơn hàng</DialogTitle>
          <DialogDescription>
            Vui lòng thực hiện thanh toán để hoàn tất giao dịch.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          {paymentUrl && (
            <>
              <div className="w-full aspect-square relative border rounded-md overflow-hidden">
                <iframe 
                  src={paymentUrl} 
                  className="w-full h-full" 
                  title="Payment Frame"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang chờ xác nhận thanh toán...</span>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
