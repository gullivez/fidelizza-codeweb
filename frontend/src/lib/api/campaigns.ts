import { apiRequest } from "../api-client";

export type CampaignStatus = "draft" | "sending" | "sent" | "failed";

export interface ApiCampaign {
  id: string;
  name: string;
  segmentName: string;
  templateName: string;
  contentSid: string;
  status: CampaignStatus;
  totalTargets: number;
  createdAt: string;
  sentAt: string | null;
}

export interface CampaignFunnel {
  total: number;
  queued: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}

export interface ApiCampaignDetail extends ApiCampaign {
  funnel: CampaignFunnel;
}

export interface CampaignPreviewResponse {
  customerName: string;
  phone: string;
  renderedMessage: string;
}

export interface CreateCampaignPayload {
  name: string;
  segmentName: string;
  templateName: string;
  contentSid: string;
  messageBody: string;
  templateParams?: Record<string, string>;
  attributionWindowDays?: number;
}

export interface DispatchCampaignResponse {
  campaignId: string;
  status: "sending";
  estimatedSeconds: number;
}

export const campaignsApi = {
  list: (restaurantId: string) =>
    apiRequest<ApiCampaign[]>(`/restaurants/${restaurantId}/campaigns`),

  get: (restaurantId: string, campaignId: string) =>
    apiRequest<ApiCampaignDetail>(`/restaurants/${restaurantId}/campaigns/${campaignId}`),

  create: (restaurantId: string, payload: CreateCampaignPayload) =>
    apiRequest<ApiCampaign>(`/restaurants/${restaurantId}/campaigns`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  preview: (restaurantId: string, campaignId: string) =>
    apiRequest<CampaignPreviewResponse>(
      `/restaurants/${restaurantId}/campaigns/${campaignId}/preview`,
    ),

  dispatch: (restaurantId: string, campaignId: string, idempotencyKey: string) =>
    apiRequest<DispatchCampaignResponse>(
      `/restaurants/${restaurantId}/campaigns/${campaignId}/dispatch`,
      {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
      },
    ),

  remove: (restaurantId: string, campaignId: string) =>
    apiRequest<void>(`/restaurants/${restaurantId}/campaigns/${campaignId}`, {
      method: "DELETE",
    }),
};
