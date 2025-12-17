"use client";
import MasterDataPage, { ColumnConfig } from "@/components/admin/master-data/MasterDataPage";
import { genreService } from "@/services/genre.service";

export default function GenrePage() {
  const columns: ColumnConfig[] = [
    { 
      accessorKey: "TenTheLoai", 
      header: "Tên Thể Loại", 
      type: "text", 
      required: true 
    },
  ];

  return (
    <MasterDataPage
      title="Quản Lý Thể Loại Phim"
      entityName="Thể loại"
      idField="MaTheLoai"
      columns={columns}
      fetchData={genreService.getAll}
      createItem={genreService.create}
      updateItem={genreService.update}
      deleteItem={genreService.delete}
    />
  );
}