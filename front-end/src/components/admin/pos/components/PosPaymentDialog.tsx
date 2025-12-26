import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PosPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentUrl: string | null;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  checkIframeUrl: () => void;
}

export function PosPaymentDialog({
  open,
  onOpenChange,
  paymentUrl,
  iframeRef,
  checkIframeUrl
}: PosPaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thanh toán đơn hàng</DialogTitle>
          <DialogDescription>
            Vui lòng thực hiện thanh toán để hoàn tất giao dịch.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          {paymentUrl && (
            <div className="w-full aspect-square relative border rounded-md overflow-hidden">
              <iframe 
                ref={iframeRef}
                src={paymentUrl} 
                className="w-full h-full" 
                title="Payment Frame"
                onLoad={checkIframeUrl}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
