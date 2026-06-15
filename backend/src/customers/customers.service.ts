import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import type {
  CustomerResponseDto,
  CustomerDetailResponseDto,
  CustomerListResponseDto,
  OrderSummaryDto,
} from './dto/customer-response.dto';

@Injectable()
export class CustomersService {
  constructor(
    private readonly db: DatabaseService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async upsertByPhone(
    restaurantId: string,
    accountId: string,
    phone: string,
    name: string,
  ): Promise<{ id: string; isNew: boolean }> {
    const rows = await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
      INSERT INTO customer (account_id, restaurant_id, phone, name)
      VALUES (${accountId}, ${restaurantId}, ${phone}, ${name})
      ON CONFLICT (restaurant_id, phone)
      DO UPDATE SET name = EXCLUDED.name
      RETURNING id, (xmax = 0) AS is_new
    `,
    );
    return {
      id: rows[0]['id'] as string,
      isNew: rows[0]['is_new'] as boolean,
    };
  }

  async updateAggregates(
    customerId: string,
    restaurantId: string,
    accountId: string,
  ): Promise<void> {
    await this.db.runInTenantContext(
      accountId,
      (sql) => sql`
      UPDATE customer
      SET
        total_orders = (
          SELECT COUNT(*)
          FROM restaurant_order
          WHERE customer_id   = ${customerId}
            AND restaurant_id = ${restaurantId}
            AND status != 'cancelled'
        ),
        total_spent = (
          SELECT COALESCE(SUM(total_amount), 0)
          FROM restaurant_order
          WHERE customer_id   = ${customerId}
            AND restaurant_id = ${restaurantId}
            AND status != 'cancelled'
        ),
        avg_ticket = (
          SELECT COALESCE(AVG(total_amount), 0)
          FROM restaurant_order
          WHERE customer_id   = ${customerId}
            AND restaurant_id = ${restaurantId}
            AND status != 'cancelled'
        ),
        last_order_at = (
          SELECT MAX(ordered_at)
          FROM restaurant_order
          WHERE customer_id   = ${customerId}
            AND restaurant_id = ${restaurantId}
            AND status != 'cancelled'
        )
      WHERE id            = ${customerId}
        AND restaurant_id = ${restaurantId}
        AND account_id    = ${accountId}
    `,
    );
  }

  async findAll(
    restaurantId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<CustomerListResponseDto> {
    const { accountId } = this.tenantContext.get();
    const offset = (page - 1) * limit;

    if (search) {
      const pattern = `%${search}%`;
      const [rows, countRows] = await Promise.all([
        this.db.runInTenantContext(
          accountId,
          (sql) => sql`
          SELECT id, restaurant_id, phone, name, total_orders,
                 total_spent::float AS total_spent,
                 avg_ticket::float  AS avg_ticket,
                 last_order_at, created_at
          FROM customer
          WHERE restaurant_id = ${restaurantId}
            AND account_id    = ${accountId}
            AND (name ILIKE ${pattern} OR phone ILIKE ${pattern})
          ORDER BY last_order_at DESC NULLS LAST
          LIMIT ${limit} OFFSET ${offset}
        `,
        ),
        this.db.runInTenantContext(
          accountId,
          (sql) => sql`
          SELECT COUNT(*)::int AS total
          FROM customer
          WHERE restaurant_id = ${restaurantId}
            AND account_id    = ${accountId}
            AND (name ILIKE ${pattern} OR phone ILIKE ${pattern})
        `,
        ),
      ]);
      return {
        data: rows.map((r) => this.mapCustomerRow(r)),
        total: countRows[0]['total'] as number,
        page,
        limit,
      };
    }

    const [rows, countRows] = await Promise.all([
      this.db.runInTenantContext(
        accountId,
        (sql) => sql`
        SELECT id, restaurant_id, phone, name, total_orders,
               total_spent::float AS total_spent,
               avg_ticket::float  AS avg_ticket,
               last_order_at, created_at
        FROM customer
        WHERE restaurant_id = ${restaurantId}
          AND account_id    = ${accountId}
        ORDER BY last_order_at DESC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `,
      ),
      this.db.runInTenantContext(
        accountId,
        (sql) => sql`
        SELECT COUNT(*)::int AS total
        FROM customer
        WHERE restaurant_id = ${restaurantId}
          AND account_id    = ${accountId}
      `,
      ),
    ]);

    return {
      data: rows.map((r) => this.mapCustomerRow(r)),
      total: countRows[0]['total'] as number,
      page,
      limit,
    };
  }

  async findOne(
    restaurantId: string,
    customerId: string,
  ): Promise<CustomerDetailResponseDto> {
    const { accountId } = this.tenantContext.get();

    const [customerRows, orderRows] = await Promise.all([
      this.db.runInTenantContext(
        accountId,
        (sql) => sql`
        SELECT id, restaurant_id, phone, name, total_orders,
               total_spent::float AS total_spent,
               avg_ticket::float  AS avg_ticket,
               last_order_at, created_at
        FROM customer
        WHERE id            = ${customerId}
          AND restaurant_id = ${restaurantId}
          AND account_id    = ${accountId}
      `,
      ),
      this.db.runInTenantContext(
        accountId,
        (sql) => sql`
        SELECT id, external_id, status, total_amount::float AS total_amount, ordered_at
        FROM restaurant_order
        WHERE customer_id   = ${customerId}
          AND restaurant_id = ${restaurantId}
          AND account_id    = ${accountId}
        ORDER BY ordered_at DESC
        LIMIT 10
      `,
      ),
    ]);

    if (!customerRows.length) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException('Cliente não encontrado');
    }

    return {
      ...this.mapCustomerRow(customerRows[0]),
      recentOrders: orderRows.map(
        (r) =>
          ({
            id: r['id'] as string,
            externalId: r['external_id'] as string,
            status: r['status'] as string,
            totalAmount: r['total_amount'] as number,
            orderedAt: r['ordered_at'] as Date,
          }) satisfies OrderSummaryDto,
      ),
    };
  }

  private mapCustomerRow(row: Record<string, unknown>): CustomerResponseDto {
    return {
      id: row['id'] as string,
      restaurantId: row['restaurant_id'] as string,
      phone: row['phone'] as string,
      name: row['name'] as string,
      totalOrders: row['total_orders'] as number,
      totalSpent: row['total_spent'] as number,
      avgTicket: row['avg_ticket'] as number,
      lastOrderAt: (row['last_order_at'] as Date | null) ?? null,
      createdAt: row['created_at'] as Date,
    };
  }
}
