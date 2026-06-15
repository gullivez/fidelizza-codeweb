import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { TenantModule } from '../tenant/tenant.module';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { PollingService } from './polling.service';
import { AnotaAiAdapter } from './adapters/anota-ai.adapter';
import { MockAnotaAiAdapter } from './adapters/mock-anota-ai.adapter';
import { INTEGRATION_ADAPTER } from './adapters/integration.adapter';

const isProduction = process.env.NODE_ENV === 'production';

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
    PollingService,
    AnotaAiAdapter,
    MockAnotaAiAdapter,
    {
      provide: INTEGRATION_ADAPTER,
      useClass: isProduction ? AnotaAiAdapter : MockAnotaAiAdapter,
    },
  ],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
