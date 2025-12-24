import api from "@/lib/apiClient";
import { CreateReviewRequest, Review, ReviewListResponse } from "@/types/review";

export const reviewService = {
  createReview: async (data: CreateReviewRequest): Promise<Review> => {
    const response = await api.post<Review>("/reviews", data);
    return response.data;
  },

  getReviewsByMovieId: async (movieId: string, limit: number = 10): Promise<ReviewListResponse> => {
    const response = await api.get<ReviewListResponse>(`/films/${movieId}/reviews`, {
      params: { limit },
    });
    return response.data;
  },
};
