import { apiRequest } from "../api-client";

export interface ApiIntegration {
  id: string;
  restaurantId: string;
  provider: string;
  status: "active" | "inactive" | "error";
  syncTime1: string;
  syncTime2: string | null;
  lastSyncAt: string | null;
  lastError: string | null;
  createdAt: string;
}

export interface CreateIntegrationPayload {
  provider: string;
  clientId: string;
  clientSecret: string;
  syncTime1?: string;
  syncTime2?: string;
}

export interface UpdateIntegrationPayload {
  syncTime1?: string;
  syncTime2?: string | null;
  status?: "active" | "inactive";
}

export const integrationsApi = {
  list: (restaurantId: string) =>
    apiRequest<ApiIntegration[]>(`/restaurants/${restaurantId}/integrations`),

  get: (restaurantId: string, id: string) =>
    apiRequest<ApiIntegration>(`/restaurants/${restaurantId}/integrations/${id}`),

  create: (restaurantId: string, data: CreateIntegrationPayload) =>
    apiRequest<ApiIntegration>(`/restaurants/${restaurantId}/integrations`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (restaurantId: string, id: string, data: UpdateIntegrationPayload) =>
    apiRequest<ApiIntegration>(`/restaurants/${restaurantId}/integrations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  remove: (restaurantId: string, id: string) =>
    apiRequest<void>(`/restaurants/${restaurantId}/integrations/${id}`, {
      method: "DELETE",
    }),

  syncNow: (restaurantId: string, id: string) =>
    apiRequest<{ jobId: string }>(`/restaurants/${restaurantId}/integrations/${id}/sync`, {
      method: "POST",
    }),
};
