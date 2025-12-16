import api from "@/lib/apiClient";
import { Showtime, GetShowtimesParams, SeatType } from "@/types/showtime";

export const showtimeService = {
    getShowtimes: async (params?: GetShowtimesParams): Promise<Showtime[]> => {
        try {
            const response = await api.get<Showtime[]>('/showtimes', {
                params: params,
            });
            return response.data;
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
};