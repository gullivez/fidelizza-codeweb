import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { TwilioWhatsAppAdapter } from './adapters/twilio-whatsapp.adapter';
import { MockWhatsAppAdapter } from './adapters/mock-whatsapp.adapter';
import { WHATSAPP_PROVIDER } from './interfaces/whatsapp-provider.interface';

@Global()
@Module({
  imports: [BullModule.registerQueue({ name: 'message.status' })],
  controllers: [MessagingController],
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
