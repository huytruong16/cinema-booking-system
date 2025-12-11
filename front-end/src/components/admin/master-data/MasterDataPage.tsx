"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Kiểu dữ liệu chung cho cấu hình form
export type FieldDefinition = {
  key: string;
  label: string;
  type?: "text" | "number";
  required?: boolean;
};

interface MasterDataPageProps {
  title: string;
  data: any[]; 
  fields: FieldDefinition[]; 
  onSave: (item: any) => void;
  onDelete: (id: string | number) => void;
}

export default function MasterDataPage({ title, data, fields, onSave, onDelete }: MasterDataPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  const [formData, setFormData] = useState<any>({});

  const filteredData = data.filter((item) =>
    fields.some((field) =>
      String(item[field.key])?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsModalOpen(false);
    toast.success("Lưu thành công!");
  };

  const handleDelete = (id: string | number) => {
    if (confirm("Bạn có chắc chắn muốn xóa?")) {
      onDelete(id);
      toast.success("Đã xóa!");
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
          <Plus className="size-4 mr-2" /> Thêm mới
        </Button>
      </div>

      <div className="relative w-full max-w-sm">
        <Input
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-transparent border-slate-700"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
      </div>

      <Card className="bg-[#1C1C1C] border-slate-800 shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                {fields.map((f) => (
                  <TableHead key={f.key} className="text-slate-100">{f.label}</TableHead>
                ))}
                <TableHead className="text-right text-slate-100">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item, idx) => (
                  <TableRow key={idx} className="border-slate-800 hover:bg-slate-800/50">
                    {fields.map((f) => (
                      <TableCell key={f.key}>{item[f.key]}</TableCell>
                    ))}
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Edit className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(item.id || item[fields[0].key])}>
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={fields.length + 1} className="text-center py-8 text-slate-500">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#1C1C1C] border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Cập nhật" : "Thêm mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type={field.type || "text"}
                  required={field.required}
                  value={formData[field.key] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  className="bg-transparent border-slate-700"
                />
              </div>
            ))}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-slate-700 bg-transparent hover:bg-slate-800">Hủy</Button>
              <Button type="submit">Lưu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}