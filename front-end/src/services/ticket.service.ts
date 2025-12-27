import apiClient from '@/lib/apiClient';

export interface CheckInResponse {
  message: string;
}

export const ticketService = {
  checkIn: async (code: string) => {
    const res = await apiClient.post<CheckInResponse>(`/tickets/checkin/${code}`);
    return res.data;
  },
};
