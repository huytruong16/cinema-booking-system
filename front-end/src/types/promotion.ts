
export interface Promotion {
  id: string;
  title: string;
  description: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;            
  startDate: string;
  endDate: string;
  minOrderValue: number;    
  maxDiscount: number;      
  quantity: number;
  usedQuantity: number;
  status: "ACTIVE" | "INACTIVE"; 
  targetType: string;       
}

export interface UserPromotion extends Promotion {
  userPromotionId: string; 
  isUsed: boolean;         
}
