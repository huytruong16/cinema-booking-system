"use client";
import React, { useState } from "react";
import MasterDataPage, { FieldDefinition } from "@/components/admin/master-data/MasterDataPage";

const fields: FieldDefinition[] = [
  { key: "TenNhanPhim", label: "Mã nhãn (VD: C18)", required: true },
  { key: "MoTa", label: "Mô tả", required: true },
  { key: "DoTuoiToiThieu", label: "Tuổi tối thiểu", type: "number", required: true },
];

const mockData = [
  { id: 1, TenNhanPhim: "P", MoTa: "Phổ biến mọi lứa tuổi", DoTuoiToiThieu: 0 },
  { id: 2, TenNhanPhim: "C13", MoTa: "Cấm dưới 13 tuổi", DoTuoiToiThieu: 13 },
  { id: 3, TenNhanPhim: "C18", MoTa: "Cấm dưới 18 tuổi", DoTuoiToiThieu: 18 },
];

export default function LabelPage() {
  const [data, setData] = useState(mockData);
  
  const handleSave = (item: any) => {
     if (item.id) setData(prev => prev.map(i => i.id === item.id ? item : i));
     else setData(prev => [...prev, { ...item, id: Date.now() }]);
  };
  const handleDelete = (id: any) => setData(prev => prev.filter(i => i.id !== id));

  return <MasterDataPage title="Quản lý Nhãn phim" data={data} fields={fields} onSave={handleSave} onDelete={handleDelete} />;
}