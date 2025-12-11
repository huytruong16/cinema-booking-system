"use client";
import React, { useState } from "react";
import MasterDataPage, { FieldDefinition } from "@/components/admin/master-data/MasterDataPage";

const fields: FieldDefinition[] = [
  { key: "TenDinhDang", label: "Tên định dạng", required: true },
  { key: "GiaVe", label: "Phụ thu (VNĐ)", type: "number", required: true },
];

const mockFormats = [
  { id: 1, TenDinhDang: "2D", GiaVe: 0 },
  { id: 2, TenDinhDang: "3D", GiaVe: 30000 },
  { id: 3, TenDinhDang: "IMAX", GiaVe: 50000 },
];

export default function FormatPage() {
  const [data, setData] = useState(mockFormats);
  
  const handleSave = (item: any) => {
     if (item.id) setData(prev => prev.map(i => i.id === item.id ? item : i));
     else setData(prev => [...prev, { ...item, id: Date.now() }]);
  };
  const handleDelete = (id: any) => setData(prev => prev.filter(i => i.id !== id));

  return <MasterDataPage title="Quản lý Định dạng" data={data} fields={fields} onSave={handleSave} onDelete={handleDelete} />;
}