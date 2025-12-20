'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { refundService, Bank } from '@/services/refund.service';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface RefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  onSuccess: () => void;
}

export function RefundDialog({ open, onOpenChange, ticketId, onSuccess }: RefundDialogProps) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    reason: '',
    bankId: '',
    accountNumber: '',
    accountHolder: ''
  });

  useEffect(() => {
    if (open) {
      fetchBanks();
    }
  }, [open]);

  const fetchBanks = async () => {
    try {
      setLoadingBanks(true);
      const data = await refundService.getBanks();
      setBanks(data);
    } catch (error) {
      console.error('Failed to fetch banks:', error);
      toast.error('Không thể tải danh sách ngân hàng');
    } finally {
      setLoadingBanks(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason || !formData.bankId || !formData.accountNumber || !formData.accountHolder) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setSubmitting(true);
      await refundService.createRequest({
        MaHoaDon: ticketId,
        LyDo: formData.reason,
        MaNganHang: formData.bankId,
        SoTaiKhoan: formData.accountNumber,
        ChuTaiKhoan: formData.accountHolder
      });
      toast.success('Gửi yêu cầu hoàn vé thành công');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Refund request failed:', error);
      const errorMessage = error?.response?.data?.message || 'Gửi yêu cầu thất bại';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yêu cầu hoàn vé</DialogTitle>
          <DialogDescription>
            Vui lòng cung cấp thông tin tài khoản ngân hàng để chúng tôi hoàn tiền cho bạn.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do hoàn vé</Label>
            <Textarea
              id="reason"
              placeholder="Nhập lý do..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank">Ngân hàng</Label>
            <Select
              value={formData.bankId}
              onValueChange={(value) => setFormData({ ...formData, bankId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn ngân hàng" />
              </SelectTrigger>
              <SelectContent>
                {loadingBanks ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  banks.map((bank) => (
                    <SelectItem key={bank.MaNganHang} value={bank.MaNganHang}>
                      <div className="flex items-center gap-2">
                        {bank.Logo && <img src={bank.Logo} alt={bank.Code} className="h-4 w-4 object-contain" />}
                        <span>{bank.Code} - {bank.TenNganHang}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Số tài khoản</Label>
            <Input
              id="accountNumber"
              placeholder="Nhập số tài khoản"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountHolder">Tên chủ tài khoản</Label>
            <Input
              id="accountHolder"
              placeholder="Nhập tên chủ tài khoản (không dấu)"
              value={formData.accountHolder}
              onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value.toUpperCase() })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gửi yêu cầu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
