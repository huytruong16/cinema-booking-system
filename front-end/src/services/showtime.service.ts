import api from "@/lib/apiClient";
import { Showtime, GetShowtimesParams, SeatType } from "@/types/showtime";
export interface CreateShowtimeDto {
  MaPhienBanPhim: string; 
  MaPhongChieu: string;
  ThoiGianBatDau: string | Date;
  ThoiGianKetThuc: string;
  TrangThai?: string;
}

export const showtimeService = {
    getShowtimes: async (params?: GetShowtimesParams): Promise<Showtime[]> => {
        try {
            const response = await api.get<any>('/showtimes', {
                params: params,
            });
            const data = response.data;
            return Array.isArray(data) ? data : data.data || [];
        } catch (error) {
            console.error("Lỗi khi lấy danh sách suất chiếu:", error);
            throw error;
        }
    },

    getShowtimeById: async (id: string): Promise<Showtime | null> => {
        try {
            const response = await api.get<Showtime>(`/showtimes/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy suất chiếu ${id}:`, error);
            return null;
        }
    },

    getSeatTypes: async (): Promise<SeatType[]> => {
        try {
            const response = await api.get<SeatType[]>('/seat-types');
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách loại ghế:", error);
            return [];
        }
    },

    checkSeatAvailability: async (seatId: string): Promise<boolean> => {
        try {
            const response = await api.get<{ ConTrong: boolean }>(`/seats/${seatId}/check-available`);
            return response.data.ConTrong;
        } catch (error) {
            console.error(`Lỗi khi kiểm tra ghế ${seatId}:`, error);
            return false;
        }
    },

    getShowtimesByMovieId: async (movieId: string, params?: { TrangThai?: string, NgayChieu?: string }): Promise<import("@/types/showtime").ShowtimeByMovieResponse | null> => {
        try {
            const response = await api.get<import("@/types/showtime").ShowtimeByMovieResponse>(`/showtimes/movie/${movieId}`, {
                params
            });
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy lịch chiếu cho phim ${movieId}:`, error);
            return null;
        }
    },

    getAll: async (params?: any) => { 
        const apiParams: any = { ...params };
        if (apiParams.NgayChieu) {
            apiParams.TuNgay = `${apiParams.NgayChieu}T00:00:00.000Z`;
            apiParams.DenNgay = `${apiParams.NgayChieu}T23:59:59.999Z`;
            delete apiParams.NgayChieu;
        }

        return showtimeService.getShowtimes(apiParams);
    },

    // Tạo suất chiếu mới
    create: async (data: CreateShowtimeDto) => {
        try {
        const payload = {
            MaPhienBanPhim: data.MaPhienBanPhim,
            MaPhongChieu: data.MaPhongChieu,
            ThoiGianBatDau: new Date(data.ThoiGianBatDau).toISOString(),
            ThoiGianKetThuc: new Date(data.ThoiGianKetThuc).toISOString(), 
        };

        const response = await api.post('/showtimes', payload);
        return response.data;
        } catch (error) {
        console.error("Lỗi khi tạo suất chiếu:", error);
        throw error;
        }
    },

    // Cập nhật suất chiếu
    update: async (id: string, data: Partial<CreateShowtimeDto>) => {
        try {
        const payload: any = { ...data };
        if (data.ThoiGianBatDau) {
            payload.ThoiGianBatDau = new Date(data.ThoiGianBatDau).toISOString();
        }
        if (data.ThoiGianKetThuc) {
            payload.ThoiGianKetThuc = new Date(data.ThoiGianKetThuc).toISOString();
        }
        const response = await api.patch(`/showtimes/${id}`, payload);
        return response.data;
        } catch (error) {
        console.error(`Lỗi khi cập nhật suất chiếu ${id}:`, error);
        throw error;
        }
    },

    // Xóa suất chiếu
    delete: async (id: string) => {
        try {
            const response = await api.delete(`/showtimes/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi xóa suất chiếu ${id}:`, error);
            throw error;
        }
    }
};