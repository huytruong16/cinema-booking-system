/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/apiClient";
import { 
  DashboardSummary, 
  RevenueChartData, 
} from "@/types/dashboard";


export interface GetSummaryParams {
  range: 'day' | 'week' | 'month' | 'year';
  date?: string;
}

export interface GetRevenueChartParams {
  range: 'week' | 'month' | 'year';
  date?: string;
}

export interface GetTopMovieParams {
  range: 'day' | 'week' | 'month' | 'year' | 'all';
}

export interface GetTopStaffParams {
  range: 'day' | 'week' | 'month' | 'year';
  date?: string;
}

export const statisticsService = {
  // 1. Tổng quan
  getSummary: async (params: GetSummaryParams) => {
    const res = await apiClient.get<DashboardSummary>('/statistics/summary', { params });
    return res.data;
  },

  // 2. Biểu đồ doanh thu
  getRevenueChart: async (params: GetRevenueChartParams) => {
    const res = await apiClient.get<RevenueChartData[]>('/statistics/revenue-chart', { params });
    return res.data;
  },

  // 3. Top phim
  getTopMovies: async (params: GetTopMovieParams) => {
    const res = await apiClient.get<any[]>('/statistics/top-movies', { params });
    return res.data;
  },

  // 4. Top nhân viên
  getTopStaff: async (params: GetTopStaffParams) => {
    const res = await apiClient.get<any[]>('/statistics/top-staff', { params });
    return res.data;
  },

  // 5. Trạng thái phòng
  getRoomStatus: async () => {
    const res = await apiClient.get<any[]>('/statistics/room-status');
    return res.data;
  }
};