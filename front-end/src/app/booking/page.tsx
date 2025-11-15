'use client';

import React, { useState } from 'react';
import ComboCard from '@/components/combo/ComboCard'; // <-- File này đã được sửa
import { mockCombos } from '@/lib/mockData'; // Import mock data

export default function BookingPage() {
  const [comboQuantities, setComboQuantities] = useState<{ [key: string]: number }>({});

  const handleQuantityChange = (comboId: string, quantity: number) => {
    setComboQuantities(prevQuantities => ({
      ...prevQuantities,
      [comboId]: quantity,
    }));
  };

  const totalComboPrice = Object.entries(comboQuantities).reduce((total, [comboId, quantity]) => {
    const combo = mockCombos.find(c => c.id === comboId);
    return total + (combo ? combo.price * quantity : 0);
  }, 0);

  return (
    <div className="dark bg-background min-h-screen text-foreground p-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Chọn Combo</h1>
      
      {/* Grid này giờ sẽ hoạt động đúng */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCombos.map(combo => (
          <ComboCard
            key={combo.id}
            combo={combo}
            initialQuantity={comboQuantities[combo.id] || 0}
            onQuantityChange={handleQuantityChange}
          />
        ))}
      </div>

      <div className="mt-10 p-6 bg-card rounded-lg border border-border">
        <h2 className="text-2xl font-bold text-white mb-4">Tổng tiền Combo:</h2>
        <p className="text-primary text-3xl font-bold">
          {totalComboPrice.toLocaleString('vi-VN')} VND
        </p>
      </div>
    </div>
  );
}