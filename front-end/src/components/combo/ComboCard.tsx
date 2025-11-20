'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircleIcon , MinusCircleIcon } from 'lucide-react';

interface ComboCardProps {
    combo: {
        id: string;
        name: string;
        price: number;
        imageUrl: string;
    };
    initialQuantity?: number;
    onQuantityChange?: (comboId: string, quantity: number) => void;
}

const ComboCard: React.FC<ComboCardProps> = ({
    combo,
    initialQuantity = 0,
    onQuantityChange,
}) => {
    const [quantity, setQuantity] = useState(initialQuantity);

    const updateQuantity = (newQuantity: number) => {
        if (newQuantity < 0) newQuantity = 0;
        setQuantity(newQuantity);
        onQuantityChange?.(combo.id, newQuantity);
    };

    return (
        <div
            className="
        relative flex flex-col text-white max-w-md w-full
        border border-white/10 rounded-xl 
        transition-all duration-200
        hover:border-white/30 hover:shadow-lg hover:shadow-white/10 hover:scale-[1.02]
        p-4
      "
        >
            <div className="flex items-center gap-4">

                {/* Ảnh bên trái */}
                <div className="relative h-[120px] w-[160px] rounded-xl overflow-hidden bg-card">
                    <img
                        src={combo.imageUrl}
                        alt={combo.name}
                        className="h-full w-full object-cover transition-all duration-200 hover:scale-105"
                    />
                </div>

                <div className="flex flex-col gap-2 w-full">

                    {/* Tên + giá */}
                    <div>
                        <h3 className="text-base font-semibold tracking-wide uppercase" title={combo.name}>
                            {combo.name}
                        </h3>
                        <p className="text-sm font-medium text-primary">
                            {combo.price.toLocaleString('vi-VN')} VND
                        </p>
                    </div>

                    <div className="flex justify-start">
                        <div
                            className="
                flex items-center 
                bg-slate-600/40 
                border border-white/10
                rounded-lg 
                px-4 py-1.5
                shadow-inner
              "
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-lg text-white hover:bg-slate-500/60 rounded-md"
                                onClick={() => updateQuantity(quantity - 1)}
                                disabled={quantity === 0}
                            >
                                <MinusCircleIcon/>
                            </Button>

                            <Input
                                type="text"
                                inputMode="numeric"
                                value={quantity}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value, 10);
                                    updateQuantity(!isNaN(v) && v >= 0 ? v : 0);
                                }}
                                className="mx-3 h-7 w-10 text-center text-base text-white bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                            />

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-lg text-white hover:bg-slate-500/60 rounded-md"
                                onClick={() => updateQuantity(quantity + 1)}
                            >
                                <PlusCircleIcon/>
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ComboCard;
