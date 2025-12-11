"use client";
import React, { useState } from "react";
import MasterDataPage, { FieldDefinition } from "@/components/admin/master-data/MasterDataPage";

const fields: FieldDefinition[] = [
  { key: "TenTheLoai", label: "Tên thể loại", required: true },
];

const mockGenres = [
  { id: 1, TenTheLoai: "Hành động" },
  { id: 2, TenTheLoai: "Kinh dị" },
  { id: 3, TenTheLoai: "Hài hước" },
];

export default function GenrePage() {
  const [data, setData] = useState(mockGenres);

  const handleSave = (item: any) => {
    if (item.id) {
        setData(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
        setData(prev => [...prev, { ...item, id: Date.now() }]);
    }
  };

  const handleDelete = (id: any) => {
    setData(prev => prev.filter(i => i.id !== id));
  };

  return (
    <MasterDataPage 
        title="Quản lý Thể loại" 
        data={data} 
        fields={fields} 
        onSave={handleSave} 
        onDelete={handleDelete} 
    />
  );
}