import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { TenantModule } from '../tenant/tenant.module';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { AnotaAiAdapter } from './adapters/anota-ai.adapter';
import { MockAnotaAiAdapter } from './adapters/mock-anota-ai.adapter';
import { INTEGRATION_ADAPTER } from './adapters/integration.adapter';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    TenantModule,
    BullModule.registerQueue({ name: 'integration.ingest' }),
  ],
  controllers: [IntegrationsController],
  providers: [
    IntegrationsService,
    {
      provide: INTEGRATION_ADAPTER,
      useFactory: (config: ConfigService) =>
        config.get('integrationAdapter') === 'anota_ai'
          ? new AnotaAiAdapter()
          : new MockAnotaAiAdapter(),
      inject: [ConfigService],
    },
  ],
  exports: [IntegrationsService, INTEGRATION_ADAPTER],
})
export class IntegrationsModule {}
