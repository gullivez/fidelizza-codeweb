import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { DatabaseService } from '../database/database.service';
import { MessagingService } from '../messaging/messaging.service';
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
  templateParams: Record<string, string>;
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

    const targetIdByCustomerId = await this.insertTargetSnapshots(
      accountId,
      restaurantId,
      campaignId,
      campaign.segmentName,
      targets,
    );

    let sent = 0;
    let failed = 0;

    for (const target of targets) {
      await this.rateLimiter.acquireSlot(restaurantId);

      const variables = { ...campaign.templateParams, '1': target.name };
      const campaignTargetId = targetIdByCustomerId.get(target.id)!;

      try {
        const result = await this.messagingService.sendTemplate({
          to: target.phone,
          templateName: campaign.templateName,
          contentSid: campaign.contentSid,
          variables,
          category: 'marketing',
        });

        await this.insertMessageLog(
          accountId,
          restaurantId,
          campaignTargetId,
          result.providerMessageId,
          'queued',
          null,
        );
        sent++;
      } catch (err) {
        await this.insertMessageLog(
          accountId,
          restaurantId,
          campaignTargetId,
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
        SELECT segment_name, template_name, content_sid, template_params
        FROM campaign
        WHERE id = ${campaignId} AND restaurant_id = ${restaurantId} AND account_id = ${accountId}
      `,
    );

    const row = rows[0];
    return {
      segmentName: row['segment_name'] as string,
      templateName: row['template_name'] as string,
      contentSid: row['content_sid'] as string,
      templateParams: row['template_params'] as Record<string, string>,
    };
  }

  private async insertTargetSnapshots(
    accountId: string,
    restaurantId: string,
    campaignId: string,
    segmentName: string,
    targets: EligibleTarget[],
  ): Promise<Map<string, string>> {
    const targetIdByCustomerId = new Map<string, string>();

    for (let i = 0; i < targets.length; i += TARGET_INSERT_CHUNK_SIZE) {
      const chunkTargets = targets.slice(i, i + TARGET_INSERT_CHUNK_SIZE);
      const chunk = chunkTargets.map((t) => ({
        campaign_id: campaignId,
        account_id: accountId,
        restaurant_id: restaurantId,
        customer_id: t.id,
        phone_snapshot: t.phone,
        name_snapshot: t.name,
        segment_snapshot: segmentName,
      }));

      const inserted = await this.db.runInTenantContext(
        accountId,
        (sql) => sql`
          INSERT INTO campaign_target ${sql(
            chunk,
            'campaign_id',
            'account_id',
            'restaurant_id',
            'customer_id',
            'phone_snapshot',
            'name_snapshot',
            'segment_snapshot',
          )}
          RETURNING id, customer_id
        `,
      );

      for (const row of inserted) {
        targetIdByCustomerId.set(
          row['customer_id'] as string,
          row['id'] as string,
        );
      }
    }

    return targetIdByCustomerId;
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
