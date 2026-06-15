import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CustomersService } from '../../customers/customers.service';
import { OrdersService } from '../../orders/orders.service';
import type { RawOrder } from '../../integrations/adapters/integration.adapter';
import { DatabaseService } from '../../database/database.service';

interface IngestOrderJobData {
  integrationId: string;
  accountId: string;
  restaurantId: string;
  order: RawOrder;
}

@Processor('integration.ingest')
export class IngestOrderProcessor extends WorkerHost {
  private readonly logger = new Logger(IngestOrderProcessor.name);

  constructor(
    private readonly customersService: CustomersService,
    private readonly ordersService: OrdersService,
    private readonly db: DatabaseService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process(job: Job<IngestOrderJobData>): Promise<void> {
    if (job.name !== 'ingest-order') return;

    const { accountId, restaurantId, order } = job.data;

    // 1. Upsert customer
    const { id: customerId } = await this.customersService.upsertByPhone(
      restaurantId,
      accountId,
      order.customer.phone,
      order.customer.name,
    );

    // 2. Upsert order (idempotent — ON CONFLICT DO NOTHING)
    const { orderId, isNew } = await this.ordersService.upsertOrder({
      restaurantId,
      accountId,
      customerId,
      externalId: order.externalId,
      status: order.status,
      totalAmount: order.totalAmount,
      orderedAt: order.orderedAt,
      items: order.items,
    });

    if (!isNew) {
      this.logger.debug(`Order ${order.externalId} already exists, skipping`);
      return;
    }

    // 3. Update customer aggregates
    await this.customersService.updateAggregates(
      customerId,
      restaurantId,
      accountId,
    );

    // 4. Emit event for Sprint 3 (RFM segmentation)
    this.eventEmitter.emit('order.created', {
      orderId,
      customerId,
      restaurantId,
      accountId,
    });

    // 5. Update sync_log counters (use subquery to target the latest running log)
    const integrationId = job.data.integrationId;
    const isNewCustomer = !(
      await this.db.getSql()`
      SELECT 1 FROM restaurant_order
      WHERE customer_id   = ${customerId}
        AND restaurant_id = ${restaurantId}
        AND id != ${orderId}
      LIMIT 1
    `
    ).length;

    await this.db.getSql()`
      UPDATE sync_log
      SET orders_new    = orders_new + 1,
          customers_new = customers_new + ${isNewCustomer ? 1 : 0}
      WHERE id = (
        SELECT id FROM sync_log
        WHERE integration_id = ${integrationId}
          AND status = 'running'
        ORDER BY started_at DESC
        LIMIT 1
      )
    `;

    this.logger.debug(
      `Ingested order ${order.externalId} for restaurant ${restaurantId}`,
    );
  }
}
