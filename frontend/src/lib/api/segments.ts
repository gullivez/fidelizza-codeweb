import { apiRequest } from "../api-client";

export interface ApiSegmentStat {
  name: string;
  label: string;
  color: string;
  count: number;
  percentage: number;
}

export interface SegmentStatsResponse {
  segments: ApiSegmentStat[];
  total: number;
  lastEvaluatedAt: string | null;
}

export const segmentsApi = {
  getStats: (restaurantId: string) =>
    apiRequest<SegmentStatsResponse>(`/restaurants/${restaurantId}/segments`),

  recalculate: (restaurantId: string) =>
    apiRequest<{ jobId: string; message: string }>(
      `/restaurants/${restaurantId}/segments/recalculate`,
      { method: "POST" },
    ),
};
