import { apiRequest } from "../api-client";

export type AnalyticsPeriod = "7d" | "30d" | "90d";

export interface AnalyticsKpis {
  revenue: number;
  revenueDelta: number;
  conversion: number;
  reactivated: number;
  campaignsSent: number;
}

export interface LastCampaignFunnel {
  name: string;
  sent: number;
  delivered: number;
  read: number;
  orders: number;
  revenue: number;
}

export interface DashboardResponse {
  kpis: AnalyticsKpis;
  lastCampaign: LastCampaignFunnel | null;
  cost: null;
  revenueNet: null;
}

export interface RfmDistribution {
  champions: number;
  new: number;
  atRisk: number;
  inactive: number;
}

export interface WhatsappStatus {
  status: "sandbox" | "connected" | "warning" | "blocked";
  label: string;
  healthy: boolean;
}

export function getDashboard(
  restaurantId: string,
  period: AnalyticsPeriod,
): Promise<DashboardResponse> {
  return apiRequest<DashboardResponse>(
    `/restaurants/${restaurantId}/analytics/dashboard?period=${period}`,
  );
}

export function getRfmDistribution(restaurantId: string): Promise<RfmDistribution> {
  return apiRequest<RfmDistribution>(`/restaurants/${restaurantId}/analytics/rfm-distribution`);
}

export function getWhatsappStatus(restaurantId: string): Promise<WhatsappStatus> {
  return apiRequest<WhatsappStatus>(`/restaurants/${restaurantId}/analytics/whatsapp-status`);
}
