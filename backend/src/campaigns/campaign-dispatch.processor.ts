import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { DatabaseService } from '../database/database.service';
import { MessagingService } from '../messaging/messaging.service';
import { MessagingConfigService } from '../messaging/messaging-config.service';
import {
  resolveTemplateVariables,
  type TemplateVariableMap,
} from '../messaging/variables/template-renderer';
import { CampaignsService, type EligibleTarget } from './campaigns.service';
import { RateLimiterService } from './rate-limiter.service';

interface DispatchJobData {
  campaignId: string;
  accountId: string;
  restaurantId: string;
}

interface CampaignSnapshot {
  segmentName: string;
  templateName: string;
  contentSid: string;
  templateVariables: TemplateVariableMap;
}

interface TargetSnapshotInfo {
  targetId: string;
  resolvedVariables: Record<string, string>;
}

const TARGET_INSERT_CHUNK_SIZE = 100;

@Processor('campaign.dispatch', { concurrency: 1 })
export class CampaignDispatchProcessor extends WorkerHost {
  private readonly logger = new Logger(CampaignDispatchProcessor.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly campaignsService: CampaignsService,
    private readonly messagingService: MessagingService,
    private readonly rateLimiter: RateLimiterService,
    private readonly messagingConfigService: MessagingConfigService,
  ) {
    super();
  }

  async process(job: Job<DispatchJobData>): Promise<void> {
    const { campaignId, accountId, restaurantId } = job.data;

    const campaign = await this.getCampaign(
      accountId,
      restaurantId,
      campaignId,
    );
    const targets = await this.campaignsService.findEligibleTargets(
      accountId,
      restaurantId,
      campaign.segmentName,
    );
    const restaurantName = await this.getRestaurantName(
      accountId,
      restaurantId,
    );

    const targetInfoByCustomerId = await this.insertTargetSnapshots(
      accountId,
      restaurantId,
      campaignId,
      campaign.segmentName,
      campaign.templateVariables,
      restaurantName,
      targets,
    );

    const subCredentials = await this.messagingConfigService.resolveCredentials(
      restaurantId,
      accountId,
    );

    let sent = 0;
    let failed = 0;

    for (const target of targets) {
      await this.rateLimiter.acquireSlot(restaurantId);

      const info = targetInfoByCustomerId.get(target.id)!;

      try {
        const result = await this.messagingService.sendTemplate({
          to: target.phone,
          templateName: campaign.templateName,
          contentSid: campaign.contentSid,
          variables: info.resolvedVariables,
          category: 'marketing',
          twilioCredentials: subCredentials ?? undefined,
        });

        await this.insertMessageLog(
          accountId,
          restaurantId,
          info.targetId,
          result.providerMessageId,
          'queued',
          null,
        );
        sent++;
      } catch (err) {
        await this.insertMessageLog(
          accountId,
          restaurantId,
          info.targetId,
          null,
          'failed',
          String(err),
        );
        failed++;
      }

      if ((sent + failed) % 10 === 0) {
        this.logger.log(
          { sent, failed, total: targets.length, restaurantId },
          'campaign dispatch progress',
        );
      }
    }

    const finalStatus = targets.length > 0 && sent === 0 ? 'failed' : 'sent';
    await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
        UPDATE campaign
        SET status = ${finalStatus}, total_targets = ${targets.length}
        WHERE id = ${campaignId} AND restaurant_id = ${restaurantId} AND account_id = ${accountId}
      `,
    );

    this.logger.log(
      { campaignId, sent, failed, total: targets.length },
      'campaign dispatch done',
    );
  }

  private async getCampaign(
    accountId: string,
    restaurantId: string,
    campaignId: string,
  ): Promise<CampaignSnapshot> {
    const rows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
        SELECT segment_name, template_name, content_sid, template_variables
        FROM campaign
        WHERE id = ${campaignId} AND restaurant_id = ${restaurantId} AND account_id = ${accountId}
      `,
    );

    const row = rows[0];
    return {
      segmentName: row['segment_name'] as string,
      templateName: row['template_name'] as string,
      contentSid: row['content_sid'] as string,
      templateVariables: row['template_variables'] as TemplateVariableMap,
    };
  }

  private async getRestaurantName(
    accountId: string,
    restaurantId: string,
  ): Promise<string> {
    const rows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
        SELECT name FROM restaurants WHERE id = ${restaurantId} AND account_id = ${accountId}
      `,
    );
    return (rows[0]?.['name'] as string) ?? '';
  }

  private async insertTargetSnapshots(
    accountId: string,
    restaurantId: string,
    campaignId: string,
    segmentName: string,
    templateVariables: TemplateVariableMap,
    restaurantName: string,
    targets: EligibleTarget[],
  ): Promise<Map<string, TargetSnapshotInfo>> {
    const targetInfoByCustomerId = new Map<string, TargetSnapshotInfo>();

    for (let i = 0; i < targets.length; i += TARGET_INSERT_CHUNK_SIZE) {
      const chunkTargets = targets.slice(i, i + TARGET_INSERT_CHUNK_SIZE);
      const resolvedByCustomerId = new Map(
        chunkTargets.map((t) => [
          t.id,
          resolveTemplateVariables(templateVariables, {
            customer: { name: t.name },
            restaurant: { name: restaurantName },
          }),
        ]),
      );

      const inserted = await this.db.runInTenantContext(accountId, (sql) => {
        const chunk = chunkTargets.map((t) => ({
          campaign_id: campaignId,
          account_id: accountId,
          restaurant_id: restaurantId,
          customer_id: t.id,
          phone_snapshot: t.phone,
          name_snapshot: t.name,
          segment_snapshot: segmentName,
          resolved_variables: sql.json(resolvedByCustomerId.get(t.id)!),
        }));

        return sql`
            INSERT INTO campaign_target ${sql(
              chunk,
              'campaign_id',
              'account_id',
              'restaurant_id',
              'customer_id',
              'phone_snapshot',
              'name_snapshot',
              'segment_snapshot',
              'resolved_variables',
            )}
            RETURNING id, customer_id
          `;
      });

      for (const row of inserted) {
        const customerId = row['customer_id'] as string;
        targetInfoByCustomerId.set(customerId, {
          targetId: row['id'] as string,
          resolvedVariables: resolvedByCustomerId.get(customerId)!,
        });
      }
    }

    return targetInfoByCustomerId;
  }

  private async insertMessageLog(
    accountId: string,
    restaurantId: string,
    campaignTargetId: string,
    providerMessageId: string | null,
    status: 'queued' | 'failed',
    errorCode: string | null,
  ): Promise<void> {
    await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
        INSERT INTO message_log (campaign_target_id, account_id, restaurant_id, provider_message_id, status, error_code)
        VALUES (${campaignTargetId}, ${accountId}, ${restaurantId}, ${providerMessageId}, ${status}, ${errorCode})
      `,
    );
  }
}
