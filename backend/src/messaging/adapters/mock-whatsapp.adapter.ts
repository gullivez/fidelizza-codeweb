import { randomUUID } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import type {
  SendTemplateParams,
  SendTemplateResult,
  WhatsAppProvider,
} from '../interfaces/whatsapp-provider.interface';

@Injectable()
export class MockWhatsAppAdapter implements WhatsAppProvider {
  private readonly logger = new Logger(MockWhatsAppAdapter.name);

  sendTemplate(params: SendTemplateParams): Promise<SendTemplateResult> {
    const last4 = params.to.slice(-4);

    this.logger.log(
      `[MockWhatsApp] SEND to=***${last4} template=${params.templateName} vars=${JSON.stringify(params.variables)}`,
    );

    return Promise.resolve({
      providerMessageId: `mock_${randomUUID()}`,
      status: 'queued',
    });
  }
}
