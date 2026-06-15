import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { CustomersModule } from '../customers/customers.module';
import { OrdersModule } from '../orders/orders.module';
import { SyncIntegrationProcessor } from './processors/sync-integration.processor';
import { IngestOrderProcessor } from './processors/ingest-order.processor';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    IntegrationsModule,
    CustomersModule,
    OrdersModule,
    BullModule.registerQueue({ name: 'integration.ingest' }),
  ],
  providers: [SyncIntegrationProcessor, IngestOrderProcessor],
})
export class QueuesModule {}
