export interface SendTemplateParams {
  to: string;
  templateName: string;
  contentSid: string;
  variables: Record<string, string>;
  category: 'marketing' | 'utility';
  /** Credenciais da subconta do restaurante. Ausente = adapter usa as credenciais do .env (conta-mãe). */
  twilioCredentials?: {
    accountSid: string;
    authToken: string;
    from: string;
  };
}

export interface SendTemplateResult {
  providerMessageId: string;
  status: 'queued' | 'sent';
}

export const WHATSAPP_PROVIDER = 'WHATSAPP_PROVIDER';

export interface WhatsAppProvider {
  sendTemplate(params: SendTemplateParams): Promise<SendTemplateResult>;
}
