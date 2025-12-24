export interface ReviewUser {
  MaNguoiDung: string;
  HoTen: string;
  AvatarUrl: string | null;
}

export interface Review {
  MaDanhGia: string;
  NoiDung: string;
  Diem: number;
  MaPhim: string;
  MaNguoiDung: string;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  NguoiDungPhanMem?: ReviewUser;
}

export interface PaginationInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
}

export type ReviewListResponse = [Review[], PaginationInfo];

export interface CreateReviewRequest {
  MaPhim: string;
  NoiDung: string;
  Diem: number;
}
