import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { DatabaseService } from '../../database/database.service';

interface ConversionAttributionJobData {
  restaurantOrderId: string;
  accountId: string;
  restaurantId: string;
}

interface RestaurantOrderRow {
  customer_id: string;
  total_amount: string;
  ordered_at: Date;
}

interface LastTouchRow {
  campaign_id: string;
  campaign_target_id: string;
  message_sent_at: Date;
}

@Processor('conversion.attribution', { concurrency: 5 })
export class ConversionAttributionProcessor extends WorkerHost {
  private readonly logger = new Logger(ConversionAttributionProcessor.name);

  constructor(private readonly db: DatabaseService) {
    super();
  }

  async process(job: Job<ConversionAttributionJobData>): Promise<void> {
    const { restaurantOrderId, accountId, restaurantId } = job.data;

    await this.db.runInTenantContext(accountId, async (sql) => {
      const orderRows = await sql`
        SELECT customer_id, total_amount, ordered_at
        FROM restaurant_order
        WHERE id            = ${restaurantOrderId}
          AND account_id    = ${accountId}
          AND restaurant_id = ${restaurantId}
      `;

      if (!orderRows.length) {
        this.logger.warn(
          `restaurant_order não encontrado para id=${restaurantOrderId}`,
        );
        return;
      }

      const {
        customer_id: customerId,
        total_amount: totalAmount,
        ordered_at: orderedAt,
      } = orderRows[0] as unknown as RestaurantOrderRow;

      const lastTouchRows = await sql`
        SELECT c.id AS campaign_id, ct.id AS campaign_target_id, ml.sent_at AS message_sent_at
        FROM message_log ml
        JOIN campaign_target ct ON ct.id = ml.campaign_target_id
        JOIN campaign c         ON c.id  = ct.campaign_id
        WHERE ct.customer_id = ${customerId}
          AND ml.status IN ('sent','delivered','read')
          AND ml.sent_at IS NOT NULL
          AND ${orderedAt} >= ml.sent_at
          AND ${orderedAt} <= ml.sent_at + (c.attribution_window_days || ' days')::interval
          AND ct.restaurant_id = ${restaurantId}
        ORDER BY ml.sent_at DESC
        LIMIT 1
      `;

      if (!lastTouchRows.length) {
        this.logger.debug(
          `Nenhuma campanha elegível para order=${restaurantOrderId} (sem last-touch dentro da janela)`,
        );
        return;
      }

      const {
        campaign_id: campaignId,
        campaign_target_id: campaignTargetId,
        message_sent_at: messageSentAt,
      } = lastTouchRows[0] as unknown as LastTouchRow;

      const inserted = await sql`
        INSERT INTO conversion (
          account_id, restaurant_id, campaign_id, campaign_target_id, customer_id,
          restaurant_order_id, revenue_attributed, order_placed_at, message_sent_at
        ) VALUES (
          ${accountId}, ${restaurantId}, ${campaignId}, ${campaignTargetId}, ${customerId},
          ${restaurantOrderId}, ${totalAmount}, ${orderedAt}, ${messageSentAt}
        )
        ON CONFLICT (restaurant_order_id) DO NOTHING
        RETURNING id
      `;

      if (inserted.length) {
        this.logger.log(
          { restaurantOrderId, campaignId, revenue: totalAmount },
          'conversion atribuída',
        );
      }
    });
  }
}
