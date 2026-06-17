import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import type { Job } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { IntegrationsService } from '../../integrations/integrations.service';
import { INTEGRATION_ADAPTER } from '../../integrations/adapters/integration.adapter';
import type { IntegrationAdapter } from '../../integrations/adapters/integration.adapter';
import { PollingService } from '../../integrations/polling.service';
import { DatabaseService } from '../../database/database.service';
import { RedisService } from '../../redis/redis.service';

interface SyncJobData {
  integrationId: string;
  syncTime1?: string;
  syncTime2?: string | null;
}

@Processor('integration.ingest')
export class SyncIntegrationProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncIntegrationProcessor.name);

  constructor(
    private readonly integrationsService: IntegrationsService,
    @Inject(INTEGRATION_ADAPTER) private readonly adapter: IntegrationAdapter,
    private readonly pollingService: PollingService,
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
    @InjectQueue('integration.ingest') private readonly ingestQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<SyncJobData>): Promise<void> {
    if (job.name === 'reschedule-polling') {
      this.pollingService.reschedule(
        job.data.integrationId,
        job.data.syncTime1 as string,
        (job.data.syncTime2 as string | null) ?? null,
      );
      return;
    }
    if (job.name === 'cancel-polling') {
      this.pollingService.cancelSchedule(job.data.integrationId);
      return;
    }
    if (job.name !== 'sync') return;

    const { integrationId } = job.data;
    this.logger.log(`Starting sync for integration ${integrationId}`);

    let syncLogId: string | null = null;
    let accountId: string | null = null;

    const syncLogRows = await this.db.getSql()`
      INSERT INTO sync_log (integration_id, status)
      VALUES (${integrationId}, 'running')
      RETURNING id
    `;
    syncLogId = syncLogRows[0]['id'] as string;

    try {
      const rawIntegration =
        await this.integrationsService.findOneRaw(integrationId);
      accountId = rawIntegration['account_id'] as string;

      const credentials = this.integrationsService.decryptCredentials(
        rawIntegration['credentials_enc'] as string,
      );

      const orders = await this.adapter.fetchOrders(credentials, new Date());
      this.logger.log(
        `Fetched ${orders.length} orders for integration ${integrationId}`,
      );

      for (const order of orders) {
        const jobId = `order:${integrationId}:${order.externalId}`;
        await this.ingestQueue.add(
          'ingest-order',
          {
            integrationId,
            accountId,
            restaurantId: rawIntegration['restaurant_id'] as string,
            order,
          },
          { jobId, removeOnComplete: 100, removeOnFail: 50 },
        );
      }

      await this.db.getSql()`
        UPDATE sync_log
        SET status = 'success', finished_at = now(), orders_fetched = ${orders.length}
        WHERE id = ${syncLogId}
      `;
      await this.integrationsService.markSyncSuccess(integrationId, accountId);
      this.logger.log(`Sync complete for integration ${integrationId}`);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Sync failed for integration ${integrationId}: ${error}`,
      );
      if (syncLogId) {
        await this.db.getSql()`
          UPDATE sync_log
          SET status = 'error', finished_at = now(), error = ${error}
          WHERE id = ${syncLogId}
        `;
      }
      if (accountId) {
        await this.integrationsService.markSyncError(
          integrationId,
          error,
          accountId,
        );
      }
      throw err;
    } finally {
      await this.redis.getClient().del(`sync:lock:${integrationId}`);
    }
  }
}
