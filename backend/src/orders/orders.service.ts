import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import type { OrderListResponseDto, OrderResponseDto } from './dto/order-response.dto';

export interface UpsertOrderData {
  restaurantId: string;
  accountId: string;
  customerId: string;
  externalId: string;
  status: string;
  totalAmount: number;
  orderedAt: Date;
  items: Array<{
    externalId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly db: DatabaseService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async upsertOrder(data: UpsertOrderData): Promise<{ orderId: string; isNew: boolean }> {
    return this.db.runInTenantContext(data.accountId, async (sql) => {
      // Try inserting; if conflict (duplicate external_id) return existing id
      const insertRows = await sql`
        INSERT INTO restaurant_order
          (account_id, restaurant_id, customer_id, external_id, status, total_amount, ordered_at)
        VALUES
          (${data.accountId}, ${data.restaurantId}, ${data.customerId},
           ${data.externalId}, ${data.status}, ${data.totalAmount}, ${data.orderedAt})
        ON CONFLICT (restaurant_id, external_id) DO NOTHING
        RETURNING id
      `;

      if (!insertRows.length) {
        // Conflict: order already exists
        const existing = await sql`
          SELECT id FROM restaurant_order
          WHERE restaurant_id = ${data.restaurantId}
            AND external_id   = ${data.externalId}
            AND account_id    = ${data.accountId}
        `;
        return { orderId: existing[0]['id'] as string, isNew: false };
      }

      const orderId = insertRows[0]['id'] as string;

      for (const item of data.items) {
        await sql`
          INSERT INTO order_item (order_id, external_id, name, quantity, unit_price, total_price)
          VALUES (${orderId}, ${item.externalId || null}, ${item.name},
                  ${item.quantity}, ${item.unitPrice}, ${item.totalPrice})
        `;
      }

      return { orderId, isNew: true };
    });
  }

  async findAll(
    restaurantId: string,
    page: number,
    limit: number,
    status?: string,
    from?: string,
    to?: string,
  ): Promise<OrderListResponseDto> {
    const { accountId } = this.tenantContext.get();
    const offset = (page - 1) * limit;

    const statusFilter = status ?? null;
    const fromFilter = from ? new Date(from) : null;
    const toFilter = to ? new Date(to) : null;

    const [rows, countRows] = await Promise.all([
      this.db.runInTenantContext(accountId, (sql) => sql`
        SELECT id, restaurant_id, customer_id, external_id, status,
               total_amount::float AS total_amount, ordered_at, created_at
        FROM restaurant_order
        WHERE restaurant_id = ${restaurantId}
          AND account_id    = ${accountId}
          AND (${statusFilter}::text IS NULL OR status = ${statusFilter})
          AND (${fromFilter}::timestamptz IS NULL OR ordered_at >= ${fromFilter})
          AND (${toFilter}::timestamptz IS NULL OR ordered_at <= ${toFilter})
        ORDER BY ordered_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `),
      this.db.runInTenantContext(accountId, (sql) => sql`
        SELECT COUNT(*)::int AS total
        FROM restaurant_order
        WHERE restaurant_id = ${restaurantId}
          AND account_id    = ${accountId}
          AND (${statusFilter}::text IS NULL OR status = ${statusFilter})
          AND (${fromFilter}::timestamptz IS NULL OR ordered_at >= ${fromFilter})
          AND (${toFilter}::timestamptz IS NULL OR ordered_at <= ${toFilter})
      `),
    ]);

    return {
      data: rows.map(this.mapOrderRow),
      total: countRows[0]['total'] as number,
      page,
      limit,
    };
  }

  private mapOrderRow(row: Record<string, unknown>): OrderResponseDto {
    return {
      id:           row['id'] as string,
      restaurantId: row['restaurant_id'] as string,
      customerId:   row['customer_id'] as string,
      externalId:   row['external_id'] as string,
      status:       row['status'] as string,
      totalAmount:  row['total_amount'] as number,
      orderedAt:    row['ordered_at'] as Date,
      createdAt:    row['created_at'] as Date,
    };
  }
}
