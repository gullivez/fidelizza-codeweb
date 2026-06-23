import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import { SegmentsService } from '../segments/segments.service';
import type {
  DashboardPeriod,
  DashboardResponseDto,
  LastCampaignDto,
  RfmDistributionDto,
  WhatsappStatusDto,
} from './dto/dashboard-response.dto';

const PERIOD_DAYS: Record<DashboardPeriod, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly tenantContext: TenantContextService,
    private readonly segmentsService: SegmentsService,
  ) {}

  async getDashboard(
    restaurantId: string,
    period: DashboardPeriod,
  ): Promise<DashboardResponseDto> {
    const { accountId } = this.tenantContext.get();
    const days = PERIOD_DAYS[period];
    const now = new Date();
    const currentStart = new Date(now.getTime() - days * 86_400_000);
    const previousStart = new Date(now.getTime() - 2 * days * 86_400_000);

    const result = await this.db.runInTenantContext(accountId, async (sql) => {
      const [kpiRow] = await sql`
        SELECT
          COALESCE(SUM(revenue_attributed) FILTER (WHERE order_placed_at >= ${currentStart}), 0)::float AS revenue_current,
          COALESCE(SUM(revenue_attributed) FILTER (WHERE order_placed_at >= ${previousStart} AND order_placed_at < ${currentStart}), 0)::float AS revenue_previous,
          COUNT(DISTINCT customer_id) FILTER (WHERE order_placed_at >= ${currentStart})::int AS reactivated,
          COUNT(*) FILTER (WHERE order_placed_at >= ${currentStart})::int AS conversions_current
        FROM conversion
        WHERE restaurant_id = ${restaurantId}
          AND account_id    = ${accountId}
      `;

      const [deliveredRow] = await sql`
        SELECT COUNT(*)::int AS delivered_count
        FROM message_log
        WHERE restaurant_id = ${restaurantId}
          AND account_id    = ${accountId}
          AND status IN ('delivered','read')
          AND delivered_at >= ${currentStart}
      `;

      const [campaignsSentRow] = await sql`
        SELECT COUNT(*)::int AS campaigns_sent
        FROM campaign
        WHERE restaurant_id = ${restaurantId}
          AND account_id    = ${accountId}
          AND status         = 'sent'
          AND sent_at        >= ${currentStart}
      `;

      const [lastCampaignRow] = await sql`
        SELECT id, name
        FROM campaign
        WHERE restaurant_id = ${restaurantId}
          AND account_id    = ${accountId}
          AND status         = 'sent'
          AND sent_at        IS NOT NULL
        ORDER BY sent_at DESC
        LIMIT 1
      `;

      let lastCampaign: LastCampaignDto | null = null;
      if (lastCampaignRow) {
        const campaignId = lastCampaignRow['id'] as string;

        const [funnelRow] = await sql`
          SELECT
            COUNT(*) FILTER (WHERE ml.status IN ('sent','delivered','read'))::int AS sent,
            COUNT(*) FILTER (WHERE ml.status IN ('delivered','read'))::int        AS delivered,
            COUNT(*) FILTER (WHERE ml.status = 'read')::int                       AS read
          FROM message_log ml
          JOIN campaign_target ct ON ct.id = ml.campaign_target_id
          WHERE ct.campaign_id   = ${campaignId}
            AND ml.restaurant_id = ${restaurantId}
            AND ml.account_id    = ${accountId}
        `;

        const [convRow] = await sql`
          SELECT COUNT(*)::int AS orders, COALESCE(SUM(revenue_attributed), 0)::float AS revenue
          FROM conversion
          WHERE campaign_id   = ${campaignId}
            AND restaurant_id = ${restaurantId}
            AND account_id    = ${accountId}
        `;

        lastCampaign = {
          name: lastCampaignRow['name'] as string,
          sent: funnelRow['sent'] as number,
          delivered: funnelRow['delivered'] as number,
          read: funnelRow['read'] as number,
          orders: convRow['orders'] as number,
          revenue: convRow['revenue'] as number,
        };
      }

      return { kpiRow, deliveredRow, campaignsSentRow, lastCampaign };
    });

    const revenueCurrent = result.kpiRow['revenue_current'] as number;
    const revenuePrevious = result.kpiRow['revenue_previous'] as number;
    const reactivated = result.kpiRow['reactivated'] as number;
    const conversionsCurrent = result.kpiRow['conversions_current'] as number;
    const deliveredCount = result.deliveredRow['delivered_count'] as number;
    const campaignsSent = result.campaignsSentRow['campaigns_sent'] as number;

    const revenueDelta =
      revenuePrevious > 0
        ? Math.round(
            ((revenueCurrent - revenuePrevious) / revenuePrevious) * 1000,
          ) / 10
        : revenueCurrent > 0
          ? 100
          : 0;

    const conversion =
      deliveredCount > 0
        ? Math.round((conversionsCurrent / deliveredCount) * 1000) / 10
        : 0;

    return {
      kpis: {
        revenue: revenueCurrent,
        revenueDelta,
        conversion,
        reactivated,
        campaignsSent,
      },
      lastCampaign: result.lastCampaign,
      cost: null,
      revenueNet: null,
    };
  }

  async getRfmDistribution(restaurantId: string): Promise<RfmDistributionDto> {
    const stats = await this.segmentsService.getStats(restaurantId);
    const counts: Record<string, number> = {};
    for (const segment of stats.segments) {
      counts[segment.name] = segment.count;
    }

    return {
      champions: counts['champions'] ?? 0,
      new: counts['new'] ?? 0,
      atRisk: counts['at_risk'] ?? 0,
      inactive: counts['inactive'] ?? 0,
    };
  }

  getWhatsappStatus(): Promise<WhatsappStatusDto> {
    // Quality rating real da Meta chega no Sprint 7 (Meta Cloud API).
    // Hoje rodamos em Twilio sandbox — não há o que medir além disso.
    return Promise.resolve({
      status: 'sandbox',
      label: 'Número em modo sandbox',
      healthy: true,
    });
  }
}
