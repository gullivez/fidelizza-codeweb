import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagingService } from './messaging.service';
import { TwilioWhatsAppAdapter } from './adapters/twilio-whatsapp.adapter';
import { MockWhatsAppAdapter } from './adapters/mock-whatsapp.adapter';
import { WHATSAPP_PROVIDER } from './interfaces/whatsapp-provider.interface';

@Global()
@Module({
  providers: [
    MessagingService,
    {
      provide: WHATSAPP_PROVIDER,
      useFactory: (config: ConfigService) =>
        config.get('whatsapp.provider') === 'twilio'
          ? new TwilioWhatsAppAdapter(config)
          : new MockWhatsAppAdapter(),
      inject: [ConfigService],
    },
  ],
  exports: [MessagingService],
})
export class MessagingModule {}
