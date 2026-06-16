import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class RfmEngineService {
  constructor(private readonly db: DatabaseService) {}

  async recalculate(accountId: string, restaurantId: string): Promise<number> {
    return this.db.runInTenantContext(accountId, async (sql) => {
      // Phase A: ensure the 4 segment metadata rows exist for this restaurant
      await sql`
        INSERT INTO segment (restaurant_id, account_id, name, label, color, display_order)
        VALUES
          (${restaurantId}, ${accountId}, 'champions', 'Campeões',  '#f59e0b', 1),
          (${restaurantId}, ${accountId}, 'new',       'Novos',     '#3b82f6', 2),
          (${restaurantId}, ${accountId}, 'at_risk',   'Em Risco',  '#ef4444', 3),
          (${restaurantId}, ${accountId}, 'inactive',  'Inativos',  '#6b7280', 4)
        ON CONFLICT (restaurant_id, name) DO NOTHING
      `;

      // Phase B: classify all customers using CUME_DIST in SQL.
      // Materialized into a temp table so the CTE runs only once.
      // ON COMMIT DROP ensures cleanup even on rollback.
      await sql`
        CREATE TEMP TABLE _rfm_classified ON COMMIT DROP AS
        WITH rfm AS (
          SELECT
            id,
            total_orders,
            CUME_DIST() OVER (ORDER BY last_order_at ASC NULLS LAST)  AS recency_score,
            CUME_DIST() OVER (ORDER BY total_orders   ASC NULLS LAST)  AS frequency_score,
            CUME_DIST() OVER (ORDER BY total_spent    ASC NULLS LAST)  AS monetary_score
          FROM customer
          WHERE restaurant_id = ${restaurantId}
            AND account_id    = ${accountId}
            AND total_orders >= 1
        )
        SELECT *,
          CASE
            WHEN total_orders = 1
              THEN 'new'
            WHEN recency_score >= 0.5
             AND (frequency_score + monetary_score) / 2.0 >= 0.5
              THEN 'champions'
            WHEN recency_score >= 0.5
             AND (frequency_score + monetary_score) / 2.0 < 0.5
              THEN 'new'
            WHEN recency_score < 0.5
             AND (frequency_score + monetary_score) / 2.0 >= 0.5
              THEN 'at_risk'
            ELSE 'inactive'
          END AS segment_name
        FROM rfm
      `;

      // Phase C1: close rows where segment changed
      await sql`
        UPDATE customer_segment cs
        SET is_current = false,
            valid_to   = now()
        FROM _rfm_classified r
        WHERE cs.customer_id   = r.id
          AND cs.is_current    = true
          AND cs.segment_name != r.segment_name
          AND cs.restaurant_id = ${restaurantId}
          AND cs.account_id    = ${accountId}
      `;

      // Phase C2: update scores for rows where segment is unchanged
      await sql`
        UPDATE customer_segment cs
        SET evaluated_at    = now(),
            recency_score   = r.recency_score,
            frequency_score = r.frequency_score,
            monetary_score  = r.monetary_score
        FROM _rfm_classified r
        WHERE cs.customer_id  = r.id
          AND cs.is_current   = true
          AND cs.segment_name = r.segment_name
          AND cs.restaurant_id = ${restaurantId}
          AND cs.account_id    = ${accountId}
      `;

      // Phase C3: insert new rows for new customers or customers whose segment changed.
      // C1 already closed changed rows, so NOT EXISTS on is_current=true correctly
      // picks up both brand-new customers and those that just had their row closed
      // (within-transaction visibility: this statement sees C1's writes).
      await sql`
        INSERT INTO customer_segment
          (customer_id, restaurant_id, account_id, segment_name,
           recency_score, frequency_score, monetary_score)
        SELECT
          r.id,
          ${restaurantId},
          ${accountId},
          r.segment_name,
          r.recency_score,
          r.frequency_score,
          r.monetary_score
        FROM _rfm_classified r
        WHERE NOT EXISTS (
          SELECT 1
          FROM customer_segment cs
          WHERE cs.customer_id   = r.id
            AND cs.is_current    = true
            AND cs.restaurant_id = ${restaurantId}
            AND cs.account_id    = ${accountId}
        )
      `;

      // Phase D: return count for logging
      const countRows = await sql`SELECT COUNT(*)::int AS count FROM _rfm_classified`;
      return countRows[0]['count'] as number;
    });
  }
}
