import { apiRequest } from "../api-client";

export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "failed";

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
  scheduledAt: string | null;
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

export type TemplateVariableMap = Record<
  string,
  { type: "dynamic"; key: string } | { type: "static"; value: string }
>;

export interface CreateCampaignPayload {
  name: string;
  segmentName: string;
  templateName: string;
  contentSid: string;
  messageBody: string;
  templateVariables?: TemplateVariableMap;
  attributionWindowDays?: number;
}

export interface TwilioTemplate {
  contentSid: string;
  friendlyName: string;
  body: string;
  variableCount: number;
  language: string;
}

export interface VariableDefinition {
  key: string;
  label: string;
  category: "contact" | "restaurant";
}

export interface DispatchCampaignResponse {
  campaignId: string;
  status: "sending" | "scheduled";
  estimatedSeconds?: number;
  scheduledAt?: string;
}

/** Recebe o valor cru de um <input type="datetime-local"> (YYYY-MM-DDTHH:mm, sem fuso)
 * e monta o ISO com offset de Brasília explícito. Brasil não usa horário de verão desde
 * 2019, então o offset -03:00 é sempre válido. */
export function toBrtIso(localDateTimeValue: string): string {
  return `${localDateTimeValue}:00-03:00`;
}

/** Valor mínimo (now + 6min, com 1min de margem sobre o mínimo de 5min do backend)
 * formatado como horário de parede em BRT, pronto pro atributo `min` do input. */
export function getMinScheduleInputValue(): string {
  const brtMs = Date.now() + 6 * 60 * 1000 - 3 * 60 * 60 * 1000;
  const d = new Date(brtMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
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

  dispatch: (
    restaurantId: string,
    campaignId: string,
    idempotencyKey: string,
    scheduledAt?: string,
  ) =>
    apiRequest<DispatchCampaignResponse>(
      `/restaurants/${restaurantId}/campaigns/${campaignId}/dispatch`,
      {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        body: scheduledAt ? JSON.stringify({ scheduledAt }) : undefined,
      },
    ),

  cancelSchedule: (restaurantId: string, campaignId: string) =>
    apiRequest<void>(`/restaurants/${restaurantId}/campaigns/${campaignId}/cancel-schedule`, {
      method: "POST",
    }),

  remove: (restaurantId: string, campaignId: string) =>
    apiRequest<void>(`/restaurants/${restaurantId}/campaigns/${campaignId}`, {
      method: "DELETE",
    }),

  listTemplates: (restaurantId: string) =>
    apiRequest<TwilioTemplate[]>(`/restaurants/${restaurantId}/messaging/templates`),

  listVariables: (restaurantId: string) =>
    apiRequest<VariableDefinition[]>(`/restaurants/${restaurantId}/messaging/variables`),
};
