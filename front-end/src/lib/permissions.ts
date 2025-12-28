import {
  ShieldCheck,
  Users,
  LayoutGrid,
  Settings2,
} from "lucide-react";

export type Quyen =
  | "BANVE"
  | "SOATVE"
  | "QLHOANVE"
  | "QLHOADON"
  | "QLPHIM"
  | "QLLICHCHIEU"
  | "QLPHONGCHIEU"
  | "QLDANHMUC"
  | "QLCOMBO"
  | "QLKHUYENMAI"
  | "QLNGUOIDUNG"
  | "BCTHONGKE"
  | "KIOSK";

export interface PermissionGroup {
  id: string;
  label: string;
  description: string;
  color: string;
  icon: React.ElementType;
  permissions: { code: Quyen; label: string; desc?: string }[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "sales",
    label: "Bán hàng & Soát vé",
    description:
      "Các chức năng phục vụ bán vé tại quầy và kiểm soát vé vào cổng.",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    icon: Users,
    permissions: [
      {
        code: "BANVE",
        label: "Bán vé tại quầy",
        desc: "Tạo đơn hàng vé trực tiếp",
      },
      {
        code: "SOATVE",
        label: "Soát vé (Check-in)",
        desc: "Quét mã QR vé vào rạp",
      },
      {
        code: "KIOSK",
        label: "Truy cập Kiosk",
        desc: "Chế độ máy bán vé tự động",
      },
    ],
  },
  {
    id: "transaction",
    label: "Giao dịch & Hóa đơn",
    description: "Quản lý dòng tiền, hóa đơn và xử lý hoàn tiền.",
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    icon: LayoutGrid,
    permissions: [
      {
        code: "QLHOANVE",
        label: "Thực hiện hoàn vé",
        desc: "Xử lý hoàn tiền trực tiếp",
      },
      {
        code: "QLHOADON",
        label: "Quản lý Hóa đơn",
        desc: "Xem và quản lý hóa đơn",
      },
    ],
  },
  {
    id: "movie",
    label: "Quản lý Phim & Lịch",
    description: "Thiết lập danh sách phim và xếp lịch chiếu.",
    color: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    icon: Settings2,
    permissions: [
      { code: "QLPHIM", label: "Quản lý Phim", desc: "Thêm/Sửa/Xóa phim" },
      {
        code: "QLLICHCHIEU",
        label: "Lịch chiếu tổng",
        desc: "Xem toàn bộ lịch chiếu",
      },
    ],
  },
  {
    id: "resource",
    label: "Tài nguyên Rạp",
    description: "Cấu hình phòng chiếu, ghế ngồi và sản phẩm đi kèm.",
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    icon: LayoutGrid,
    permissions: [
      { code: "QLPHONGCHIEU", label: "Phòng chiếu", desc: "Cấu hình phòng" },
      { code: "QLCOMBO", label: "Quản lý Combo", desc: "Quản lý đồ ăn uống" },
    ],
  },
  {
    id: "system",
    label: "Hệ thống & Báo cáo",
    description: "Quyền hạn cao cấp quản trị hệ thống.",
    color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    icon: ShieldCheck,
    permissions: [
      {
        code: "BCTHONGKE",
        label: "Báo cáo doanh thu",
        desc: "Xem biểu đồ doanh số",
      },
      {
        code: "QLNGUOIDUNG",
        label: "Quản lý Người dùng",
        desc: "Quản lý tài khoản người dùng",
      },
      {
        code: "QLDANHMUC",
        label: "Quản lý Danh mục",
        desc: "Quản lý danh mục hệ thống",
      },
      {
        code: "QLKHUYENMAI",
        label: "Quản lý Khuyến mãi",
        desc: "Quản lý chương trình khuyến mãi",
      },
    ],
  },
];
