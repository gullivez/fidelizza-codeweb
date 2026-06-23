import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { DatabaseService } from '../../database/database.service';

const STALLED_THRESHOLD_MS = 5 * 60 * 1000;

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectQueue('integration.ingest')
    private readonly integrationIngestQueue: Queue,
    @InjectQueue('segmentation.recalculate')
    private readonly segmentationQueue: Queue,
    @InjectQueue('campaign.dispatch')
    private readonly campaignDispatchQueue: Queue,
    @InjectQueue('message.status')
    private readonly messageStatusQueue: Queue,
    @InjectQueue('conversion.attribution')
    private readonly conversionAttributionQueue: Queue,
    private readonly db: DatabaseService,
  ) {}

  async runChecks(): Promise<void> {
    await this.safeRun('queue_stalled', () => this.checkStalledQueues());
    await this.safeRun('integration_offline', () =>
      this.checkIntegrationsOffline(),
    );
    await this.safeRun('whatsapp_disconnected', () =>
      this.checkWhatsappDisconnected(),
    );
  }

  private async safeRun(check: string, fn: () => Promise<void>): Promise<void> {
    try {
      await fn();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error(
        { err: error, check },
        'falha ao rodar verificação de alerta',
      );
    }
  }

  private get monitoredQueues(): Record<string, Queue> {
    return {
      'integration.ingest': this.integrationIngestQueue,
      'segmentation.recalculate': this.segmentationQueue,
      'campaign.dispatch': this.campaignDispatchQueue,
      'message.status': this.messageStatusQueue,
      'conversion.attribution': this.conversionAttributionQueue,
    };
  }

  private async checkStalledQueues(): Promise<void> {
    const now = Date.now();

    for (const [name, queue] of Object.entries(this.monitoredQueues)) {
      const jobs = await queue.getJobs(['waiting', 'active']);
      if (!jobs.length) continue;

      const stalled = jobs.filter(
        (job) =>
          now - (job.processedOn ?? job.timestamp) > STALLED_THRESHOLD_MS,
      );
      if (!stalled.length) continue;

      const oldestAgeMs = Math.max(
        ...stalled.map((job) => now - (job.processedOn ?? job.timestamp)),
      );

      this.logger.error(
        {
          alert: 'queue_stalled',
          queue: name,
          count: stalled.length,
          oldestJobAge: `${Math.round(oldestAgeMs / 60_000)}min`,
        },
        'fila travada',
      );
    }
  }

  /**
   * Verificação GLOBAL de saúde cross-tenant — roda fora de runInTenantContext
   * de propósito. db.getSql() retorna o client cru, sem `SET LOCAL app.account_id`,
   * e as policies RLS (tenant_isolation) liberam leitura a TODOS os tenants
   * quando esse GUC não está setado (CASE WHEN ... IS NULL THEN true). Mesmo
   * padrão já usado em IntegrationsService.findAllActiveRaw() e em
   * DailyRfmScheduler.enqueueAllRestaurants() — evita rodar uma query por tenant
   * dentro de runInTenantContext(accountId, ...) para uma checagem só-leitura.
   *
   * status='error' nunca volta para 'active' automaticamente após um sync bem
   * sucedido (IntegrationsService.markSyncSuccess só atualiza last_sync_at/
   * last_error — bug pré-existente, fora do escopo deste bloco). Por isso o
   * threshold de tempo abaixo é o sinal mais confiável de recuperação.
   * Integrações sincronizam só 1-2x/dia via polling agendado (sync_time_1/
   * sync_time_2 em PollingService), não por webhook contínuo — 26h (24h +
   * margem) evita falso positivo para integrações saudáveis fora da janela.
   */
  private async checkIntegrationsOffline(): Promise<void> {
    const rows = await this.db.getSql()`
      SELECT id, restaurant_id, status, last_sync_at
      FROM integration
      WHERE status = 'error'
         OR (last_sync_at IS NOT NULL AND last_sync_at < now() - interval '26 hours')
    `;

    for (const row of rows) {
      const integrationId = row['id'] as string;
      const restaurantId = row['restaurant_id'] as string;
      const lastSyncAt = row['last_sync_at'] as Date | null;

      this.logger.error(
        {
          alert: 'integration_offline',
          integrationId,
          restaurantId,
          lastSyncAt,
        },
        'integração offline',
      );
    }
  }

  private async checkWhatsappDisconnected(): Promise<void> {
    const rows = await this.db.getSql()`
      SELECT restaurant_id
      FROM messaging_config
      WHERE status != 'active'
    `;

    for (const row of rows) {
      const restaurantId = row['restaurant_id'] as string;

      this.logger.error(
        { alert: 'whatsapp_disconnected', restaurantId },
        'WhatsApp desconectado',
      );
    }
  }
}
