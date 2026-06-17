import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { DatabaseService } from '../database/database.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import type {
  SegmentDto,
  SegmentStatsResponseDto,
  RecalculateResponseDto,
} from './dto/segment-stats-response.dto';

// Metadata is fixed by design — 4 segments, defined in the spec.
const SEGMENT_META: Record<
  string,
  { label: string; color: string; order: number }
> = {
  champions: { label: 'Campeões', color: '#f59e0b', order: 1 },
  new: { label: 'Novos', color: '#3b82f6', order: 2 },
  at_risk: { label: 'Em Risco', color: '#ef4444', order: 3 },
  inactive: { label: 'Inativos', color: '#6b7280', order: 4 },
};

@Injectable()
export class SegmentsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly tenantContext: TenantContextService,
    @InjectQueue('segmentation.recalculate') private readonly queue: Queue,
  ) {}

  async getStats(restaurantId: string): Promise<SegmentStatsResponseDto> {
    const { accountId } = this.tenantContext.get();

    // Single pivot query — no JOINs, no GROUP BY, no multi-query interaction.
    // COALESCE handles the case where a segment has zero classified customers.
    const [row] = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
        SELECT
          COALESCE(SUM(CASE WHEN segment_name = 'champions' THEN 1 END), 0)::int AS champions,
          COALESCE(SUM(CASE WHEN segment_name = 'new'       THEN 1 END), 0)::int AS new_seg,
          COALESCE(SUM(CASE WHEN segment_name = 'at_risk'   THEN 1 END), 0)::int AS at_risk,
          COALESCE(SUM(CASE WHEN segment_name = 'inactive'  THEN 1 END), 0)::int AS inactive,
          COUNT(*)::int                                                            AS total,
          MAX(evaluated_at)                                                        AS last_evaluated_at
        FROM customer_segment
        WHERE restaurant_id = ${restaurantId}
          AND account_id    = ${accountId}
          AND is_current    = true
      `,
    );

    const counts: Record<string, number> = {
      champions: row['champions'] as number,
      new: row['new_seg'] as number,
      at_risk: row['at_risk'] as number,
      inactive: row['inactive'] as number,
    };
    const total = row['total'] as number;

    const segments: SegmentDto[] = Object.entries(SEGMENT_META)
      .sort((a, b) => a[1].order - b[1].order)
      .map(([name, meta]) => ({
        name,
        label: meta.label,
        color: meta.color,
        count: counts[name] ?? 0,
        percentage:
          total > 0 ? Math.round(((counts[name] ?? 0) / total) * 1000) / 10 : 0,
      }));

    return {
      segments,
      total,
      lastEvaluatedAt: (row['last_evaluated_at'] as Date | null) ?? null,
    };
  }

  async enqueueRecalculate(
    restaurantId: string,
  ): Promise<RecalculateResponseDto> {
    const { accountId } = this.tenantContext.get();

    const job = await this.queue.add('recalculate', {
      accountId,
      restaurantId,
    });

    return {
      jobId: job.id ?? '',
      message: 'Recálculo enfileirado',
    };
  }
}
