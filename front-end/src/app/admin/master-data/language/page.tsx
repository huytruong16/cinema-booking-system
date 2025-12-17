"use client";
import MasterDataPage, { ColumnConfig } from "@/components/admin/master-data/MasterDataPage";
import { languageService } from "@/services/language.service";

export default function LanguagePage() {
  const columns: ColumnConfig[] = [
    { 
      accessorKey: "TenNgonNgu", 
      header: "Tên Ngôn Ngữ", 
      type: "text", 
      required: true 
    },
  ];

  return (
    <MasterDataPage
      title="Quản Lý Ngôn Ngữ"
      entityName="Ngôn ngữ"
      idField="MaNgonNgu"
      columns={columns}
      fetchData={languageService.getAll}
      createItem={languageService.create}
      updateItem={languageService.update}
      deleteItem={languageService.delete}
    />
  );
}