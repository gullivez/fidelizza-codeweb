import { Inject, Injectable } from '@nestjs/common';
import {
  WHATSAPP_PROVIDER,
  type SendTemplateParams,
  type SendTemplateResult,
  type WhatsAppProvider,
} from './interfaces/whatsapp-provider.interface';

@Injectable()
export class MessagingService {
  constructor(
    @Inject(WHATSAPP_PROVIDER) private readonly provider: WhatsAppProvider,
  ) {}

  sendTemplate(params: SendTemplateParams): Promise<SendTemplateResult> {
    return this.provider.sendTemplate(params);
  }
}
