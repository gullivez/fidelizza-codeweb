import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';
import type {
  SendTemplateParams,
  SendTemplateResult,
  WhatsAppProvider,
} from '../interfaces/whatsapp-provider.interface';

@Injectable()
export class TwilioWhatsAppAdapter implements WhatsAppProvider {
  private readonly logger = new Logger(TwilioWhatsAppAdapter.name);
  private readonly client: twilio.Twilio;
  private readonly from: string;

  constructor(config: ConfigService) {
    const accountSid = config.get<string>('whatsapp.twilio.accountSid');
    const authToken = config.get<string>('whatsapp.twilio.authToken');
    const from = config.get<string>('whatsapp.twilio.from');

    if (!accountSid || !authToken) {
      throw new Error(
        'TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN são obrigatórios quando WHATSAPP_PROVIDER=twilio',
      );
    }

    this.client = new twilio.Twilio(accountSid, authToken);
    this.from = from ?? '';
  }

  async sendTemplate(params: SendTemplateParams): Promise<SendTemplateResult> {
    const last4 = params.to.slice(-4);

    const message = await this.client.messages.create({
      from: this.from,
      to: `whatsapp:${params.to}`,
      contentSid: params.contentSid,
      contentVariables: JSON.stringify(params.variables),
    });

    this.logger.log(
      `[TwilioWhatsApp] SEND to=***${last4} contentSid=${params.contentSid} sid=${message.sid}`,
    );

    return { providerMessageId: message.sid, status: 'queued' };
  }
}
