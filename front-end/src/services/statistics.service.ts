import apiClient from '@/lib/apiClient';
import {
  RoomStatus,
  StatisticsSummary,
  RevenueChartData,
  TopMovie,
  TopStaff,
} from '@/types/statistics';

export interface GetSummaryParams {
  range: 'day' | 'week' | 'month' | 'year' | 'all';
  date?: string;
}

export interface GetRevenueChartParams {
  range: 'week' | 'month' | 'year';
  date?: string;
}

export interface GetTopMovieParams {
  range: 'day' | 'week' | 'month' | 'year' | 'all';
  limit?: number;
}

export interface GetTopStaffParams {
  range: 'day' | 'week' | 'month' | 'year' | 'all';
  limit?: number;
}

export const statisticsService = {

  getSummary: async (params: GetSummaryParams): Promise<StatisticsSummary> => {
    const res = await apiClient.get<StatisticsSummary>('/statistics/summary', { params });
    return res.data;
  },

  getRevenueChart: async (
    params: GetRevenueChartParams
  ): Promise<RevenueChartData[]> => {
    const res = await apiClient.get<RevenueChartData[]>('/statistics/revenue-chart', { params });
    return res.data;
  },

  getTopMovies: async (
    params: GetTopMovieParams
  ): Promise<TopMovie[]> => {
    const res = await apiClient.get<TopMovie[]>('/statistics/top-movies', { params });
    return res.data;
  },

  getTopStaff: async (
    params: GetTopStaffParams
  ): Promise<TopStaff[]> => {
    const res = await apiClient.get<TopStaff[]>('/statistics/top-staff', { params });
    return res.data;
  },

  getRoomStatus: async (): Promise<RoomStatus[]> => {
    const res = await apiClient.get<RoomStatus[]>('/statistics/room-status');
    return res.data;
  },
};
