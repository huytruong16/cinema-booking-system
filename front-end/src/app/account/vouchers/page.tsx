'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TicketX, Loader2, Copy, Percent, DollarSign, Calendar } from 'lucide-react';
import { promotionService } from '@/services/promotion.service';
import { UserPromotion } from '@/types/promotion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function MyVouchersPage() {
  const [vouchers, setVouchers] = useState<UserPromotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const data = await promotionService.getMyPromotions();
        setVouchers(data);
      } catch (error) {
        console.error('Failed to fetch vouchers:', error);
        toast.error('Không thể tải danh sách voucher');
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, []);

  const activeVouchers = vouchers.filter(v => v.status === 'ACTIVE' && !v.isUsed);
  const usedVouchers = vouchers.filter(v => v.isUsed);
  const inactiveVouchers = vouchers.filter(v => v.status === 'INACTIVE' && !v.isUsed);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-2">Ví voucher của tôi</h1>
      <p className="text-zinc-400 mb-8">Danh sách các mã khuyến mãi bạn đã lưu và sử dụng.</p>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1 mb-6">
          <TabsTrigger 
            value="active" 
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
          >
            Khả dụng ({activeVouchers.length})
          </TabsTrigger>
          <TabsTrigger 
            value="used" 
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
          >
            Đã dùng ({usedVouchers.length})
          </TabsTrigger>
          <TabsTrigger 
             value="expired" 
             className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
          >
             Hết hạn / Vô hiệu ({inactiveVouchers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
           {activeVouchers.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeVouchers.map(v => <UserVoucherCard key={v.userPromotionId} voucher={v} />)}
             </div>
           ) : (
             <EmptyState message="Bạn chưa có voucher nào khả dụng." />
           )}
        </TabsContent>
        
        <TabsContent value="used" className="space-y-4">
            {usedVouchers.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {usedVouchers.map(v => <UserVoucherCard key={v.userPromotionId} voucher={v} isHistory />)}
             </div>
           ) : (
             <EmptyState message="Bạn chưa sử dụng voucher nào." />
           )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
            {inactiveVouchers.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inactiveVouchers.map(v => <UserVoucherCard key={v.userPromotionId} voucher={v} isHistory />)}
             </div>
           ) : (
             <EmptyState message="Không có voucher hết hạn." />
           )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserVoucherCard({ voucher, isHistory }: { voucher: UserPromotion, isHistory?: boolean }) {
  const isPercent = voucher.discountType === 'PERCENTAGE';
  
  const handleCopy = () => {
    navigator.clipboard.writeText(voucher.code);
    toast.success("Đã sao chép mã: " + voucher.code);
  };

  return (
    <Card className={cn(
      "overflow-hidden border-zinc-800 bg-[#1C1C1C] transition-colors",
      isHistory && "opacity-70 grayscale"
    )}>
      <div className="p-4 flex gap-4">
         <div className={cn(
            "w-16 h-16 shrink-0 rounded-lg flex items-center justify-center",
            isPercent ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500",
            isHistory && "bg-zinc-800 text-zinc-500"
          )}>
            {isPercent ? <Percent className="w-8 h-8" /> : <DollarSign className="w-8 h-8" />}
          </div>
          
          <div className="flex-1 min-w-0">
             <div className="flex justify-between items-start mb-1">
               <h3 className="font-bold text-white truncate pr-2">{voucher.code}</h3>
               {!isHistory && (
                 <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-500 hover:text-white" onClick={handleCopy}>
                    <Copy className="h-3 w-3" />
                 </Button>
               )}
             </div>
             <p className="text-sm text-zinc-400 line-clamp-2 mb-2">{voucher.description}</p>
             <div className="flex items-center gap-2 text-xs text-zinc-500">
               <Calendar className="w-3 h-3" />
               <span>HSD: {format(new Date(voucher.endDate), 'dd/MM/yyyy', { locale: vi })}</span>
             </div>
          </div>
      </div>
      <div className="bg-zinc-900/50 px-4 py-2 flex justify-between items-center text-xs text-zinc-500 border-t border-zinc-800/50">
        <span>Đơn tối thiểu: {voucher.minOrderValue.toLocaleString('vi-VN')}đ</span>
        <Badge variant={voucher.targetType === 'VE' ? "default" : "secondary"} className="h-5 text-[10px]">
           {voucher.targetType === 'VE' ? 'Vé Phim' : 'Combo'}
        </Badge>
      </div>
    </Card>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
      <TicketX className="w-12 h-12 mb-4 opacity-50" />
      <p>{message}</p>
    </div>
  )
}
