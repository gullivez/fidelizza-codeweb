import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { CustomersModule } from '../customers/customers.module';
import { OrdersModule } from '../orders/orders.module';
import { PollingService } from '../integrations/polling.service';
import { SyncIntegrationProcessor } from './processors/sync-integration.processor';
import { IngestOrderProcessor } from './processors/ingest-order.processor';
import { RfmEngineService } from '../segments/rfm-engine.service';
import { SegmentationProcessor } from '../segments/segmentation.processor';
import { CustomerUpdatedListener } from '../segments/customer-updated.listener';
import { DailyRfmScheduler } from '../segments/daily-rfm.scheduler';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    IntegrationsModule,
    CustomersModule,
    OrdersModule,
    BullModule.registerQueue({ name: 'integration.ingest' }),
    BullModule.registerQueue({ name: 'segmentation.recalculate' }),
  ],
  providers: [
    PollingService,
    SyncIntegrationProcessor,
    IngestOrderProcessor,
    RfmEngineService,
    SegmentationProcessor,
    CustomerUpdatedListener,
    DailyRfmScheduler,
  ],
})
export class QueuesModule {}
