import { apiRequest } from "../api-client";

export interface ApiCustomer {
  id: string;
  restaurantId: string;
  phone: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  avgTicket: number;
  lastOrderAt: string | null;
  createdAt: string;
  segmentName: string | null;
}

export interface ApiOrderSummary {
  id: string;
  externalId: string;
  status: string;
  totalAmount: number;
  orderedAt: string;
}

export interface ApiCustomerDetail extends ApiCustomer {
  recentOrders: ApiOrderSummary[];
}

export interface CustomerListResponse {
  data: ApiCustomer[];
  total: number;
  page: number;
  limit: number;
}

export const customersApi = {
  list: (
    restaurantId: string,
    params: { page?: number; limit?: number; search?: string; segment?: string } = {},
  ) => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.limit) q.set("limit", String(params.limit));
    if (params.search) q.set("search", params.search);
    if (params.segment) q.set("segment", params.segment);
    const qs = q.toString() ? `?${q.toString()}` : "";
    return apiRequest<CustomerListResponse>(`/restaurants/${restaurantId}/customers${qs}`);
  },

  get: (restaurantId: string, customerId: string) =>
    apiRequest<ApiCustomerDetail>(`/restaurants/${restaurantId}/customers/${customerId}`),
};
