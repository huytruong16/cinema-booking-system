'use client';

import { useEffect, useState } from "react";
import { promotionService } from "@/lib/api/promotionService";
import { Promotion } from "@/types/promotion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Calendar, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner"; 

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true);
      const data = await promotionService.getAllPromotions();
      setPromotions(data);
      setLoading(false);
    };

    fetchPromotions();
  }, []);

  const handleCopyCode = (code: string) => {
    promotionService.copyCode(code);
    toast.success(`Đã sao chép mã: ${code}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 dark">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold text-foreground">Kho Ưu Đãi</h1>
          <p className="text-muted-foreground">Săn ngay các mã giảm giá hấp dẫn dành cho bạn.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1, 2, 3].map((i) => (
               <Skeleton key={i} className="h-[250px] w-full rounded-xl" />
             ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.length > 0 ? (
              promotions.map((promo) => (
                <Card key={promo.id} className="flex flex-col h-full border-dashed border-2 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant={promo.status === 'ACTIVE' ? "default" : "secondary"}>
                        {promo.status === 'ACTIVE' ? "Đang diễn ra" : "Hết hạn"}
                      </Badge>
                      <span className="text-2xl font-bold text-primary">
                        {promo.discountType === 'PERCENTAGE' ? `${promo.value}%` : formatCurrency(promo.value)}
                      </span>
                    </div>
                    <CardTitle className="mt-2 text-xl">{promo.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{promo.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-grow space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                       <Tag className="w-4 h-4" /> 
                       <span>Đơn tối thiểu: {formatCurrency(promo.minOrderValue)}</span>
                    </div>
                    {promo.maxDiscount > 0 && (
                      <div className="flex items-center gap-2">
                         <Tag className="w-4 h-4" /> 
                         <span>Giảm tối đa: {formatCurrency(promo.maxDiscount)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                       <Calendar className="w-4 h-4" /> 
                       <span>HSD: {formatDate(promo.endDate)}</span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4 bg-muted/30 mt-auto">
                    <div className="flex w-full items-center justify-between gap-4 bg-background border p-2 rounded-lg">
                      <code className="font-mono font-bold text-lg text-primary px-2">{promo.code}</code>
                      <Button size="sm" variant="ghost" onClick={() => handleCopyCode(promo.code)}>
                        <Copy className="w-4 h-4 mr-2" /> Lưu
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                Hiện chưa có chương trình khuyến mãi nào.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}