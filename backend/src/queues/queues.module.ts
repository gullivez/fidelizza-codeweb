import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { CustomersModule } from '../customers/customers.module';
import { OrdersModule } from '../orders/orders.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { PollingService } from '../integrations/polling.service';
import { SyncIntegrationProcessor } from './processors/sync-integration.processor';
import { IngestOrderProcessor } from './processors/ingest-order.processor';
import { MessageStatusProcessor } from './processors/message-status.processor';
import { ConversionAttributionProcessor } from './processors/conversion-attribution.processor';
import { RfmEngineService } from '../segments/rfm-engine.service';
import { SegmentationProcessor } from '../segments/segmentation.processor';
import { CustomerUpdatedListener } from '../segments/customer-updated.listener';
import { DailyRfmScheduler } from '../segments/daily-rfm.scheduler';
import { CampaignDispatchProcessor } from '../campaigns/campaign-dispatch.processor';
import { RateLimiterService } from '../campaigns/rate-limiter.service';
import { OrderConversionListener } from '../analytics/order-conversion.listener';
import { QUEUE_NAMES } from './queue-names';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    IntegrationsModule,
    CustomersModule,
    OrdersModule,
    CampaignsModule,
    ...QUEUE_NAMES.filter((name) => name !== 'alerts.check').map((name) =>
      BullModule.registerQueue({ name }),
    ),
  ],
  providers: [
    PollingService,
    SyncIntegrationProcessor,
    IngestOrderProcessor,
    RfmEngineService,
    SegmentationProcessor,
    CustomerUpdatedListener,
    DailyRfmScheduler,
    CampaignDispatchProcessor,
    MessageStatusProcessor,
    RateLimiterService,
    ConversionAttributionProcessor,
    OrderConversionListener,
  ],
})
export class QueuesModule {}
