export interface SeatType {
  MaLoaiGhe: string;    
  LoaiGhe: string;    
  HeSoGiaGhe: number;  
}

export interface CreateSeatTypeDto {
  LoaiGhe: string;
  HeSoGiaGhe: number;
}

export interface Seat {
  MaGhe: string;
  Hang: string;
  Cot: string;
  
  MaLoaiGhe?: string; 
  TenLoaiGhe?: string; 
}

export interface UpdateSeatDto {
  MaLoaiGhe: string; 
}