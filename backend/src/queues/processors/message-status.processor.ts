import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { DatabaseService } from '../../database/database.service';

interface MessageStatusJobData {
  providerMessageId: string;
  status: string;
}

@Processor('message.status', { concurrency: 10 })
export class MessageStatusProcessor extends WorkerHost {
  private readonly logger = new Logger(MessageStatusProcessor.name);

  constructor(private readonly db: DatabaseService) {
    super();
  }

  async process(job: Job<MessageStatusJobData>): Promise<void> {
    const { providerMessageId, status } = job.data;

    const rows = await this.db.getSql()`
      SELECT ml.id, ml.account_id, ml.restaurant_id, ml.status AS old_status
      FROM message_log ml
      WHERE ml.provider_message_id = ${providerMessageId}
      LIMIT 1
    `;

    if (!rows.length) {
      this.logger.warn(`message_log não encontrado para provider_message_id=${providerMessageId}`);
      return;
    }

    const { id, account_id: accountId, restaurant_id: restaurantId, old_status: oldStatus } = rows[0];

    await this.db.runInTenantContext(
      accountId as string,
      (sql) => sql`
        UPDATE message_log
        SET status       = ${status},
            delivered_at = CASE WHEN ${status} = 'delivered' THEN now() ELSE delivered_at END,
            read_at      = CASE WHEN ${status} = 'read'      THEN now() ELSE read_at      END
        WHERE id            = ${id as string}
          AND account_id    = ${accountId as string}
          AND restaurant_id = ${restaurantId as string}
      `,
    );

    this.logger.log({ providerMessageId, oldStatus, newStatus: status }, 'message status updated');
  }
}
