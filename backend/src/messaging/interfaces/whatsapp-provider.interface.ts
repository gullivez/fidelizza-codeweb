export interface SendTemplateParams {
  to: string;
  templateName: string;
  contentSid: string;
  variables: Record<string, string>;
  category: 'marketing' | 'utility';
}

export interface SendTemplateResult {
  providerMessageId: string;
  status: 'queued' | 'sent';
}

export const WHATSAPP_PROVIDER = 'WHATSAPP_PROVIDER';

export interface WhatsAppProvider {
  sendTemplate(params: SendTemplateParams): Promise<SendTemplateResult>;
}
