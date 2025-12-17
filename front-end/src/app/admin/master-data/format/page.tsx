"use client";
import MasterDataPage, { ColumnConfig } from "@/components/admin/master-data/MasterDataPage";
import { formatService } from "@/services/format.service";

const formatVNCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

export default function FormatPage() {
  const columns: ColumnConfig[] = [
    { 
        accessorKey: "TenDinhDang", 
        header: "Tên Định Dạng", 
        type: "text", 
        required: true 
    },
    { 
        accessorKey: "GiaVe", 
        header: "Giá Vé (VNĐ)", 
        type: "number", 
        required: true,
        formatValue: (val) => formatVNCurrency(Number(val)) 
    },
  ];

  return (
    <MasterDataPage
      title="Quản Lý Định Dạng Phim"
      entityName="Định dạng"
      idField="MaDinhDang"
      columns={columns} 
      fetchData={formatService.getAll}
      createItem={formatService.create}
      updateItem={formatService.update}
      deleteItem={formatService.delete}
    />
  );
}