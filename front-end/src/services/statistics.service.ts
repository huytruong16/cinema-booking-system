import api from '@/lib/apiClient';
import {
  RoomStatus,
  StatisticsSummary,
  RevenueChartData,
  TopMovie,
  TopStaff,
} from '@/types/statistics';

export const statisticsService = {
  getRoomStatus: async (): Promise<RoomStatus[]> => {
    const response = await api.get<RoomStatus[]>('/statistics/room-status');
    return response.data;
  },

  getSummary: async (range: 'day' | 'week' | 'month' | 'year' | 'all' = 'day'): Promise<StatisticsSummary> => {
    const response = await api.get<StatisticsSummary>('/statistics/summary', {
      params: { range },
    });
    return response.data;
  },

  getRevenueChart: async (
    range: 'day' | 'week' | 'month' | 'year' | 'all' = 'day'
  ): Promise<RevenueChartData[]> => {
    const response = await api.get<RevenueChartData[]>('/statistics/revenue-chart', {
      params: { range },
    });
    return response.data;
  },

  getTopMovies: async (
    range: 'day' | 'week' | 'month' | 'year' | 'all' = 'day',
    limit: number = 5
  ): Promise<TopMovie[]> => {
    const params: any = { range };
    if (limit !== 5) params.limit = limit;
    
    const response = await api.get<TopMovie[]>('/statistics/top-movies', {
      params,
    });
    return response.data;
  },

  getTopStaff: async (
    range: 'day' | 'week' | 'month' | 'year' | 'all' = 'day',
    limit: number = 5
  ): Promise<TopStaff[]> => {
    const params: any = { range };
    if (limit !== 5) params.limit = limit;

    const response = await api.get<TopStaff[]>('/statistics/top-staff', {
      params,
    });
    return response.data;
  },
};
