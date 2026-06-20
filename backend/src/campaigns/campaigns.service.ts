import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { DatabaseService } from '../database/database.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import { RestaurantsService } from '../restaurants/restaurants.service';
import {
  resolveTemplateVariables,
  renderBody,
  type TemplateVariableMap,
} from '../messaging/variables/template-renderer';
import type { CreateCampaignDto } from './dto/create-campaign.dto';
import type {
  CampaignResponseDto,
  CampaignDetailResponseDto,
  CampaignPreviewResponseDto,
} from './dto/campaign-response.dto';
import type { DispatchCampaignResponseDto } from './dto/dispatch-campaign.dto';

export interface EligibleTarget {
  id: string;
  phone: string;
  name: string;
}

const MIN_SCHEDULE_DELAY_MS = 5 * 60 * 1000;

@Injectable()
export class CampaignsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly tenantContext: TenantContextService,
    private readonly config: ConfigService,
    private readonly restaurantsService: RestaurantsService,
    @InjectQueue('campaign.dispatch') private readonly queue: Queue,
  ) {}

  async create(
    restaurantId: string,
    dto: CreateCampaignDto,
  ): Promise<CampaignResponseDto> {
    const { accountId } = this.tenantContext.get();

    const rows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
        INSERT INTO campaign (
          account_id, restaurant_id, name, segment_name,
          template_name, content_sid, message_body, template_variables, attribution_window_days
        ) VALUES (
          ${accountId}, ${restaurantId}, ${dto.name}, ${dto.segmentName},
          ${dto.templateName}, ${dto.contentSid}, ${dto.messageBody},
          ${sql.json(dto.templateVariables ?? {})}, ${dto.attributionWindowDays ?? 7}
        )
        RETURNING id, name, segment_name, template_name, content_sid, message_body,
                  template_variables, status, total_targets, created_at, sent_at, scheduled_at
      `,
    );

    return this.mapCampaignRow(rows[0]);
  }

  async findAll(restaurantId: string): Promise<CampaignResponseDto[]> {
    const { accountId } = this.tenantContext.get();

    const rows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
        SELECT id, name, segment_name, template_name, content_sid, message_body,
               template_variables, status, total_targets, created_at, sent_at, scheduled_at
        FROM campaign
        WHERE restaurant_id = ${restaurantId} AND account_id = ${accountId}
        ORDER BY created_at DESC
      `,
    );

    return rows.map((r) => this.mapCampaignRow(r));
  }

  async findOne(
    id: string,
    restaurantId: string,
  ): Promise<CampaignDetailResponseDto> {
    const { accountId } = this.tenantContext.get();

    const rows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
        SELECT c.id, c.name, c.segment_name, c.template_name, c.content_sid, c.message_body,
               c.template_variables, c.status, c.total_targets, c.created_at, c.sent_at,
               c.scheduled_at,
               COUNT(ml.id)::int AS total,
               COUNT(CASE WHEN ml.status = 'queued'    THEN 1 END)::int AS queued,
               COUNT(CASE WHEN ml.status = 'sent'       THEN 1 END)::int AS sent,
               COUNT(CASE WHEN ml.status = 'delivered'  THEN 1 END)::int AS delivered,
               COUNT(CASE WHEN ml.status = 'read'       THEN 1 END)::int AS "read",
               COUNT(CASE WHEN ml.status = 'failed'      THEN 1 END)::int AS failed
        FROM campaign c
        LEFT JOIN campaign_target ct ON ct.campaign_id = c.id
        LEFT JOIN message_log ml ON ml.campaign_target_id = ct.id
        WHERE c.id = ${id} AND c.restaurant_id = ${restaurantId} AND c.account_id = ${accountId}
        GROUP BY c.id
      `,
    );

    if (!rows.length) {
      throw new NotFoundException('Campanha não encontrada');
    }

    const row = rows[0];
    return {
      ...this.mapCampaignRow(row),
      funnel: {
        total: row['total'] as number,
        queued: row['queued'] as number,
        sent: row['sent'] as number,
        delivered: row['delivered'] as number,
        read: row['read'] as number,
        failed: row['failed'] as number,
      },
    };
  }

  async preview(
    id: string,
    restaurantId: string,
  ): Promise<CampaignPreviewResponseDto> {
    const { accountId } = this.tenantContext.get();

    const campaignRows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
        SELECT segment_name, message_body, template_variables
        FROM campaign
        WHERE id = ${id} AND restaurant_id = ${restaurantId} AND account_id = ${accountId}
      `,
    );

    if (!campaignRows.length) {
      throw new NotFoundException('Campanha não encontrada');
    }

    const campaign = campaignRows[0];
    const targets = await this.findEligibleTargets(
      accountId,
      restaurantId,
      campaign['segment_name'] as string,
      1,
    );

    if (!targets.length) {
      throw new NotFoundException(
        'Nenhum cliente elegível (com opt-in) encontrado neste segmento',
      );
    }

    const target = targets[0];
    const restaurant = await this.restaurantsService.findOne(restaurantId);

    const resolvedValues = resolveTemplateVariables(
      campaign['template_variables'] as TemplateVariableMap,
      {
        customer: { name: target.name },
        restaurant: { name: restaurant['name'] as string },
      },
    );
    const renderedMessage = renderBody(
      campaign['message_body'] as string,
      resolvedValues,
    );

    return {
      customerName: target.name,
      phone: target.phone,
      renderedMessage,
    };
  }

  async dispatch(
    id: string,
    restaurantId: string,
    idempotencyKey: string,
    scheduledAt?: string,
  ): Promise<DispatchCampaignResponseDto> {
    const { accountId } = this.tenantContext.get();
    // BullMQ rejeita jobId com ":" a menos que tenha exatamente 3 segmentos — usa "-" para evitar a regra.
    const jobId = `dispatch-${idempotencyKey}`;

    const existingJob = await this.queue.getJob(jobId);
    if (existingJob) {
      const current = await this.getCampaignStatus(id, restaurantId, accountId);
      return { campaignId: id, status: current, estimatedSeconds: 0 };
    }

    const campaignRows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
        SELECT status, segment_name
        FROM campaign
        WHERE id = ${id} AND restaurant_id = ${restaurantId} AND account_id = ${accountId}
      `,
    );

    if (!campaignRows.length) {
      throw new NotFoundException('Campanha não encontrada');
    }
    if (campaignRows[0]['status'] !== 'draft') {
      throw new ConflictException(
        'Campanha já foi disparada ou não está em draft',
      );
    }

    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      const delayMs = scheduledDate.getTime() - Date.now();

      if (delayMs < MIN_SCHEDULE_DELAY_MS) {
        throw new BadRequestException(
          'O agendamento precisa ser pelo menos 5 minutos no futuro',
        );
      }

      // Enfileira antes de mudar o status — se o enqueue falhar, a campanha continua em draft.
      await this.queue.add(
        'dispatch',
        { campaignId: id, accountId, restaurantId },
        { jobId, delay: delayMs },
      );

      await this.db.runInTenantContext(
        accountId,
        (sql) => sql`
          UPDATE campaign
          SET status = 'scheduled', scheduled_at = ${scheduledDate}, scheduled_job_id = ${jobId}
          WHERE id = ${id} AND restaurant_id = ${restaurantId} AND account_id = ${accountId}
        `,
      );

      return {
        campaignId: id,
        status: 'scheduled',
        scheduledAt: scheduledDate.toISOString(),
      };
    }

    const segmentName = campaignRows[0]['segment_name'] as string;
    const targets = await this.findEligibleTargets(
      accountId,
      restaurantId,
      segmentName,
    );

    // Enfileira antes de mudar o status — se o enqueue falhar, a campanha continua em draft.
    await this.queue.add(
      'dispatch',
      { campaignId: id, accountId, restaurantId },
      { jobId },
    );

    await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
        UPDATE campaign SET status = 'sending', sent_at = now()
        WHERE id = ${id} AND restaurant_id = ${restaurantId} AND account_id = ${accountId}
      `,
    );

    const rateLimitPerSec =
      this.config.get<number>('campaign.rateLimitPerSec') ?? 10;

    return {
      campaignId: id,
      status: 'sending',
      estimatedSeconds: Math.ceil(targets.length / rateLimitPerSec),
    };
  }

  async cancelSchedule(id: string, restaurantId: string): Promise<void> {
    const { accountId } = this.tenantContext.get();

    const rows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
        SELECT status, scheduled_job_id FROM campaign
        WHERE id = ${id} AND restaurant_id = ${restaurantId} AND account_id = ${accountId}
      `,
    );

    if (!rows.length) {
      throw new NotFoundException('Campanha não encontrada');
    }
    if (rows[0]['status'] !== 'scheduled') {
      throw new ConflictException(
        'Apenas campanhas agendadas podem ser canceladas',
      );
    }

    const jobId = rows[0]['scheduled_job_id'] as string | null;
    if (jobId) {
      const job = await this.queue.getJob(jobId);
      if (job) await job.remove();
    }

    await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
        UPDATE campaign
        SET status = 'draft', scheduled_at = NULL, scheduled_job_id = NULL
        WHERE id = ${id} AND restaurant_id = ${restaurantId} AND account_id = ${accountId}
      `,
    );
  }

  async findEligibleTargets(
    accountId: string,
    restaurantId: string,
    segmentName: string,
    limit?: number,
  ): Promise<EligibleTarget[]> {
    const rows = await this.db.runInTenantContext(accountId, (sql) =>
      limit
        ? sql`
            SELECT c.id, c.phone, c.name
            FROM customer c
            JOIN customer_segment cs ON cs.customer_id = c.id
              AND cs.restaurant_id = c.restaurant_id
              AND cs.is_current = true
            WHERE c.restaurant_id = ${restaurantId}
              AND c.account_id = ${accountId}
              AND c.consent_whatsapp = true
              AND cs.segment_name = ${segmentName}
            LIMIT ${limit}
          `
        : sql`
            SELECT c.id, c.phone, c.name
            FROM customer c
            JOIN customer_segment cs ON cs.customer_id = c.id
              AND cs.restaurant_id = c.restaurant_id
              AND cs.is_current = true
            WHERE c.restaurant_id = ${restaurantId}
              AND c.account_id = ${accountId}
              AND c.consent_whatsapp = true
              AND cs.segment_name = ${segmentName}
          `,
    );

    return rows.map((r) => ({
      id: r['id'] as string,
      phone: r['phone'] as string,
      name: r['name'] as string,
    }));
  }

  async remove(id: string, restaurantId: string): Promise<void> {
    const { accountId } = this.tenantContext.get();

    const rows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
        SELECT status FROM campaign
        WHERE id = ${id} AND restaurant_id = ${restaurantId} AND account_id = ${accountId}
      `,
    );

    if (!rows.length) {
      throw new NotFoundException('Campanha não encontrada');
    }
    if (rows[0]['status'] !== 'draft') {
      throw new ConflictException(
        'Apenas campanhas em rascunho podem ser excluídas',
      );
    }

    await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
        DELETE FROM campaign
        WHERE id = ${id} AND restaurant_id = ${restaurantId} AND account_id = ${accountId}
          AND status = 'draft'
      `,
    );
  }

  private async getCampaignStatus(
    id: string,
    restaurantId: string,
    accountId: string,
  ): Promise<string> {
    const rows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
        SELECT status FROM campaign
        WHERE id = ${id} AND restaurant_id = ${restaurantId} AND account_id = ${accountId}
      `,
    );
    return (rows[0]?.['status'] as string) ?? 'sending';
  }

  private mapCampaignRow(row: Record<string, unknown>): CampaignResponseDto {
    return {
      id: row['id'] as string,
      name: row['name'] as string,
      segmentName: row['segment_name'] as string,
      templateName: row['template_name'] as string,
      contentSid: row['content_sid'] as string,
      messageBody: row['message_body'] as string,
      templateVariables: row['template_variables'] as TemplateVariableMap,
      status: row['status'] as string,
      totalTargets: row['total_targets'] as number,
      createdAt: row['created_at'] as Date,
      sentAt: (row['sent_at'] as Date | null) ?? null,
      scheduledAt: (row['scheduled_at'] as Date | null) ?? null,
    };
  }
}
