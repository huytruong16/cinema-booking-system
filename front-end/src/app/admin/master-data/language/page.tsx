"use client";
import React, { useState } from "react";
import MasterDataPage, { FieldDefinition } from "@/components/admin/master-data/MasterDataPage";

const fields: FieldDefinition[] = [
  { key: "TenNgonNgu", label: "Tên ngôn ngữ", required: true },
];

const mockData = [
  { id: 1, TenNgonNgu: "Tiếng Việt" },
  { id: 2, TenNgonNgu: "Tiếng Anh" },
  { id: 3, TenNgonNgu: "Tiếng Hàn" },
];

export default function LanguagePage() {
  const [data, setData] = useState(mockData);
  
  const handleSave = (item: any) => {
     if (item.id) setData(prev => prev.map(i => i.id === item.id ? item : i));
     else setData(prev => [...prev, { ...item, id: Date.now() }]);
  };
  const handleDelete = (id: any) => setData(prev => prev.filter(i => i.id !== id));

  return <MasterDataPage title="Quản lý Ngôn ngữ" data={data} fields={fields} onSave={handleSave} onDelete={handleDelete} />;
}