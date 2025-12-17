"use client";
import MasterDataPage, { ColumnConfig } from "@/components/admin/master-data/MasterDataPage";
import { labelService } from "@/services/label.service";

export default function LabelPage() {
  const columns: ColumnConfig[] = [
    { 
      accessorKey: "TenNhanPhim", 
      header: "Tên Nhãn", 
      type: "text", 
      required: true 
    },
    { 
      accessorKey: "MoTa", 
      header: "Mô Tả", 
      type: "textarea", 
      required: false 
    },
  ];

  return (
    <MasterDataPage
      title="Quản Lý Nhãn Phim"
      entityName="Nhãn phim"
      idField="MaNhanPhim"
      columns={columns}
      fetchData={labelService.getAll}
      createItem={labelService.create}
      updateItem={labelService.update}
      deleteItem={labelService.delete}
    />
  );
}