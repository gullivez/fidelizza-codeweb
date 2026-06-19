import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { TenantModule } from '../tenant/tenant.module';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { MessagingConfigService } from './messaging-config.service';
import { MessagingConfigController } from './messaging-config.controller';
import { TwilioWhatsAppAdapter } from './adapters/twilio-whatsapp.adapter';
import { MockWhatsAppAdapter } from './adapters/mock-whatsapp.adapter';
import { WHATSAPP_PROVIDER } from './interfaces/whatsapp-provider.interface';

@Global()
@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    TenantModule,
    BullModule.registerQueue({ name: 'message.status' }),
  ],
  controllers: [MessagingController, MessagingConfigController],
  providers: [
    MessagingService,
    MessagingConfigService,
    {
      provide: WHATSAPP_PROVIDER,
      useFactory: (config: ConfigService) =>
        config.get('whatsapp.provider') === 'twilio'
          ? new TwilioWhatsAppAdapter(config)
          : new MockWhatsAppAdapter(),
      inject: [ConfigService],
    },
  ],
  exports: [MessagingService, MessagingConfigService],
})
export class MessagingModule {}
