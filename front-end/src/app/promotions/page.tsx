'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { promotionService } from '@/services/promotion.service';
import type { Promotion } from '@/types/promotion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, Copy, CheckCheck, Percent, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const data = await promotionService.getAllPromotions();
        setPromotions(data);
      } catch (e: any) {
        setError('Không thể tải danh sách ưu đãi.');
        toast.error('Không thể tải danh sách ưu đãi.');
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Đã sao chép mã giảm giá: " + code);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pb-20">
      
      <div className="bg-gradient-to-r from-red-900/50 to-black border-b border-zinc-800 py-12 px-6 text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Ticket className="w-10 h-10 text-red-500" />
          Kho Ưu Đãi & Khuyến Mãi
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Săn ngay các mã giảm giá hấp dẫn dành riêng cho bạn. Nhập mã tại bước thanh toán để được giảm giá vé và combo.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-zinc-400">Đang tải ưu đãi...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo) => (
              <PromotionCard key={promo.id} promo={promo} onCopy={handleCopyCode} />
            ))}
            <div className="border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center p-8 text-center text-zinc-500 min-h-[200px]">
              <p>Sắp có thêm ưu đãi mới...</p>
              <p className="text-sm mt-2">Hãy quay lại sau nhé!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PromotionCard({ promo, onCopy }: { promo: Promotion, onCopy: (code: string) => void }) {
  const isPercent = promo.discountType === 'PERCENTAGE';

  return (
    <Card className="bg-[#1C1C1C] border-zinc-800 overflow-hidden flex flex-col h-full hover:border-red-500/50 transition-all group">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center mb-3",
            isPercent ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"
          )}>
            {isPercent ? <Percent className="w-6 h-6" /> : <DollarSign className="w-6 h-6" />}
          </div>
          <Badge variant="outline" className="bg-zinc-900 border-zinc-700 text-zinc-400">
            Đang diễn ra
          </Badge>
        </div>
        <CardTitle className="text-xl font-bold text-white">{promo.code}</CardTitle>
        <CardDescription className="text-zinc-400 line-clamp-2 min-h-[40px]">
          {promo.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-3">
        <div className="bg-zinc-900/50 p-3 rounded-lg space-y-1 text-sm border border-zinc-800/50">
          <div className="flex justify-between">
            <span className="text-zinc-500">Giảm giá:</span>
            <span className="text-white font-medium">
              {isPercent ? `${promo.value}%` : `${promo.value.toLocaleString('vi-VN')}đ`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Đơn tối thiểu:</span>
            <span className="text-white font-medium">
              {promo.minOrderValue > 0 ? `${promo.minOrderValue.toLocaleString('vi-VN')}đ` : '0đ'}
            </span>
          </div>
          {isPercent && promo.maxDiscount && (
             <div className="flex justify-between">
                <span className="text-zinc-500">Giảm tối đa:</span>
                <span className="text-white font-medium">{promo.maxDiscount.toLocaleString('vi-VN')}đ</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-6">
        <Button 
          className="w-full bg-zinc-800 hover:bg-red-600 hover:text-white text-zinc-300 transition-colors group-hover:border-red-500" 
          variant="outline"
          onClick={() => onCopy(promo.code)}
        >
          <Copy className="w-4 h-4 mr-2" /> Sao chép mã
        </Button>
      </CardFooter>
    </Card>
  );
}